import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Star } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { scenePhoto } from "@/lib/photos";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ReviewForm from "@/components/reviews/ReviewForm";
import ScrollImage from "@/components/motion/ScrollImage";
import {
  Reveal,
  GoldRule,
  SplitHeading,
  ScrollProgress,
} from "@/components/motion/primitives";

// New reviews should appear soon after a staff member approves them.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "reviews" });
  return { title: t("title"), description: t("subtitle") };
}

function Stars({ rating }: { rating: number }) {
  return (
    <span className="flex gap-0.5" aria-label={`${rating}/5`}>
      {[1, 2, 3, 4, 5].map((value) => (
        <Star
          key={value}
          className={`h-4 w-4 ${
            value <= rating ? "fill-gold-500 text-gold-500" : "text-paper-400"
          }`}
        />
      ))}
    </span>
  );
}

export default async function ReviewsPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("reviews");
  const feast = scenePhoto("feast");

  // An unreachable database shows the "no reviews yet" state rather than
  // taking the page down.
  let reviews: Awaited<ReturnType<typeof db.review.findMany>> = [];
  try {
    reviews = await db.review.findMany({
      where: { approved: true, hidden: false },
      orderBy: { createdAt: "desc" },
      take: 60,
    });
  } catch (error) {
    console.error("Could not load reviews", error);
  }

  const average =
    reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(locale === "ur" ? "ur-PK" : "en-PK", {
      dateStyle: "medium",
      timeZone: "Asia/Karachi",
    }).format(date);

  return (
    <>
      <ScrollProgress />
      <SiteHeader />

      <main className="bg-paper-100">
        <section className="bg-pks-900 relative isolate overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-24">
          <ScrollImage
            photo={feast}
            alt=""
            effect="drift"
            rounded={false}
            priority
            sizes="100vw"
            className="absolute inset-0 -z-10"
            imageClassName="opacity-25"
          />
          <div className="from-pks-950 via-pks-900/92 to-pks-800/88 absolute inset-0 -z-10 bg-gradient-to-b" />

          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <Reveal>
              <p className="text-gold-300 text-[11px] tracking-[0.34em] uppercase">
                {t("eyebrow")}
              </p>
            </Reveal>
            <GoldRule className="mt-5 w-24 origin-left" />
            <SplitHeading
              immediate
              as="h1"
              text={t("title")}
              className="font-display mt-7 text-4xl leading-[1.06] text-white sm:text-5xl xl:text-6xl"
            />
            <Reveal delay={0.25}>
              <p className="mt-6 max-w-2xl text-base leading-relaxed text-white/70 sm:text-lg">
                {t("subtitle")}
              </p>
            </Reveal>

            {/* Only shown once there is something real to average. */}
            {reviews.length > 0 && (
              <Reveal delay={0.35}>
                <div className="mt-9 inline-flex items-center gap-4 rounded-2xl border border-white/20 bg-white/5 px-6 py-4">
                  <span className="font-display text-gold-300 text-4xl tabular-nums">
                    {average.toFixed(1)}
                  </span>
                  <span>
                    <Stars rating={Math.round(average)} />
                    <span className="mt-1 block text-xs text-white/60">
                      {t("basedOn", { count: reviews.length })}
                    </span>
                  </span>
                </div>
              </Reveal>
            )}
          </div>
        </section>

        <section className="py-16 sm:py-24">
          <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16">
            <div>
              {reviews.length === 0 ? (
                <div className="border-paper-300 rounded-2xl border border-dashed bg-white py-20 text-center">
                  <p className="text-ink-400 text-sm">{t("empty")}</p>
                </div>
              ) : (
                <ul className="space-y-5">
                  {reviews.map((review, index) => (
                    <Reveal key={review.id} delay={Math.min(index, 6) * 0.06}>
                      <li className="border-paper-300 rounded-2xl border bg-white p-6">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <p className="text-ink-800 text-sm font-semibold">
                              {review.name}
                            </p>
                            <p className="text-ink-400 mt-0.5 text-xs">
                              {formatDate(review.createdAt)}
                            </p>
                          </div>
                          <Stars rating={review.rating} />
                        </div>
                        {/* A review written in Urdu renders right-to-left even
                            on the English page, and vice versa. */}
                        <p
                          className="text-ink-600 mt-4 text-sm leading-relaxed"
                          lang={review.locale}
                          dir={review.locale === "ur" ? "rtl" : "ltr"}
                        >
                          {review.comment}
                        </p>
                      </li>
                    </Reveal>
                  ))}
                </ul>
              )}
            </div>

            <div className="lg:sticky lg:top-32 lg:self-start">
              <Reveal>
                <SplitHeading
                  text={t("writeTitle")}
                  className="font-display text-ink-800 text-3xl"
                />
              </Reveal>
              <GoldRule className="mt-4 w-20 origin-left" />
              <Reveal delay={0.12}>
                <p className="text-ink-500 mt-4 text-sm leading-relaxed">
                  {t("writeSubtitle")}
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-7">
                  <ReviewForm />
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
