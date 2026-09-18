"use server";

import { revalidatePath } from "next/cache";
import { getTranslations } from "next-intl/server";
import { cookies } from "next/headers";
import { z } from "zod";
import { locales } from "@/i18n/routing";
import { ADMIN_LOCALE_COOKIE } from "@/lib/admin-locale";
import { auth, signIn, signOut, canManageMenu } from "@/lib/auth";
import { db } from "@/lib/db";
import { ORDER_STATUSES } from "@/lib/orders";
import { findItem } from "@/lib/menu";

/* ---------------------------------------------------------------
   Every action re-checks the session. A server action is a public HTTP
   endpoint — hiding a button in the UI protects nothing.
   --------------------------------------------------------------- */

async function requireStaff() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("unauthorised");
  return session.user;
}

export async function signInAction(
  _previous: { error?: string } | undefined,
  formData: FormData,
): Promise<{ error?: string }> {
  const email = String(formData.get("email") ?? "");
  const password = String(formData.get("password") ?? "");

  try {
    await signIn("credentials", { email, password, redirectTo: "/admin" });
    return {};
  } catch (error) {
    // NextAuth signals a successful redirect by throwing; let that through.
    if (
      error instanceof Error &&
      (error as { digest?: string }).digest?.startsWith("NEXT_REDIRECT")
    ) {
      throw error;
    }
    // Never say which half was wrong.
    const t = await getTranslations("admin");
    return { error: t("signInFailed") };
  }
}

export async function signOutAction() {
  await signOut({ redirectTo: "/admin/login" });
}

const statusSchema = z.object({
  orderId: z.string().min(1),
  status: z.enum(ORDER_STATUSES),
});

export async function updateOrderStatus(formData: FormData) {
  await requireStaff();

  const parsed = statusSchema.safeParse({
    orderId: formData.get("orderId"),
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error("invalidStatus");

  await db.order.update({
    where: { id: parsed.data.orderId },
    data: {
      status: parsed.data.status,
      // Cash is collected on handover, so completing the order is the moment
      // the money actually arrives.
      ...(parsed.data.status === "COMPLETED" ? { paymentStatus: "PAID" } : {}),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/admin/orders");
}

const availabilitySchema = z.object({
  itemId: z.string().min(1),
  soldOut: z.enum(["true", "false"]),
});

/** Managers may mark a dish sold out; only the owner changes the menu itself. */
export async function setItemAvailability(formData: FormData) {
  const user = await requireStaff();

  const parsed = availabilitySchema.safeParse({
    itemId: formData.get("itemId"),
    soldOut: formData.get("soldOut"),
  });
  if (!parsed.success) throw new Error("invalidItem");

  // Only ids that exist on the printed menu.
  if (!findItem(parsed.data.itemId)) throw new Error("unknownItem");

  const soldOut = parsed.data.soldOut === "true";

  await db.itemAvailability.upsert({
    where: { itemId: parsed.data.itemId },
    update: { soldOut, updatedById: user.id },
    create: { itemId: parsed.data.itemId, soldOut, updatedById: user.id },
  });

  revalidatePath("/admin/availability");
  revalidatePath("/en/menu");
  revalidatePath("/ur/menu");
}

/** Owner-only: clear every sold-out flag at the start of a new day. */
export async function clearAllSoldOut() {
  const user = await requireStaff();
  if (!canManageMenu(user.role)) throw new Error("forbidden");

  await db.itemAvailability.updateMany({ data: { soldOut: false } });

  revalidatePath("/admin/availability");
  revalidatePath("/en/menu");
  revalidatePath("/ur/menu");
}

/* ---------------- language ---------------- */

export async function setAdminLocale(formData: FormData) {
  const value = String(formData.get("locale") ?? "en");
  const locale = locales.includes(value as (typeof locales)[number]) ? value : "en";

  const store = await cookies();
  store.set(ADMIN_LOCALE_COOKIE, locale, {
    path: "/admin",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
  });

  // Every admin page renders text, so all of them are stale after this.
  revalidatePath("/admin", "layout");
}

/* ---------------- reviews ---------------- */

const reviewActionSchema = z.object({
  reviewId: z.string().min(1),
  action: z.enum(["approve", "hide", "unhide", "delete"]),
});

export async function moderateReview(formData: FormData) {
  await requireStaff();

  const parsed = reviewActionSchema.safeParse({
    reviewId: formData.get("reviewId"),
    action: formData.get("action"),
  });
  if (!parsed.success) throw new Error("invalidReviewAction");

  const { reviewId, action } = parsed.data;

  if (action === "delete") {
    await db.review.delete({ where: { id: reviewId } });
  } else {
    await db.review.update({
      where: { id: reviewId },
      data: {
        approved: action === "approve" ? true : undefined,
        hidden: action === "hide" ? true : action === "unhide" ? false : undefined,
        reviewedAt: new Date(),
      },
    });
  }

  revalidatePath("/admin/reviews");
  revalidatePath("/en/reviews");
  revalidatePath("/ur/reviews");
}

/* ---------------- enquiries ---------------- */

const enquiryActionSchema = z.object({
  enquiryId: z.string().min(1),
  status: z.enum(["NEW", "HANDLED"]),
});

export async function setEnquiryStatus(formData: FormData) {
  await requireStaff();

  const parsed = enquiryActionSchema.safeParse({
    enquiryId: formData.get("enquiryId"),
    status: formData.get("status"),
  });
  if (!parsed.success) throw new Error("invalidEnquiryAction");

  await db.enquiry.update({
    where: { id: parsed.data.enquiryId },
    data: { status: parsed.data.status },
  });

  revalidatePath("/admin/messages");
}
