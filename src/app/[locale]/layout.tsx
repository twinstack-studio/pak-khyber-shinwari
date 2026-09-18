import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Inter, Playfair_Display, Noto_Nastaliq_Urdu } from "next/font/google";
import { routing, localeDirection, type Locale } from "@/i18n/routing";
import { restaurant } from "@/lib/menu";
import { CartProvider } from "@/lib/cart";
import CartDrawer from "@/components/cart/CartDrawer";
import ScrollToTop from "@/components/ScrollToTop";
import "../globals.css";

const body = Inter({
  subsets: ["latin"],
  variable: "--font-body",
  display: "swap",
});

const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
  // The hero accent line and the About pull quote are set in italic. Without
  // the real italic face the browser fakes the slant by shearing the roman,
  // which on a high-contrast serif looks visibly wrong.
  style: ["normal", "italic"],
});

const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-urdu",
  display: "swap",
  // 400 for running text, 700 for headings. Nothing in between is loaded, so
  // nothing in between should be asked for — the browser would synthesise it.
  weight: ["400", "700"],
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "brand" });
  const hero = await getTranslations({ locale, namespace: "hero" });

  // The lede carries *asterisks* marking the words the hero animation
  // emphasises. Search engines and social cards must not see them.
  const description = hero("subtitle").replace(/\*/g, "");

  return {
    title: {
      default: `${t("name")} — ${t("branch")}`,
      template: `%s · ${t("name")}`,
    },
    description,
    openGraph: {
      title: `${t("name")} — ${t("branch")}`,
      description,
      locale: locale === "ur" ? "ur_PK" : "en_PK",
      type: "website",
    },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  // Opt this segment into static rendering.
  setRequestLocale(locale);

  return (
    <html
      lang={locale}
      dir={localeDirection[locale]}
      className={`${body.variable} ${display.variable} ${urdu.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-paper-100 text-ink-800 antialiased">
        <NextIntlClientProvider>
          <CartProvider>
            <ScrollToTop />
            {children}
            <CartDrawer />
          </CartProvider>
        </NextIntlClientProvider>

        {/* Local business schema — this is what puts the restaurant in Google's
            map card for "shinwari GT road". Worth more than any animation. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Restaurant",
              name: restaurant.name.en,
              image: [],
              telephone: restaurant.phone,
              email: restaurant.email,
              servesCuisine: ["Pakistani", "Pakhtun", "Afghan", "Barbecue"],
              priceRange: "$$",
              address: {
                "@type": "PostalAddress",
                streetAddress: "GT Road, Sangjani",
                addressLocality: "Islamabad",
                addressCountry: "PK",
              },
            }),
          }}
        />
      </body>
    </html>
  );
}
