import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import type { Locale } from "@/i18n/routing";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import CheckoutForm from "@/components/checkout/CheckoutForm";
import { Reveal, GoldRule, SplitHeading } from "@/components/motion/primitives";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "checkout" });
  // A checkout page has no business in search results.
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("checkout");

  return (
    <>
      <SiteHeader />

      <main className="bg-paper-100 min-h-svh pt-32 pb-20 sm:pt-40">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <Reveal>
            <p className="text-pks-500 text-[11px] tracking-[0.34em] uppercase">
              {t("eyebrow")}
            </p>
          </Reveal>
          <GoldRule className="mt-5 w-24 origin-left" />
          <SplitHeading
            immediate
            as="h1"
            text={t("title")}
            className="font-display text-ink-800 mt-6 text-4xl sm:text-5xl"
          />
          <Reveal delay={0.2}>
            <p className="text-ink-500 mt-4 max-w-xl text-base">{t("subtitle")}</p>
          </Reveal>

          <div className="mt-14">
            <CheckoutForm />
          </div>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
