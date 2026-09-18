import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { Flame, Soup, Croissant } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { restaurant, allItems, categories, t as pick } from "@/lib/menu";
import { scenePhoto, categoryPhoto, photoAlt } from "@/lib/photos";
import about from "../../../../data/about.json";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import ScrollImage from "@/components/motion/ScrollImage";
import {
  Reveal,
  GoldRule,
  SplitHeading,
  CountUp,
  ScrollProgress,
  Parallax,
} from "@/components/motion/primitives";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("eyebrow"), description: t("lede") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("about");
  const info = await getTranslations("info");

  const grill = scenePhoto("grill");
  const interior = scenePhoto("interior");
  const spread = scenePhoto("spread");
  const flames = scenePhoto("flames");

  const gallery = [
    { key: "feast", photo: scenePhoto("feast") },
    { key: "courtyard", photo: scenePhoto("courtyard") },
    { key: "grill", photo: grill },
    { key: "interior", photo: interior },
  ];

  const methods = [
    {
      Icon: Flame,
      title: t("dumPukhtTitle"),
      body: t("dumPukhtBody"),
      photo: categoryPhoto("dum-pukht"),
    },
    {
      Icon: Soup,
      title: t("karahiTitle"),
      body: t("karahiBody"),
      photo: categoryPhoto("chicken-shinwari"),
    },
    {
      Icon: Croissant,
      title: t("tandoorTitle"),
      body: t("tandoorBody"),
      photo: categoryPhoto("breads-sides"),
    },
  ];

  return (
    <>
      <ScrollProgress />
      <SiteHeader />

      <main>
        {/* --- Opening band --- */}
        <section className="bg-pks-900 relative isolate overflow-hidden pt-36 pb-24 sm:pt-44 sm:pb-32">
          <ScrollImage
            photo={grill}
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
              className="font-display mt-7 max-w-4xl text-4xl leading-[1.06] text-white sm:text-5xl xl:text-6xl"
            />
            <Reveal delay={0.25}>
              <p className="mt-8 max-w-2xl text-lg leading-relaxed text-white/70">
                {t("lede")}
              </p>
            </Reveal>
          </div>
        </section>

        {/* --- How we cook --- */}
        <section className="bg-paper-100 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <Reveal>
                <p className="text-pks-500 text-[11px] tracking-[0.34em] uppercase">
                  {t("craftEyebrow")}
                </p>
              </Reveal>
              <GoldRule className="mt-5 w-24 origin-left" />
              <SplitHeading
                text={t("craftTitle")}
                className="font-display text-ink-800 mt-6 text-4xl sm:text-5xl"
              />
            </div>

            <div className="mt-16 grid gap-8 lg:grid-cols-3">
              {methods.map((method, index) => (
                <Reveal key={method.title} delay={index * 0.1}>
                  <article className="border-paper-300 h-full overflow-hidden rounded-2xl border bg-white">
                    {method.photo && (
                      <ScrollImage
                        photo={method.photo}
                        alt=""
                        effect="full"
                        intensity={0.7}
                        rounded={false}
                        sizes="(max-width: 1024px) 92vw, 31vw"
                        className="aspect-16/10"
                      />
                    )}
                    <div className="p-7">
                      <method.Icon className="text-pks-500 h-6 w-6" />
                      <h3 className="font-display text-ink-800 mt-5 text-2xl">
                        {method.title}
                      </h3>
                      <p className="text-ink-600 mt-3.5 text-sm leading-relaxed">
                        {method.body}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* --- The table --- */}
        <section className="bg-paper-200 py-24 sm:py-32">
          <div className="mx-auto grid max-w-7xl items-center gap-14 px-5 sm:px-8 lg:grid-cols-2 lg:gap-20">
            <Parallax distance={45}>
              <ScrollImage
                photo={interior}
                alt={photoAlt(interior, locale)}
                effect="full"
                intensity={1.15}
                sizes="(max-width: 1024px) 92vw, 46vw"
                className="aspect-4/5 shadow-[0_30px_80px_-34px_rgba(0,0,0,0.5)]"
              />
            </Parallax>

            <div>
              <Reveal>
                <p className="text-pks-500 text-[11px] tracking-[0.34em] uppercase">
                  {t("tableEyebrow")}
                </p>
              </Reveal>
              <GoldRule className="mt-5 w-24 origin-left" />
              <SplitHeading
                text={t("tableTitle")}
                className="font-display text-ink-800 mt-6 text-4xl sm:text-5xl"
              />
              <Reveal delay={0.18}>
                <p className="text-ink-600 mt-7 text-base leading-relaxed">
                  {t("tableBody")}
                </p>
              </Reveal>

              <Reveal delay={0.28}>
                <dl className="border-paper-400 mt-12 grid grid-cols-3 gap-6 border-t pt-9">
                  <div>
                    <dt className="font-display text-pks-500 text-4xl sm:text-5xl">
                      <CountUp to={allItems.length} />
                    </dt>
                    <dd className="text-ink-400 mt-2 text-xs">{t("craftEyebrow")}</dd>
                  </div>
                  <div>
                    <dt className="font-display text-pks-500 text-4xl sm:text-5xl">
                      <CountUp to={categories.length} />
                    </dt>
                    <dd className="text-ink-400 mt-2 text-xs">
                      {pick(categories[0].name, locale)}
                    </dd>
                  </div>
                  <div>
                    <dt className="font-display text-pks-500 text-4xl sm:text-5xl">
                      <CountUp to={7} />
                    </dt>
                    <dd className="text-ink-400 mt-2 text-xs">{info("hours")}</dd>
                  </div>
                </dl>
              </Reveal>
            </div>
          </div>
        </section>

        {/* --- Pull quote --- */}
        <section className="bg-pks-700 py-20 sm:py-28">
          <div className="mx-auto max-w-4xl px-5 text-center sm:px-8">
            <Reveal>
              <p className="font-display text-2xl leading-snug text-white italic sm:text-3xl lg:text-4xl">
                “{t("pullQuote")}”
              </p>
            </Reveal>
            <GoldRule className="mx-auto mt-9 w-28" />
          </div>
        </section>

        {/* --- What you can count on --- */}
        <section className="bg-paper-100 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <Reveal>
                <p className="text-pks-500 text-[11px] tracking-[0.34em] uppercase">
                  {t("promiseEyebrow")}
                </p>
              </Reveal>
              <GoldRule className="mt-5 w-24 origin-left" />
              <SplitHeading
                text={t("promiseTitle")}
                className="font-display text-ink-800 mt-6 text-4xl sm:text-5xl"
              />
            </div>

            <div className="mt-16 grid gap-x-10 gap-y-12 sm:grid-cols-2">
              {[1, 2, 3, 4].map((n, index) => (
                <Reveal key={n} delay={index * 0.08}>
                  <div className="border-paper-400 flex gap-5 border-t pt-7">
                    <span className="font-display text-pks-500/35 text-4xl leading-none tabular-nums">
                      {String(n).padStart(2, "0")}
                    </span>
                    <div>
                      <h3 className="font-display text-ink-800 text-xl">
                        {t(`promise${n}Title`)}
                      </h3>
                      <p className="text-ink-600 mt-2.5 text-sm leading-relaxed">
                        {t(`promise${n}Body`)}
                      </p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* --- Gallery strip --- */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="max-w-2xl">
              <Reveal>
                <p className="text-pks-500 text-[11px] tracking-[0.34em] uppercase">
                  {t("galleryEyebrow")}
                </p>
              </Reveal>
              <GoldRule className="mt-5 w-24 origin-left" />
              <SplitHeading
                text={t("galleryTitle")}
                className="font-display text-ink-800 mt-6 text-4xl sm:text-5xl"
              />
            </div>

            <div className="mt-14 grid grid-cols-2 gap-4 sm:gap-6 lg:grid-cols-4">
              {gallery.map((shot, index) => (
                <ScrollImage
                  key={shot.key}
                  photo={shot.photo}
                  alt={photoAlt(shot.photo, locale)}
                  effect="full"
                  intensity={0.8 + (index % 3) * 0.25}
                  sizes="(max-width: 640px) 46vw, 23vw"
                  className={
                    index % 3 === 1
                      ? "aspect-3/4 lg:mt-10"
                      : "aspect-square"
                  }
                />
              ))}
            </div>
          </div>
        </section>

        {/* --- The people. Real names and dates only when the client supplies
                them; until then this says so plainly rather than inventing. --- */}
        <section className="bg-paper-200 py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-14 lg:grid-cols-[1fr_1.15fr] lg:gap-20">
              <Parallax distance={40}>
                <ScrollImage
                  photo={flames}
                  alt={photoAlt(flames, locale)}
                  effect="full"
                  intensity={1.2}
                  sizes="(max-width: 1024px) 92vw, 42vw"
                  className="aspect-square shadow-[0_30px_80px_-34px_rgba(0,0,0,0.55)]"
                />
              </Parallax>

              <div>
                <Reveal>
                  <p className="text-pks-500 text-[11px] tracking-[0.34em] uppercase">
                    {t("peopleEyebrow")}
                  </p>
                </Reveal>
                <GoldRule className="mt-5 w-24 origin-left" />
                <SplitHeading
                  text={t("peopleTitle")}
                  className="font-display text-ink-800 mt-6 text-4xl sm:text-5xl"
                />
                <Reveal delay={0.15}>
                  <p className="text-ink-600 mt-7 text-base leading-relaxed">
                    {t("peopleBody")}
                  </p>
                </Reveal>

            {about.owner.provided ||
            about.founded.provided ||
            about.headChef.provided ||
            about.origin.provided ? (
              <dl className="mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
                {about.founded.provided && (
                  <Reveal>
                    <dt className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
                      {t("foundedLabel")}
                    </dt>
                    <dd className="font-display text-pks-500 mt-2 text-4xl">
                      {about.founded.year}
                    </dd>
                  </Reveal>
                )}
                {about.owner.provided && (
                  <Reveal delay={0.08}>
                    <dt className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
                      {t("ownerLabel")}
                    </dt>
                    <dd className="font-display text-ink-800 mt-2 text-2xl">
                      {about.owner.name[locale] || about.owner.name.en}
                    </dd>
                  </Reveal>
                )}
                {about.headChef.provided && (
                  <Reveal delay={0.16}>
                    <dt className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
                      {t("chefLabel")}
                    </dt>
                    <dd className="font-display text-ink-800 mt-2 text-2xl">
                      {about.headChef.name[locale] || about.headChef.name.en}
                    </dd>
                  </Reveal>
                )}
                {about.origin.provided && (
                  <Reveal delay={0.24}>
                    <dt className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
                      {t("originLabel")}
                    </dt>
                    <dd className="font-display text-ink-800 mt-2 text-2xl">
                      {about.origin.place[locale] || about.origin.place.en}
                    </dd>
                  </Reveal>
                )}
              </dl>
            ) : (
              <Reveal delay={0.25}>
                <div className="border-pks-500/40 mt-10 border-s-2 ps-6">
                  <p className="text-ink-600 text-base leading-relaxed">
                    {t("peoplePending")}
                  </p>
                  <p className="text-ink-400 mt-4 text-sm leading-relaxed">
                    {t("peopleAsk")}
                  </p>
                </div>
              </Reveal>
            )}
              </div>
            </div>
          </div>
        </section>

        {/* --- Before you come --- */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
              <div>
                <Reveal>
                  <p className="text-pks-500 text-[11px] tracking-[0.34em] uppercase">
                    {t("faqEyebrow")}
                  </p>
                </Reveal>
                <GoldRule className="mt-5 w-24 origin-left" />
                <SplitHeading
                  text={t("faqTitle")}
                  className="font-display text-ink-800 mt-6 text-4xl sm:text-5xl"
                />
              </div>

              <dl className="border-paper-300 border-t">
                {[1, 2, 3, 4].map((n, index) => (
                  <Reveal key={n} delay={index * 0.07}>
                    <div className="border-paper-300 border-b py-7">
                      <dt className="font-display text-ink-800 text-xl">
                        {t(`faq${n}Q`)}
                      </dt>
                      <dd className="text-ink-600 mt-3 text-sm leading-relaxed">
                        {t(`faq${n}A`)}
                      </dd>
                    </div>
                  </Reveal>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* --- Come and eat --- */}
        <section className="relative isolate overflow-hidden">
          <ScrollImage
            photo={spread}
            alt=""
            effect="full"
            intensity={0.8}
            rounded={false}
            sizes="100vw"
            className="absolute inset-0 -z-10"
          />
          <div className="from-pks-950/95 via-pks-900/88 to-pks-800/82 absolute inset-0 -z-10 bg-gradient-to-r" />

          <div className="mx-auto max-w-7xl px-5 py-28 sm:px-8 sm:py-36">
            <div className="max-w-xl">
              <Reveal>
                <SplitHeading
                  text={t("visitTitle")}
                  className="font-display text-4xl text-white sm:text-5xl"
                />
              </Reveal>
              <GoldRule className="mt-6 w-24 origin-left" />
              <Reveal delay={0.15}>
                <p className="mt-6 text-base leading-relaxed text-white/70">
                  {t("visitBody")}
                </p>
              </Reveal>
              <Reveal delay={0.25}>
                <a
                  href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
                  className="group text-pks-700 relative mt-9 inline-block overflow-hidden rounded-full bg-white px-8 py-4 text-sm font-semibold"
                >
                  <span className="from-gold-300 to-gold-500 absolute inset-0 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                  <span className="relative" dir="ltr">
                    {info("callUs")} · {restaurant.phone}
                  </span>
                </a>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
