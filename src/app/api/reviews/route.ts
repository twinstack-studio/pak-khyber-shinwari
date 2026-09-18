import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { reviewSchema } from "@/lib/public-forms";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "invalidJson" }, { status: 400 });
  }

  const parsed = reviewSchema.safeParse(payload);
  if (!parsed.success) {
    const fields = parsed.error.flatten().fieldErrors;
    // A filled honeypot is a bot. Answer 201 so it does not learn anything,
    // and write nothing.
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

  try {
    // Nothing is published until a staff member reads it.
    await db.review.create({
      data: {
        name: parsed.data.name,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
        locale: parsed.data.locale,
        approved: false,
      },
    });
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Failed to save review", error);
    return NextResponse.json({ error: "serverError" }, { status: 500 });
  }
}
