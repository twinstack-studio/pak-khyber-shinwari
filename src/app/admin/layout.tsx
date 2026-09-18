import type { Metadata } from "next";
import { Inter, Playfair_Display, Noto_Nastaliq_Urdu } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { localeDirection } from "@/i18n/routing";
import { getAdminLocale, getAdminMessages } from "@/lib/admin-locale";
import "../globals.css";

const body = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });

// The panel's headings and figures use `font-display` too. Without this the
// variable is undefined here and every one of them silently falls back to
// Georgia, so the panel does not look like the site it belongs to.
const display = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-display",
  display: "swap",
});
const urdu = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-urdu",
  display: "swap",
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: "PKS Staff",
  // A staff panel has no business in anybody's search results.
  robots: { index: false, follow: false },
};

/**
 * The admin panel sits outside the [locale] tree: its language comes from a
 * cookie rather than the URL, because it is a private tool used by the same
 * few people rather than a page anyone shares.
 *
 * The session guard lives in (dashboard)/layout.tsx, so the login page can
 * still render without one.
 */
export default async function AdminRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const locale = await getAdminLocale();
  const messages = await getAdminMessages(locale);

  return (
    <html
      lang={locale}
      dir={localeDirection[locale]}
      className={`${body.variable} ${display.variable} ${urdu.variable}`}
      suppressHydrationWarning
    >
      <body className="bg-paper-200 text-ink-800 antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
