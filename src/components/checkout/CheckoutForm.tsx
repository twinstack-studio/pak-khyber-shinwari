"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, Bike, Loader2, ShoppingBag, Store } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";
import { formatPrice, tax as taxInfo, t as pick } from "@/lib/menu";
import { useCart } from "@/lib/cart";
import { GoldRule } from "@/components/motion/primitives";

const EASE = [0.16, 1, 0.3, 1] as const;

type OrderType = "DELIVERY" | "PICKUP";

const METHOD_TO_API = { cod: "COD", card: "CARD", wallet: "WALLET" } as const;

export function CheckoutForm() {
  const t = useTranslations("checkout");
  const cartT = useTranslations("cart");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const {
    lines,
    count,
    subtotal,
    taxRate,
    tax,
    total,
    paymentMethod,
    setPaymentMethod,
    clear,
    hydrated,
  } = useCart();

  const [customerName, setCustomerName] = useState("");
  const [phone, setPhone] = useState("");
  const [orderType, setOrderType] = useState<OrderType>("DELIVERY");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  /** Turns a server error key into a translated sentence, with a fallback. */
  const errorText = (key: string) => {
    const path = `errors.${key}`;
    const message = t(path);
    return message === path ? t("errors.serverError") : message;
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (submitting || lines.length === 0) return;

    setSubmitting(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          phone,
          orderType,
          address,
          notes,
          paymentMethod: METHOD_TO_API[paymentMethod],
          // Ids and quantities only. The server prices the order itself.
          items: lines.map((line) => ({
            id: line.id,
            quantity: line.quantity,
          })),
        }),
      });

      const body = await response.json();

      if (!response.ok) {
        if (body.error === "validation" && body.fields) {
          setFieldErrors(body.fields);
          // A refine() error lands in formErrors, not on the field.
          if (body.formErrors?.length) setFormError(errorText(body.formErrors[0]));
        } else {
          setFormError(errorText(body.error ?? "serverError"));
        }
        setSubmitting(false);
        return;
      }

      // Clear only once the order is safely recorded.
      clear();
      router.push(`/order/${body.reference}`);
    } catch {
      setFormError(t("errors.network"));
      setSubmitting(false);
    }
  }

  if (!hydrated) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="text-pks-500 h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (lines.length === 0) {
    return (
      <div className="flex flex-col items-center gap-5 py-28 text-center">
        <div className="bg-paper-200 rounded-full p-6">
          <ShoppingBag className="text-ink-400 h-9 w-9" />
        </div>
        <h2 className="font-display text-ink-800 text-2xl">{t("emptyTitle")}</h2>
        <p className="text-ink-500 text-sm">{t("emptyBody")}</p>
        <Link
          href="/menu"
          className="bg-pks-500 mt-2 rounded-full px-7 py-3.5 text-sm font-semibold text-white"
        >
          {t("emptyCta")}
        </Link>
      </div>
    );
  }

  const inputClass =
    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-pks-500";

  const fieldClass = (field: string) =>
    `${inputClass} ${fieldErrors[field] ? "border-pks-500" : "border-paper-400"}`;

  return (
    <form onSubmit={submit} className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:gap-14">
      {/* ---------------- details ---------------- */}
      <div>
        <p className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
          {t("yourDetails")}
        </p>
        <GoldRule className="mt-4 w-20 origin-left" />

        <div className="mt-7 space-y-5">
          <div>
            <label htmlFor="name" className="text-ink-700 mb-2 block text-sm font-semibold">
              {t("name")}
            </label>
            <input
              id="name"
              value={customerName}
              onChange={(event) => setCustomerName(event.target.value)}
              placeholder={t("namePlaceholder")}
              autoComplete="name"
              className={fieldClass("customerName")}
            />
            {fieldErrors.customerName && (
              <FieldError message={errorText(fieldErrors.customerName)} />
            )}
          </div>

          <div>
            <label htmlFor="phone" className="text-ink-700 mb-2 block text-sm font-semibold">
              {t("phone")}
            </label>
            <input
              id="phone"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder={t("phonePlaceholder")}
              inputMode="tel"
              autoComplete="tel"
              dir="ltr"
              className={`${fieldClass("phone")} text-start`}
            />
            {fieldErrors.phone && <FieldError message={errorText(fieldErrors.phone)} />}
          </div>

          {/* ---------------- delivery or pickup ---------------- */}
          <div>
            <p className="text-ink-700 mb-2 block text-sm font-semibold">
              {t("orderType")}
            </p>
            <div className="grid grid-cols-2 gap-3">
              {(
                [
                  { id: "DELIVERY" as const, Icon: Bike, label: t("delivery"), note: t("deliveryNote") },
                  { id: "PICKUP" as const, Icon: Store, label: t("pickup"), note: t("pickupNote") },
                ]
              ).map((option) => {
                const selected = orderType === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setOrderType(option.id)}
                    aria-pressed={selected}
                    className={`relative overflow-hidden rounded-xl border p-4 text-start transition-colors ${
                      selected
                        ? "border-pks-500 bg-pks-50"
                        : "border-paper-400 bg-white hover:border-pks-300"
                    }`}
                  >
                    <option.Icon
                      className={`h-5 w-5 ${selected ? "text-pks-500" : "text-ink-400"}`}
                    />
                    <span className="text-ink-800 mt-3 block text-sm font-semibold">
                      {option.label}
                    </span>
                    <span className="text-ink-400 mt-0.5 block text-xs">{option.note}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Address only exists for delivery — asking a pickup customer for
              one is the fastest way to lose them. */}
          <AnimatePresence initial={false}>
            {orderType === "DELIVERY" && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.35, ease: EASE }}
                className="overflow-hidden"
              >
                <label htmlFor="address" className="text-ink-700 mb-2 block text-sm font-semibold">
                  {t("address")}
                </label>
                <textarea
                  id="address"
                  value={address}
                  onChange={(event) => setAddress(event.target.value)}
                  placeholder={t("addressPlaceholder")}
                  rows={3}
                  autoComplete="street-address"
                  className={`${fieldClass("address")} resize-none`}
                />
                {fieldErrors.address && (
                  <FieldError message={errorText(fieldErrors.address)} />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          <div>
            <label htmlFor="notes" className="text-ink-700 mb-2 block text-sm font-semibold">
              {t("notes")}{" "}
              <span className="text-ink-400 font-normal">({t("optional")})</span>
            </label>
            <textarea
              id="notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder={t("notesPlaceholder")}
              rows={2}
              className={`${fieldClass("notes")} resize-none`}
            />
          </div>
        </div>
      </div>

      {/* ---------------- summary ---------------- */}
      <div className="lg:sticky lg:top-32 lg:self-start">
        <div className="border-paper-300 rounded-2xl border bg-white p-6">
          <p className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
            {t("orderSummary")}
          </p>
          <p className="text-ink-400 mt-1 text-xs">
            {count} {count === 1 ? cartT("item") : cartT("items")}
          </p>

          <ul className="divide-paper-300 mt-5 max-h-64 divide-y overflow-y-auto">
            {lines.map((line) => (
              <li key={line.id} className="flex items-start gap-3 py-2.5">
                <span className="bg-pks-50 text-pks-600 mt-0.5 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums">
                  ×{line.quantity}
                </span>
                <span className="text-ink-700 min-w-0 flex-1 text-sm leading-snug">
                  {pick(line.name, locale)}
                  {line.variant && (
                    <span className="text-ink-400"> · {pick(line.variant, locale)}</span>
                  )}
                </span>
                <span className="text-ink-700 text-sm tabular-nums">
                  {formatPrice(line.lineTotal, locale)}
                </span>
              </li>
            ))}
          </ul>

          <div className="border-paper-300 mt-5 border-t pt-5">
            <p className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
              {t("payment")}
            </p>
            <div className="mt-3 flex gap-2">
              {(
                [
                  { id: "cod", key: "methodCod" },
                  { id: "card", key: "methodCard" },
                  { id: "wallet", key: "methodWallet" },
                ] as const
              ).map((method) => {
                const selected = paymentMethod === method.id;
                return (
                  <button
                    key={method.id}
                    type="button"
                    onClick={() => setPaymentMethod(method.id)}
                    aria-pressed={selected}
                    className={`relative flex-1 overflow-hidden rounded-full border px-2 py-2 text-xs font-semibold transition-colors ${
                      selected
                        ? "border-pks-500 text-white"
                        : "border-paper-400 text-ink-500 hover:border-pks-300"
                    }`}
                  >
                    {selected && (
                      <motion.span
                        layoutId="checkout-method"
                        className="bg-pks-500 absolute inset-0"
                        transition={{ type: "spring", stiffness: 340, damping: 32 }}
                      />
                    )}
                    <span className="relative">{cartT(method.key)}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <dl className="mt-5 space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-ink-500">{cartT("subtotal")}</dt>
              <dd className="text-ink-800 tabular-nums">{formatPrice(subtotal, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-500">
                {cartT("tax")} · {taxRate}%
              </dt>
              <dd className="text-ink-800 tabular-nums">{formatPrice(tax, locale)}</dd>
            </div>
            <div className="border-paper-300 flex items-baseline justify-between border-t pt-3">
              <dt className="text-ink-800 font-semibold">{cartT("total")}</dt>
              <dd className="font-display text-pks-600 text-2xl tabular-nums">
                {formatPrice(total, locale)}
              </dd>
            </div>
          </dl>

          <AnimatePresence>
            {formError && (
              <motion.p
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="bg-pks-50 text-pks-700 mt-5 flex items-start gap-2 rounded-xl p-3.5 text-sm"
              >
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {formError}
              </motion.p>
            )}
          </AnimatePresence>

          <button
            type="submit"
            disabled={submitting}
            className="group bg-pks-500 relative mt-6 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-4 text-sm font-semibold text-white disabled:opacity-70"
          >
            <span className="from-gold-300 to-gold-500 absolute inset-0 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
            <span className="group-hover:text-ink-900 relative flex items-center gap-2 transition-colors">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? t("placing") : t("place")}
            </span>
          </button>

          <p className="text-ink-400 mt-4 text-[11px] leading-relaxed">
            {t("gatewayNote")}
          </p>
          <p className="text-ink-400 mt-2 text-[11px]">
            FBR · {taxInfo.card_payment_percent}% / {taxInfo.cash_payment_percent}%
          </p>
        </div>
      </div>
    </form>
  );
}

function FieldError({ message }: { message: string }) {
  return (
    <motion.p
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-pks-600 mt-2 flex items-center gap-1.5 text-xs"
    >
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </motion.p>
  );
}

export default CheckoutForm;
