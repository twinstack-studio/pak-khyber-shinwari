import { z } from "zod";

/* ---------------------------------------------------------------
   Validation for the two forms any visitor can post to: reviews and
   enquiries. Both are public endpoints, so both are strict about length
   and neither trusts a single field.
   --------------------------------------------------------------- */

const PHONE = /^(?:\+?92|0)?3\d{2}[\s-]?\d{7}$/;

export function normalisePhone(input: string): string {
  const digits = input.replace(/[^\d]/g, "");
  if (digits.startsWith("92")) return `0${digits.slice(2)}`;
  if (digits.startsWith("3")) return `0${digits}`;
  return digits;
}

export const ENQUIRY_KINDS = ["GENERAL", "EVENT", "FEEDBACK"] as const;

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "nameTooShort").max(80),
  phone: z
    .string()
    .trim()
    .refine((value) => PHONE.test(value.replace(/[\s-]/g, "")), "phoneInvalid"),
  email: z
    .string()
    .trim()
    .email("emailInvalid")
    .max(120)
    .optional()
    .or(z.literal("")),
  kind: z.enum(ENQUIRY_KINDS).default("GENERAL"),
  guests: z.number().int().min(1).max(2000).optional().nullable(),
  eventDate: z.string().trim().max(40).optional().or(z.literal("")),
  message: z.string().trim().min(10, "messageTooShort").max(2000),
  // Bots fill in every field they find. A human never sees this one.
  honeypot: z.string().max(0).optional(),
});

export const reviewSchema = z.object({
  name: z.string().trim().min(2, "nameTooShort").max(60),
  rating: z.number().int().min(1, "ratingInvalid").max(5, "ratingInvalid"),
  comment: z.string().trim().min(10, "commentTooShort").max(1200),
  locale: z.enum(["en", "ur"]).default("en"),
  honeypot: z.string().max(0).optional(),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type ReviewInput = z.infer<typeof reviewSchema>;
