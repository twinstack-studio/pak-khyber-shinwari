import { getTranslations } from "next-intl/server";
import { Phone, Mail, Users, CalendarDays } from "lucide-react";
import { db } from "@/lib/db";
import { getAdminLocale } from "@/lib/admin-locale";
import { setEnquiryStatus } from "../../actions";

export const dynamic = "force-dynamic";

const KIND_TONE: Record<string, string> = {
  GENERAL: "bg-paper-300 text-ink-600",
  EVENT: "bg-gold-500 text-ink-900",
  FEEDBACK: "bg-pks-100 text-pks-700",
};

/** Enquiries from the contact form, newest first. */
export default async function AdminMessagesPage() {
  const t = await getTranslations("admin");
  const locale = await getAdminLocale();

  const enquiries = await db.enquiry.findMany({
    orderBy: { createdAt: "desc" },
    take: 200,
  });

  const fresh = enquiries.filter((row) => row.status === "NEW");
  const handled = enquiries.filter((row) => row.status === "HANDLED");

  const formatDate = (date: Date) =>
    new Intl.DateTimeFormat(locale === "ur" ? "ur-PK" : "en-PK", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "Asia/Karachi",
    }).format(date);

  function Card({ enquiry }: { enquiry: (typeof enquiries)[number] }) {
    const handledAlready = enquiry.status === "HANDLED";
    return (
      <li className="border-paper-300 rounded-2xl border bg-white p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="flex flex-wrap items-center gap-2.5">
              <p className="text-ink-800 text-sm font-semibold">{enquiry.name}</p>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold tracking-wide uppercase ${
                  KIND_TONE[enquiry.kind] ?? KIND_TONE.GENERAL
                }`}
              >
                {t(`kind${enquiry.kind}`)}
              </span>
            </div>
            <p className="text-ink-400 mt-0.5 text-xs">
              {formatDate(enquiry.createdAt)}
            </p>
          </div>

          <div className="flex flex-col items-end gap-1 text-xs">
            <a
              href={`tel:${enquiry.phone}`}
              className="text-pks-600 inline-flex items-center gap-1.5"
              dir="ltr"
            >
              <Phone className="h-3.5 w-3.5" />
              {enquiry.phone}
            </a>
            {enquiry.email && (
              <a
                href={`mailto:${enquiry.email}`}
                className="text-ink-500 inline-flex items-center gap-1.5"
                dir="ltr"
              >
                <Mail className="h-3.5 w-3.5" />
                {enquiry.email}
              </a>
            )}
          </div>
        </div>

        {/* Guest count and date only exist on an event enquiry. */}
        {(enquiry.guests || enquiry.eventDate) && (
          <div className="text-ink-600 mt-3 flex flex-wrap gap-4 text-xs">
            {enquiry.guests && (
              <span className="inline-flex items-center gap-1.5">
                <Users className="text-pks-500 h-3.5 w-3.5" />
                {enquiry.guests} {t("guests")}
              </span>
            )}
            {enquiry.eventDate && (
              <span className="inline-flex items-center gap-1.5" dir="ltr">
                <CalendarDays className="text-pks-500 h-3.5 w-3.5" />
                {enquiry.eventDate}
              </span>
            )}
          </div>
        )}

        <p className="text-ink-600 mt-3.5 text-sm leading-relaxed whitespace-pre-line">
          {enquiry.message}
        </p>

        <form action={setEnquiryStatus} className="border-paper-300 mt-4 border-t pt-4">
          <input type="hidden" name="enquiryId" value={enquiry.id} />
          <input
            type="hidden"
            name="status"
            value={handledAlready ? "NEW" : "HANDLED"}
          />
          <button
            type="submit"
            className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
              handledAlready
                ? "border-paper-400 text-ink-500 hover:border-pks-500 hover:text-pks-600"
                : "border-pks-500 bg-pks-500 text-white hover:bg-pks-600"
            }`}
          >
            {handledAlready ? t("markNew") : t("markHandled")}
          </button>
        </form>
      </li>
    );
  }

  const sections = [
    { key: "messagesNew", items: fresh },
    { key: "messagesHandled", items: handled },
  ] as const;

  return (
    <>
      <h1 className="font-display text-ink-800 text-3xl">{t("messagesTitle")}</h1>
      <p className="text-ink-400 mt-1 max-w-xl text-sm leading-relaxed">
        {t("messagesIntro")}
      </p>

      {enquiries.length === 0 ? (
        <div className="border-paper-300 mt-8 rounded-2xl border border-dashed bg-white py-20 text-center">
          <p className="text-ink-400 text-sm">{t("noMessages")}</p>
        </div>
      ) : (
        <div className="mt-8 space-y-10">
          {sections.map((section) =>
            section.items.length === 0 ? null : (
              <section key={section.key}>
                <h2 className="text-ink-400 text-[10px] tracking-[0.22em] uppercase">
                  {t(section.key)}
                  <span className="ms-2 tabular-nums">{section.items.length}</span>
                </h2>
                <ul className="mt-4 space-y-4">
                  {section.items.map((enquiry) => (
                    <Card key={enquiry.id} enquiry={enquiry} />
                  ))}
                </ul>
              </section>
            ),
          )}
        </div>
      )}
    </>
  );
}
