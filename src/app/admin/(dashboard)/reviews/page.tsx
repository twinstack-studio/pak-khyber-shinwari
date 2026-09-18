import { getTranslations } from "next-intl/server";
import { Star } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminLocale } from "@/lib/admin-locale";
import { moderateReview } from "../../actions";

export const dynamic = "force-dynamic";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`h-3.5 w-3.5 ${
            value <= rating ? "fill-gold-500 text-gold-500" : "text-paper-400"
          }`}
        />
      ))}
    </span>
  );
}

/**
 * Review moderation.
 *
 * Nothing a customer writes reaches the website until someone here reads it.
 * An open review box on a restaurant site fills with spam inside a week, and
 * the restaurant carries the consequences of whatever sits under its name.
 */
export default async function AdminReviewsPage() {
  const t = await getTranslations("admin");
  const locale = await getAdminLocale();

  const reviews = await db.review.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const pending = reviews.filter((review) => !review.approved);
  const published = reviews.filter((review) => review.approved && !review.hidden);
  const hidden = reviews.filter((review) => review.approved && review.hidden);

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(locale === "ur" ? "ur-PK" : "en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Karachi",
    }).format(date);

  function Card({ review }: { review: (typeof reviews)[number] }) {
    return (
      <li className="border-paper-300 rounded-2xl border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-ink-800 text-sm font-semibold">{review.name}</p>
            <p className="text-ink-400 mt-0.5 text-xs">
              {formatDate(review.createdAt)}
            </p>
          </div>
          <Stars rating={review.rating} />
        </div>

        {/* Rendered in the script it was written in, whichever way the panel
            is currently set. */}
        <p
          className="text-ink-600 mt-3.5 text-sm leading-relaxed"
          lang={review.locale}
          dir={review.locale === "ur" ? "rtl" : "ltr"}
        >
          {review.comment}
        </p>

        <div className="border-paper-300 mt-4 flex flex-wrap gap-2 border-t pt-4">
          {!review.approved && (
            <form action={moderateReview}>
              <input type="hidden" name="reviewId" value={review.id} />
              <input type="hidden" name="action" value="approve" />
              <button
                type="submit"
                className="bg-pks-500 hover:bg-pks-600 rounded-full px-4 py-1.5 text-xs font-semibold text-white transition-colors"
              >
                {t("approve")}
              </button>
            </form>
          )}

          {review.approved && !review.hidden && (
            <form action={moderateReview}>
              <input type="hidden" name="reviewId" value={review.id} />
              <input type="hidden" name="action" value="hide" />
              <button
                type="submit"
                className="border-paper-400 text-ink-600 hover:border-pks-500 hover:text-pks-600 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors"
              >
                {t("hide")}
              </button>
            </form>
          )}

          {review.approved && review.hidden && (
            <form action={moderateReview}>
              <input type="hidden" name="reviewId" value={review.id} />
              <input type="hidden" name="action" value="unhide" />
              <button
                type="submit"
                className="border-paper-400 text-ink-600 hover:border-pks-500 hover:text-pks-600 rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors"
              >
                {t("unhide")}
              </button>
            </form>
          )}

          <form action={moderateReview}>
            <input type="hidden" name="reviewId" value={review.id} />
            <input type="hidden" name="action" value="delete" />
            <button
              type="submit"
              className="text-ink-400 hover:text-pks-600 rounded-full px-3 py-1.5 text-xs transition-colors"
            >
              {t("deleteReview")}
            </button>
          </form>
        </div>
      </li>
    );
  }

  const sections = [
    { key: "reviewsPending", items: pending },
    { key: "reviewsPublished", items: published },
    { key: "reviewsHidden", items: hidden },
  ] as const;

  return (
    <>
      <h1 className="font-display text-ink-800 text-3xl">{t("reviewsTitle")}</h1>
      <p className="text-ink-400 mt-1 max-w-xl text-sm leading-relaxed">
        {t("reviewsIntro")}
      </p>

      {reviews.length === 0 ? (
        <div className="border-paper-300 mt-8 rounded-2xl border border-dashed bg-white py-20 text-center">
          <p className="text-ink-400 text-sm">{t("noReviews")}</p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {sections.map((section) =>
            section.items.length === 0 ? null : (
              <section key={section.key}>
                <h2 className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
                  {t(section.key)}
                  <span className="ms-2 tabular-nums">{section.items.length}</span>
                </h2>
                <ul className="mt-4 space-y-4">
                  {section.items.map((review) => (
                    <Card key={review.id} review={review} />
                  ))}
                </ul>
              </section>
            ),
          )}
        </div>
      )}
    </>
  );
}
