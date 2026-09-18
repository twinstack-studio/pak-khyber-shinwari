import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { MapPin, Phone, Clock, Mail, MessageCircle, Navigation } from "lucide-react";
import type { Locale } from "@/i18n/routing";
import { restaurant, t as pick } from "@/lib/menu";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import EnquiryForm from "@/components/contact/EnquiryForm";
import {
  Reveal,
  GoldRule,
  SplitHeading,
  ScrollProgress,
} from "@/components/motion/primitives";

const MAPS_QUERY = "Pak+Khyber+Shinwari+GT+Road+Sangjani+Islamabad";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "contact" });
  return { title: t("title"), description: t("subtitle") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("contact");
  const info = await getTranslations("info");

  const tel = restaurant.phone.replace(/\s/g, "");
  const whatsapp = tel.replace("+", "");

  const facts = [
    { Icon: MapPin, label: info("address"), value: pick(restaurant.address, locale) },
    { Icon: Phone, label: info("phone"), value: restaurant.phone, ltr: true, href: `tel:${tel}` },
    { Icon: Mail, label: "Email", value: restaurant.email, ltr: true, href: `mailto:${restaurant.email}` },
    { Icon: Clock, label: info("hours"), value: info("hoursValue") },
  ];

  return (
    <>
      <ScrollProgress />
      <SiteHeader />

      <main className="bg-paper-100">
        <section className="bg-pks-900 pt-36 pb-20 sm:pt-44 sm:pb-24">
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

            <Reveal delay={0.35}>
              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={`tel:${tel}`}
                  className="group text-pks-700 relative inline-flex items-center gap-2.5 overflow-hidden rounded-full bg-white px-7 py-3.5 text-sm font-semibold"
                >
                  <span className="from-gold-300 to-gold-500 absolute inset-0 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
                  <Phone className="relative h-4 w-4" />
                  <span className="relative" dir="ltr">
                    {restaurant.phone}
                  </span>
                </a>
                <a
                  href={`https://wa.me/${whatsapp}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  <MessageCircle className="h-4 w-4" />
                  {t("whatsapp")}
                </a>
                <a
                  href={`https://maps.google.com/?q=${MAPS_QUERY}`}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2.5 rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-colors hover:border-white hover:bg-white/10"
                >
                  <Navigation className="h-4 w-4" />
                  {t("directions")}
                </a>
              </div>
            </Reveal>
          </div>
        </section>

        {/* --- facts --- */}
        <section className="py-16 sm:py-20">
          <div className="mx-auto grid max-w-7xl gap-5 px-5 sm:grid-cols-2 sm:px-8 lg:grid-cols-4">
            {facts.map((fact, index) => {
              const inner = (
                <>
                  <fact.Icon className="text-pks-500 h-5 w-5" />
                  <p className="text-ink-400 mt-5 text-[10px] tracking-[0.22em] uppercase">
                    {fact.label}
                  </p>
                  <p
                    className="text-ink-800 mt-2 text-sm leading-relaxed break-words"
                    dir={fact.ltr ? "ltr" : undefined}
                  >
                    {fact.value}
                  </p>
                </>
              );
              return (
                <Reveal key={fact.label} delay={index * 0.07}>
                  {fact.href ? (
                    <a
                      href={fact.href}
                      className="border-paper-300 hover:border-pks-300 block h-full rounded-2xl border bg-white p-6 transition-colors"
                    >
                      {inner}
                    </a>
                  ) : (
                    <div className="border-paper-300 h-full rounded-2xl border bg-white p-6">
                      {inner}
                    </div>
                  )}
                </Reveal>
              );
            })}
          </div>
        </section>

        {/* --- map + form --- */}
        <section className="pb-24 sm:pb-32">
          <div className="mx-auto grid max-w-7xl gap-10 px-5 sm:px-8 lg:grid-cols-2 lg:gap-14">
            <Reveal>
              <div className="border-paper-300 h-full min-h-96 overflow-hidden rounded-2xl border bg-white">
                {/* Google's plain embed needs no API key and no cookie banner. */}
                <iframe
                  title={t("directions")}
                  src={`https://maps.google.com/maps?q=${MAPS_QUERY}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-full min-h-96 w-full border-0"
                />
              </div>
            </Reveal>

            <div>
              <Reveal>
                <SplitHeading
                  text={t("formTitle")}
                  className="font-display text-ink-800 text-3xl sm:text-4xl"
                />
              </Reveal>
              <GoldRule className="mt-4 w-20 origin-left" />
              <Reveal delay={0.12}>
                <p className="text-ink-500 mt-4 text-sm leading-relaxed">
                  {t("formSubtitle")}
                </p>
              </Reveal>
              <Reveal delay={0.2}>
                <div className="mt-7">
                  <EnquiryForm />
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
