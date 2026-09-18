import type { Metadata } from "next";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { CheckCircle2, Phone, MapPin, Store, StickyNote } from "lucide-react";
import { Link } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { db } from "@/lib/db";
import { formatPrice, restaurant, t as pick } from "@/lib/menu";
import SiteHeader from "@/components/SiteHeader";
import SiteFooter from "@/components/SiteFooter";
import { Reveal, GoldRule } from "@/components/motion/primitives";

// The order is written moments before this renders, so it must never be
// served from a cache.
export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; reference: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "order" });
  // Someone's name, phone and address live on this page.
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function OrderPage({
  params,
}: {
  params: Promise<{ locale: Locale; reference: string }>;
}) {
  const { locale, reference } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("order");
  const cartT = await getTranslations("cart");

  const order = await db.order.findUnique({
    where: { reference: decodeURIComponent(reference).toUpperCase() },
    include: { items: true },
  });

  if (!order) {
    return (
      <>
        <SiteHeader />
        <main className="bg-paper-100 flex min-h-svh flex-col items-center justify-center px-5 text-center">
          <h1 className="font-display text-ink-800 text-3xl">{t("notFoundTitle")}</h1>
          <p className="text-ink-500 mt-4 max-w-sm text-sm leading-relaxed">
            {t("notFoundBody")}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <a
              href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
              className="bg-pks-500 rounded-full px-6 py-3 text-sm font-semibold text-white"
              dir="ltr"
            >
              {restaurant.phone}
            </a>
            <Link
              href="/menu"
              className="border-paper-400 text-ink-700 rounded-full border px-6 py-3 text-sm font-semibold"
            >
              {t("backToMenu")}
            </Link>
          </div>
        </main>
        <SiteFooter />
      </>
    );
  }

  const paymentLabel = {
    COD: cartT("methodCod"),
    CARD: cartT("methodCard"),
    WALLET: cartT("methodWallet"),
  }[order.paymentMethod] ?? order.paymentMethod;

  const placedAt = new Intl.DateTimeFormat(locale === "ur" ? "ur-PK" : "en-PK", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Karachi",
  }).format(order.createdAt);

  return (
    <>
      <SiteHeader />

      <main className="bg-paper-100 min-h-svh pt-32 pb-20 sm:pt-40">
        <div className="mx-auto max-w-3xl px-5 sm:px-8">
          <Reveal>
            <div className="bg-shinwari-500/10 inline-flex rounded-full p-3">
              <CheckCircle2 className="h-7 w-7 text-[color:var(--color-shinwari-500,#55913a)]" />
            </div>
          </Reveal>

          <Reveal delay={0.1}>
            <h1 className="font-display text-ink-800 mt-6 text-4xl sm:text-5xl">
              {t("thanks", { name: order.customerName })}
            </h1>
          </Reveal>
          <GoldRule className="mt-5 w-24 origin-left" />
          <Reveal delay={0.2}>
            <p className="text-ink-600 mt-5 text-base leading-relaxed">
              {t("received")}
            </p>
          </Reveal>

          {/* --- reference --- */}
          <Reveal delay={0.28}>
            <div className="bg-pks-700 mt-10 overflow-hidden rounded-2xl p-7 text-white">
              <p className="text-[10px] tracking-[0.22em] text-white/60 uppercase">
                {t("reference")}
              </p>
              <p className="font-display mt-2 text-3xl tracking-wider sm:text-4xl" dir="ltr">
                {order.reference}
              </p>
              <p className="mt-3 text-xs leading-relaxed text-white/60">
                {t("referenceNote")}
              </p>
            </div>
          </Reveal>

          {/* --- facts --- */}
          <Reveal delay={0.34}>
            <dl className="border-paper-300 mt-10 grid gap-6 border-t pt-8 sm:grid-cols-2">
              <div>
                <dt className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
                  {t("status")}
                </dt>
                <dd className="text-ink-800 mt-1.5 text-sm font-semibold">
                  {t(`status${order.status}`)}
                </dd>
              </div>
              <div>
                <dt className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
                  {t("placedAt")}
                </dt>
                <dd className="text-ink-800 mt-1.5 text-sm">{placedAt}</dd>
              </div>
              <div>
                <dt className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
                  {t("paying")}
                </dt>
                <dd className="text-ink-800 mt-1.5 text-sm">{paymentLabel}</dd>
              </div>
              <div>
                <dt className="text-ink-400 flex items-center gap-1.5 text-[10px] tracking-[0.22em] uppercase">
                  <Phone className="h-3 w-3" />
                  {order.phone}
                </dt>
                <dd className="text-ink-800 mt-1.5 text-sm">{order.customerName}</dd>
              </div>

              <div className="sm:col-span-2">
                <dt className="text-ink-400 flex items-center gap-1.5 text-[10px] tracking-[0.22em] uppercase">
                  {order.orderType === "DELIVERY" ? (
                    <MapPin className="h-3 w-3" />
                  ) : (
                    <Store className="h-3 w-3" />
                  )}
                  {order.orderType === "DELIVERY" ? t("deliveringTo") : t("collectFrom")}
                </dt>
                <dd className="text-ink-800 mt-1.5 text-sm leading-relaxed">
                  {order.orderType === "DELIVERY"
                    ? order.address
                    : pick(restaurant.address, locale)}
                </dd>
              </div>

              {order.notes && (
                <div className="sm:col-span-2">
                  <dt className="text-ink-400 flex items-center gap-1.5 text-[10px] tracking-[0.22em] uppercase">
                    <StickyNote className="h-3 w-3" />
                    {t("yourNotes")}
                  </dt>
                  <dd className="text-ink-800 mt-1.5 text-sm leading-relaxed">
                    {order.notes}
                  </dd>
                </div>
              )}
            </dl>
          </Reveal>

          {/* --- items --- */}
          <Reveal delay={0.4}>
            <div className="mt-12">
              <p className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
                {t("items")}
              </p>
              <ul className="border-paper-300 mt-4 border-t">
                {order.items.map((line) => (
                  <li
                    key={line.id}
                    className="border-paper-300 flex items-start gap-4 border-b py-3.5"
                  >
                    <span className="bg-pks-50 text-pks-600 mt-0.5 rounded-full px-2.5 py-1 text-xs font-bold tabular-nums">
                      ×{line.quantity}
                    </span>
                    <span className="text-ink-800 min-w-0 flex-1 text-sm">
                      {locale === "ur" ? line.nameUr : line.nameEn}
                      {(locale === "ur" ? line.variantUr : line.variantEn) && (
                        <span className="text-ink-400">
                          {" "}
                          · {locale === "ur" ? line.variantUr : line.variantEn}
                        </span>
                      )}
                    </span>
                    <span className="text-ink-700 text-sm tabular-nums">
                      {formatPrice(line.lineTotal, locale)}
                    </span>
                  </li>
                ))}
              </ul>

              <dl className="mt-5 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-ink-500">{cartT("subtotal")}</dt>
                  <dd className="text-ink-800 tabular-nums">
                    {formatPrice(order.subtotal, locale)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-ink-500">
                    {cartT("tax")} · {order.taxRate}%
                  </dt>
                  <dd className="text-ink-800 tabular-nums">
                    {formatPrice(order.taxAmount, locale)}
                  </dd>
                </div>
                <div className="border-paper-300 flex items-baseline justify-between border-t pt-3">
                  <dt className="text-ink-800 font-semibold">{cartT("total")}</dt>
                  <dd className="font-display text-pks-600 text-2xl tabular-nums">
                    {formatPrice(order.total, locale)}
                  </dd>
                </div>
              </dl>
            </div>
          </Reveal>

          <Reveal delay={0.46}>
            <p className="text-ink-500 border-paper-300 mt-10 border-t pt-8 text-sm leading-relaxed">
              {t("confirmNote")}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <a
                href={`tel:${restaurant.phone.replace(/\s/g, "")}`}
                className="bg-pks-500 inline-flex items-center gap-2 rounded-full px-6 py-3.5 text-sm font-semibold text-white"
              >
                <Phone className="h-4 w-4" />
                <span dir="ltr">{restaurant.phone}</span>
              </a>
              <Link
                href="/menu"
                className="border-paper-400 text-ink-700 hover:border-pks-500 hover:text-pks-600 rounded-full border px-6 py-3.5 text-sm font-semibold transition-colors"
              >
                {t("backToMenu")}
              </Link>
            </div>
          </Reveal>
        </div>
      </main>

      <SiteFooter />
    </>
  );
}
