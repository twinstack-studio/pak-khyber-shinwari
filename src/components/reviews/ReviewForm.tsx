"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { motion } from "motion/react";
import { AlertCircle, CheckCircle2, Loader2, Star } from "lucide-react";

const EASE = [0.16, 1, 0.3, 1] as const;

export function ReviewForm() {
  const t = useTranslations("reviews");
  const locale = useLocale();

  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");
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
      const response = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, rating, comment, locale, honeypot }),
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

  if (sent) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.97 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: EASE }}
        className="border-paper-300 flex flex-col items-center rounded-2xl border bg-white p-10 text-center"
      >
        <CheckCircle2 className="text-shinwari-500 h-10 w-10" />
        <p className="text-ink-700 mt-5 text-base leading-relaxed">{t("thanks")}</p>
      </motion.div>
    );
  }

  const inputBase =
    "w-full rounded-xl border bg-white px-4 py-3 text-sm text-ink-800 outline-none transition-colors placeholder:text-ink-400 focus:border-pks-500";
  const field = (key: string) =>
    `${inputBase} ${fieldErrors[key] ? "border-pks-500" : "border-paper-400"}`;

  return (
    <form onSubmit={submit} className="border-paper-300 rounded-2xl border bg-white p-6 sm:p-8">
      <p className="text-ink-700 mb-3 text-sm font-semibold">{t("rating")}</p>
      <div
        className="flex gap-1.5"
        onMouseLeave={() => setHovered(0)}
        role="radiogroup"
        aria-label={t("rating")}
      >
        {[1, 2, 3, 4, 5].map((value) => {
          const lit = value <= (hovered || rating);
          return (
            <button
              key={value}
              type="button"
              role="radio"
              aria-checked={rating === value}
              aria-label={`${value}`}
              onMouseEnter={() => setHovered(value)}
              onClick={() => setRating(value)}
              className="p-1"
            >
              <motion.span
                animate={{ scale: lit ? 1.06 : 1 }}
                transition={{ type: "spring", stiffness: 400, damping: 18 }}
                className="block"
              >
                <Star
                  className={`h-7 w-7 transition-colors ${
                    lit ? "fill-gold-500 text-gold-500" : "text-paper-400"
                  }`}
                />
              </motion.span>
            </button>
          );
        })}
      </div>
      {fieldErrors.rating && <Err message={errorText(fieldErrors.rating)} />}

      <div className="mt-6">
        <label htmlFor="r-name" className="text-ink-700 mb-2 block text-sm font-semibold">
          {t("name")}
        </label>
        <input
          id="r-name"
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
          className={field("name")}
        />
        {fieldErrors.name && <Err message={errorText(fieldErrors.name)} />}
      </div>

      <div className="mt-5">
        <label htmlFor="r-comment" className="text-ink-700 mb-2 block text-sm font-semibold">
          {t("comment")}
        </label>
        <textarea
          id="r-comment"
          value={comment}
          onChange={(event) => setComment(event.target.value)}
          rows={4}
          placeholder={t("commentPlaceholder")}
          className={`${field("comment")} resize-none`}
        />
        {fieldErrors.comment && <Err message={errorText(fieldErrors.comment)} />}
      </div>

      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label htmlFor="r-website">Website</label>
        <input
          id="r-website"
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
          {sending ? t("sending") : t("submit")}
        </span>
      </button>

      <p className="text-ink-400 mt-4 text-center text-[11px]">{t("moderationNote")}</p>
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

export default ReviewForm;
