import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { enquirySchema, normalisePhone } from "@/lib/public-forms";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalidJson" }, { status: 400 });
  }

  const parsed = enquirySchema.safeParse(payload);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    if (fields.honeypot) return NextResponse.json({ ok: true }, { status: 201 });

    return NextResponse.json(
      {
        error: "validation",
        fields: Object.fromEntries(
          Object.entries(fields).map(([key, messages]) => [
            key,
            messages?.[0] ?? "invalid",
          ]),
        ),
      },
      { status: 400 },
    );
  }

  const input = parsed.data;

  try {
    await db.enquiry.create({
      data: {
        name: input.name,
        phone: normalisePhone(input.phone),
        email: input.email || null,
        kind: input.kind,
        // Guest count and date only mean anything for an event.
        guests: input.kind === "EVENT" ? (input.guests ?? null) : null,
        eventDate: input.kind === "EVENT" ? input.eventDate || null : null,
        message: input.message,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to save enquiry", error);
    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
