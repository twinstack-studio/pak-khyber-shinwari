"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;
const KINDS = ["GENERAL", "EVENT", "FEEDBACK"] as const;

export function EnquiryForm() {
  const t = useTranslations("contact");

  const [kind, setKind] = useState<(typeof KINDS)[number]>("GENERAL");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [guests, setGuests] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [message, setMessage] = useState("");
  const [honeypot, setHoneypot] = useState("");

  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);

  const errorText = (key: string) => {
    const path = `errors.${key}`;
    const text = t(path);
    return text === path ? t("errors.serverError") : text;
  };

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    if (sending) return;

    setSending(true);
    setFieldErrors({});
    setFormError(null);

    try {
      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          email,
          kind,
          guests: guests ? Number(guests) : null,
          eventDate,
          message,
          honeypot,
        }),
      });
      const body = await response.json();

      if (!response.ok) {
        if (body.error === "validation" && body.fields) setFieldErrors(body.fields);
        else setFormError(errorText(body.error ?? "serverError"));
        setSending(false);
        return;
      }

      setSent(true);
      setSending(false);
    } catch {
      setFormError(t("errors.network"));
      setSending(false);
    }
  }

  const inputBase =
    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-pks-500";
  const field = (key: string) =>
    `${inputBase} ${fieldErrors[key] ? "border-pks-500" : "border-paper-400"}`;

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="border-paper-300 flex flex-col items-center rounded-2xl border bg-white p-10 text-center"
      >
        <CheckCircle2 className="text-shinwari-500 h-10 w-10" />
        <p className="text-ink-700 mt-5 text-base leading-relaxed">{t("sent")}</p>
        <button
          type="button"
          onClick={() => {
            setSent(false);
            setMessage("");
            setGuests("");
            setEventDate("");
          }}
          className="text-pks-600 mt-6 text-sm font-semibold"
        >
          {t("sendAnother")}
        </button>
      </motion.div>
    );
  }

  return (
    <form onSubmit={submit} className="border-paper-300 rounded-2xl border bg-white p-6 sm:p-8">
      <p className="text-ink-700 mb-3 text-sm font-semibold">{t("kind")}</p>
      <div className="flex flex-wrap gap-2">
        {KINDS.map((option) => {
          const selected = kind === option;
          return (
            <button
              key={option}
              type="button"
              onClick={() => setKind(option)}
              aria-pressed={selected}
              className={`relative overflow-hidden rounded-full border px-4 py-2 text-xs font-semibold transition-colors ${
                selected
                  ? "border-pks-500 text-white"
                  : "border-paper-400 text-ink-500 hover:border-pks-300"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="enquiry-kind"
                  className="bg-pks-500 absolute inset-0"
                  transition={{ type: "spring", stiffness: 340, damping: 32 }}
                />
              )}
              <span className="relative">{t(`kind${option}`)}</span>
            </button>
          );
        })}
      </div>

      <div className="mt-7 grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="c-name" className="text-ink-700 mb-2 block text-sm font-semibold">
            {t("name")}
          </label>
          <input
            id="c-name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            autoComplete="name"
            className={field("name")}
          />
          {fieldErrors.name && <Err message={errorText(fieldErrors.name)} />}
        </div>

        <div>
          <label htmlFor="c-phone" className="text-ink-700 mb-2 block text-sm font-semibold">
            {t("phone")}
          </label>
          <input
            id="c-phone"
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            inputMode="tel"
            autoComplete="tel"
            dir="ltr"
            placeholder="0315 3043333"
            className={`${field("phone")} text-start`}
          />
          {fieldErrors.phone && <Err message={errorText(fieldErrors.phone)} />}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="c-email" className="text-ink-700 mb-2 block text-sm font-semibold">
            {t("email")} <span className="text-ink-400 font-normal">({t("optional")})</span>
          </label>
          <input
            id="c-email"
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            autoComplete="email"
            dir="ltr"
            className={`${field("email")} text-start`}
          />
          {fieldErrors.email && <Err message={errorText(fieldErrors.email)} />}
        </div>
      </div>

      {/* Guest count and date only matter for an event. */}
      <AnimatePresence initial={false}>
        {kind === "EVENT" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="overflow-hidden"
          >
            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="c-guests" className="text-ink-700 mb-2 block text-sm font-semibold">
                  {t("guests")}
                </label>
                <input
                  id="c-guests"
                  type="number"
                  min={1}
                  max={2000}
                  value={guests}
                  onChange={(event) => setGuests(event.target.value)}
                  className={field("guests")}
                />
              </div>
              <div>
                <label htmlFor="c-date" className="text-ink-700 mb-2 block text-sm font-semibold">
                  {t("eventDate")}
                </label>
                <input
                  id="c-date"
                  type="date"
                  value={eventDate}
                  onChange={(event) => setEventDate(event.target.value)}
                  className={field("eventDate")}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="mt-5">
        <label htmlFor="c-message" className="text-ink-700 mb-2 block text-sm font-semibold">
          {t("message")}
        </label>
        <textarea
          id="c-message"
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={4}
          placeholder={t("messagePlaceholder")}
          className={`${field("message")} resize-none`}
        />
        {fieldErrors.message && <Err message={errorText(fieldErrors.message)} />}
      </div>

      {/* Bots fill in every field they find; people never see this one. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="c-website">Website</label>
        <input
          id="c-website"
          name="website"
          tabIndex={-1}
          autoComplete="off"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      {formError && (
        <p className="bg-pks-50 text-pks-700 mt-5 flex items-start gap-2 rounded-xl p-3.5 text-sm">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {formError}
        </p>
      )}

      <button
        type="submit"
        disabled={sending}
        className="group bg-pks-500 relative mt-7 flex w-full items-center justify-center gap-2 overflow-hidden rounded-full py-4 text-sm font-semibold text-white disabled:opacity-70"
      >
        <span className="from-gold-300 to-gold-500 absolute inset-0 origin-left scale-x-0 bg-gradient-to-r transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
        <span className="group-hover:text-ink-900 relative flex items-center gap-2 transition-colors">
          {sending && <Loader2 className="h-4 w-4 animate-spin" />}
          {sending ? t("sending") : t("send")}
        </span>
      </button>
    </form>
  );
}

function Err({ message }: { message: string }) {
  return (
    <p className="text-pks-600 mt-2 flex items-center gap-1.5 text-xs">
      <AlertCircle className="h-3.5 w-3.5 shrink-0" />
      {message}
    </p>
  );
}

export default EnquiryForm;
