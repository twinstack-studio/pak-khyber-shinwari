import { NextResponse } from "next/server";
import { Prisma } from "@/generated/prisma";
import { db } from "@/lib/db";
import {
  makeReference,
  normalisePhone,
  orderSchema,
  priceOrder,
} from "@/lib/orders";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalidJson" }, { status: 400 });
  }

  const parsed = orderSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "validation",
        // Field -> first message, which is all the form needs to mark inputs.
        fields: Object.fromEntries(
          Object.entries(parsed.error.flatten().fieldErrors).map(
            ([field, messages]) => [field, messages?.[0] ?? "invalid"],
          ),
        ),
        formErrors: parsed.error.flatten().formErrors,
      },
      { status: 400 },
    );
  }

  const input = parsed.data;

  // Prices come from the menu, never from the request body.
  const priced = priceOrder(input.items, input.paymentMethod);

  if (priced.unknownItems.length > 0) {
    return NextResponse.json(
      { error: "unknownItems", items: priced.unknownItems },
      { status: 400 },
    );
  }

  // A dish the kitchen switched off must not be orderable, even if it was on
  // the menu when this customer loaded the page an hour ago.
  const soldOut = await db.itemAvailability.findMany({
    where: {
      soldOut: true,
      itemId: { in: priced.lines.map((line) => line.itemId) },
    },
    select: { itemId: true },
  });

  if (soldOut.length > 0) {
    return NextResponse.json(
      { error: "soldOut", items: soldOut.map((row) => row.itemId) },
      { status: 409 },
    );
  }
  if (priced.lines.length === 0) {
    return NextResponse.json({ error: "cartEmpty" }, { status: 400 });
  }

  // References are random and short, so a collision is unlikely but possible.
  // Retry on the unique constraint rather than handing the customer an error.
  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const order = await db.order.create({
        data: {
          reference: makeReference(),
          customerName: input.customerName,
          phone: normalisePhone(input.phone),
          orderType: input.orderType,
          address: input.orderType === "DELIVERY" ? input.address || null : null,
          notes: input.notes || null,
          paymentMethod: input.paymentMethod,
          // Card and wallet orders will move to PAID once a gateway is wired
          // in; until then every order is settled on handover.
          paymentStatus: "PENDING",
          subtotal: priced.subtotal,
          taxRate: priced.taxRate,
          taxAmount: priced.taxAmount,
          total: priced.total,
          status: "PLACED",
          items: { create: priced.lines },
        },
        select: {
          reference: true,
          total: true,
          createdAt: true,
        },
      });

      return NextResponse.json(
        {
          reference: order.reference,
          total: order.total,
          createdAt: order.createdAt,
        },
        { status: 201 },
      );
    } catch (error) {
      const isReferenceClash =
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === "P2002";
      if (!isReferenceClash) {
        console.error("Failed to place order", error);
        return NextResponse.json({ error: "serverError" }, { status: 500 });
      }
      // Otherwise loop and try another reference.
    }
  }

  return NextResponse.json({ error: "referenceClash" }, { status: 500 });
}
