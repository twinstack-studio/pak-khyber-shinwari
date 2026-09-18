import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Sunrise, Sun, Moon, Users, Car, Flame, PackageCheck } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { scenePhoto, photoAlt } from "@/lib/photos";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import FloorPlan from "@/components/seating/FloorPlan";
import ScrollImage from "@/components/motion/ScrollImage";
import {
  Reveal,
  GoldRule,
  SplitHeading,
  ScrollProgress,
  Parallax,
} from "@/components/motion/primitives";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "seating" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function SeatingPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("seating");
  const nav = await getTranslations("nav");

  const courtyard = scenePhoto("courtyard");
  const hall = scenePhoto("hall");
  const cabin = scenePhoto("cabin");
  const feast = scenePhoto("feast");

  // Three parts of the same day, each with its own photograph.
  const times = [
    { Icon: Sunrise, n: 1, photo: scenePhoto("hero") },
    { Icon: Sun, n: 2, photo: courtyard },
    { Icon: Moon, n: 3, photo: cabin },
  ];

  const notes = [
    { Icon: Users, n: 1 },
    { Icon: Car, n: 2 },
    { Icon: Flame, n: 3 },
    { Icon: PackageCheck, n: 4 },
  ];

  return (
    <>
      <ScrollProgress />
      <SiteHeader />

      <main className="bg-paper-100">
        {/* --- Opening band --- */}
        <section className="bg-pks-900 relative isolate overflow-hidden pt-36 pb-20 sm:pt-44 sm:pb-24">
          <ScrollImage
            photo={courtyard}
            alt=""
            effect="drift"
            rounded={false}
            priority
            sizes="100vw"
            className="absolute inset-0 -z-10"
            imageClassName="opacity-45"
          />
          <div className="from-pks-950 via-pks-900/88 to-pks-800/80 absolute inset-0 -z-10 bg-gradient-to-b" />

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
          </div>
        </section>

        {/* --- Interactive plan --- */}
        <div className="mx-auto max-w-7xl px-5 pt-16 pb-14 sm:px-8 sm:pt-24 sm:pb-16">
          <FloorPlan />
        </div>

        {/* --- When to come --- */}
        <section className="bg-white py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <Reveal>
                <p className="text-pks-500 text-[11px] tracking-[0.34em] uppercase">
                  {t("whenEyebrow")}
                </p>
              </Reveal>
              <GoldRule className="mt-5 w-24 origin-left" />
              <SplitHeading
                text={t("whenTitle")}
                className="font-display text-ink-800 mt-6 text-4xl sm:text-5xl"
              />
            </div>

            <div className="mt-14 grid gap-8 lg:grid-cols-3">
              {times.map((slot, index) => (
                <Reveal key={slot.n} delay={index * 0.1}>
                  <article className="border-paper-300 h-full overflow-hidden rounded-2xl border bg-white">
                    <ScrollImage
                      photo={slot.photo}
                      alt=""
                      effect="full"
                      intensity={0.7}
                      rounded={false}
                      sizes="(max-width: 1024px) 92vw, 31vw"
                      className="aspect-16/10"
                    />
                    <div className="p-7">
                      <slot.Icon className="text-pks-500 h-6 w-6" />
                      <h3 className="font-display text-ink-800 mt-5 text-2xl">
                        {t(`when${slot.n}Title`)}
                      </h3>
                      <p className="text-ink-600 mt-3.5 text-sm leading-relaxed">
                        {t(`when${slot.n}Body`)}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* --- Good to know, beside the hall --- */}
        <section className="bg-paper-200 py-20 sm:py-28">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
            <Parallax distance={40}>
              <ScrollImage
                photo={hall}
                alt={photoAlt(hall, locale)}
                effect="full"
                intensity={1.1}
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="aspect-4/5 shadow-[0_30px_80px_-34px_rgba(0,0,0,0.5)]"
              />
            </Parallax>

            <div>
              <Reveal>
                <p className="text-pks-500 text-[11px] tracking-[0.34em] uppercase">
                  {t("knowEyebrow")}
                </p>
              </Reveal>
              <GoldRule className="mt-5 w-24 origin-left" />
              <SplitHeading
                text={t("knowTitle")}
                className="font-display text-ink-800 mt-6 text-4xl sm:text-5xl"
              />

              <dl className="mt-10 space-y-7">
                {notes.map((note, index) => (
                  <Reveal key={note.n} delay={index * 0.07}>
                    <div className="border-paper-400 flex gap-4 border-t pt-6">
                      <note.Icon className="text-pks-500 mt-0.5 h-5 w-5 shrink-0" />
                      <div>
                        <dt className="text-ink-800 text-base font-semibold">
                          {t(`know${note.n}Title`)}
                        </dt>
                        <dd className="text-ink-600 mt-1.5 text-sm leading-relaxed">
                          {t(`know${note.n}Body`)}
                        </dd>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* --- Closing band --- */}
        <section className="relative isolate overflow-hidden">
          <ScrollImage
            photo={feast}
            alt=""
            effect="full"
            intensity={0.8}
            rounded={false}
            sizes="100vw"
            className="absolute inset-0 -z-10"
          />
          <div className="from-pks-950/95 via-pks-900/88 to-pks-800/82 absolute inset-0 -z-10 bg-gradient-to-r" />

          <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8 sm:py-32">
            <div className="max-w-xl">
              <Reveal>
                <SplitHeading
                  text={t("ctaTitle")}
                  className="font-display text-4xl text-white sm:text-5xl"
                />
              </Reveal>
              <GoldRule className="mt-6 w-24 origin-left" />
              <Reveal delay={0.15}>
                <p className="mt-6 text-base leading-relaxed text-white/70">
                  {t("ctaBody")}
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <div className="mt-9 flex flex-wrap gap-3">
                  <Link
                    href="/menu"
                    className="group text-pks-700 relative overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold"
                  >
                    <span className="from-gold-300 to-gold-500 absolute inset-0 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                    <span className="relative">{t("ctaMenu")}</span>
                  </Link>
                  <Link
                    href="/contact"
                    className="rounded-full border border-white/40 px-8 py-4 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                  >
                    {t("ctaContact")}
                  </Link>
                </div>
              </Reveal>
              <span className="sr-only">{nav("seating")}</span>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
