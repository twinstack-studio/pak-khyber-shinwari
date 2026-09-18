import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Bike, Store, Phone, Clock } from "lucide-react";
import { db } from "@/lib/db";
import { ORDER_STATUSES } from "@/lib/orders";
import { getAdminLocale } from "@/lib/admin-locale";
import { formatPrice } from "@/lib/menu";
import StatusPicker from "./StatusPicker";

export const dynamic = "force-dynamic";

const ACTIVE = ["PLACED", "CONFIRMED", "PREPARING", "READY", "ON_THE_WAY"] as const;

const STATUS_TONE: Record<string, string> = {
  PLACED: "bg-pks-500 text-white",
  CONFIRMED: "bg-pks-100 text-pks-700",
  PREPARING: "bg-gold-500 text-ink-900",
  READY: "bg-shinwari-100 text-shinwari-800",
  ON_THE_WAY: "bg-shinwari-400 text-white",
  COMPLETED: "bg-paper-300 text-ink-600",
  CANCELLED: "bg-paper-300 text-ink-400 line-through",
};

type Translate = Awaited<ReturnType<typeof getTranslations<"admin">>>;

/** "12 min ago" — the number a kitchen actually cares about. */
function ago(date: Date, t: Translate) {
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return t("justNow");
  if (minutes < 60) return t("minAgo", { count: minutes });
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return t("hourAgo", { count: hours });
  return t("dayAgo", { count: Math.floor(hours / 24) });
}

export default async function OrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const t = await getTranslations("admin");
  const locale = await getAdminLocale();
  const money = (value: number) => formatPrice(value, locale);
  const when = (date: Date) =>
    new Intl.DateTimeFormat(locale === "ur" ? "ur-PK" : "en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Karachi",
    }).format(date);

  const { status } = await searchParams;
  const filter =
    status && ORDER_STATUSES.includes(status as (typeof ORDER_STATUSES)[number])
      ? status
      : null;

  const orders = await db.order.findMany({
    where: filter ? { status: filter } : { status: { in: [...ACTIVE] } },
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  const counts = await db.order.groupBy({
    by: ["status"],
    _count: { _all: true },
  });
  const countFor = (value: string) =>
    counts.find((row) => row.status === value)?._count._all ?? 0;

  const todayTotal = (
    await db.order.aggregate({
      _sum: { total: true },
      _count: { _all: true },
      where: {
        status: { not: "CANCELLED" },
        createdAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
      },
    })
  );

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-ink-800 text-3xl">{t("ordersTitle")}</h1>
          <p className="text-ink-400 mt-1 text-sm">
            {filter
              ? t("ordersShowing", { status: t(`status${filter}`) })
              : t("ordersOpen")}
          </p>
        </div>

        <div className="border-paper-300 rounded-xl border bg-white px-5 py-3">
          <p className="text-ink-400 text-[10px] tracking-[0.2em] uppercase">
            {t("today")}
          </p>
          <p className="text-ink-800 mt-1 text-lg font-semibold tabular-nums">
            {money(todayTotal._sum.total ?? 0)}
            <span className="text-ink-400 ms-2 text-xs font-normal">
              {t("ordersCount", { count: todayTotal._count._all })}
            </span>
          </p>
        </div>
      </div>

      {/* --- status filter --- */}
      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin"
          className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
            filter === null
              ? "border-pks-500 bg-pks-500 text-white"
              : "border-paper-400 text-ink-500 hover:border-pks-300"
          }`}
        >
          {t("filterOpen")}
        </Link>
        {ORDER_STATUSES.map((value) => (
          <Link
            key={value}
            href={`/admin?status=${value}`}
            className={`rounded-full border px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              filter === value
                ? "border-pks-500 bg-pks-500 text-white"
                : "border-paper-400 text-ink-500 hover:border-pks-300"
            }`}
          >
            {t(`status${value}`)}
            <span className="text-ink-400 ms-1.5 tabular-nums">
              {countFor(value)}
            </span>
          </Link>
        ))}
      </div>

      {/* --- orders --- */}
      {orders.length === 0 ? (
        <div className="border-paper-300 mt-8 rounded-2xl border border-dashed bg-white py-20 text-center">
          <p className="text-ink-400 text-sm">{t("nothingHere")}</p>
        </div>
      ) : (
        <ul className="mt-6 space-y-4">
          {orders.map((order) => (
            <li
              key={order.id}
              className="border-paper-300 overflow-hidden rounded-2xl border bg-white"
            >
              <div className="flex flex-wrap items-start gap-4 p-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2.5">
                    <Link
                      href={`/admin/orders/${order.reference}`}
                      className="font-display text-ink-800 hover:text-pks-600 text-lg tracking-wide transition-colors"
                    >
                      {order.reference}
                    </Link>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                        STATUS_TONE[order.status] ?? "bg-paper-300 text-ink-600"
                      }`}
                    >
                      {t(`status${order.status}`)}
                    </span>
                    <span className="text-ink-400 inline-flex items-center gap-1 text-xs">
                      {order.orderType === "DELIVERY" ? (
                        <Bike className="h-3.5 w-3.5" />
                      ) : (
                        <Store className="h-3.5 w-3.5" />
                      )}
                      {order.orderType === "DELIVERY" ? t("delivery") : t("pickup")}
                    </span>
                    <span className="text-ink-400 inline-flex items-center gap-1 text-xs">
                      <Clock className="h-3.5 w-3.5" />
                      {ago(order.createdAt, t)}
                    </span>
                  </div>

                  <p className="text-ink-700 mt-2 text-sm font-semibold">
                    {order.customerName}
                    <a
                      href={`tel:${order.phone}`}
                      className="text-pks-600 ms-3 inline-flex items-center gap-1 font-normal"
                    >
                      <Phone className="h-3.5 w-3.5" />
                      {order.phone}
                    </a>
                  </p>

                  {order.address && (
                    <p className="text-ink-500 mt-1 text-xs leading-relaxed">
                      {order.address}
                    </p>
                  )}

                  <p className="text-ink-500 mt-2.5 text-xs leading-relaxed">
                    {order.items
                      .map(
                        (item) =>
                          `${item.quantity}× ${locale === "ur" ? item.nameUr : item.nameEn}`,
                      )
                      .join(" · ")}
                  </p>

                  {order.notes && (
                    <p className="bg-gold-300/20 text-ink-700 mt-2.5 rounded-lg px-3 py-2 text-xs">
                      “{order.notes}”
                    </p>
                  )}
                </div>

                <div className="text-end">
                  <p className="font-display text-pks-600 text-xl tabular-nums">
                    {money(order.total)}
                  </p>
                  <p className="text-ink-400 mt-0.5 text-[11px]">
                    {order.paymentMethod} · {order.taxRate}% {t("tax")}
                  </p>
                  <p className="text-ink-400 mt-0.5 text-[11px]">
                    {when(order.createdAt)}
                  </p>
                </div>
              </div>

              <div className="border-paper-300 bg-paper-100 border-t px-5 py-3">
                <StatusPicker
                  orderId={order.id}
                  current={order.status}
                  moveToLabel={t("moveTo")}
                  labels={Object.fromEntries(
                    ORDER_STATUSES.map((value) => [value, t(`status${value}`)]),
                  )}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
