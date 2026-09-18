import { getTranslations } from "next-intl/server";
import { auth, canManageMenu } from "@/lib/auth";
import { db } from "@/lib/db";
import { categories, formatPrice, t as pick } from "@/lib/menu";
import { getAdminLocale } from "@/lib/admin-locale";
import { clearAllSoldOut, setItemAvailability } from "../../actions";

export const dynamic = "force-dynamic";

/**
 * Marking dishes sold out.
 *
 * The menu itself lives in data/menu.json — it is the printed card and it
 * does not change often. What changes daily is whether the trout arrived, so
 * that is all this page touches. Prices and dish names are the owner's to
 * change, and they are not editable here.
 */
export default async function AvailabilityPage() {
  const session = await auth();
  const isOwner = canManageMenu(session?.user?.role);
  const t = await getTranslations("admin");
  const locale = await getAdminLocale();

  const rows = await db.itemAvailability.findMany({
    where: { soldOut: true },
    include: { updatedBy: { select: { name: true } } },
  });
  const soldOut = new Map(rows.map((row) => [row.itemId, row]));

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-ink-800 text-3xl">{t("soldOutTitle")}</h1>
          <p className="text-ink-400 mt-1 max-w-xl text-sm leading-relaxed">
            {t("soldOutIntro")}
          </p>
        </div>

        {isOwner && soldOut.size > 0 && (
          <form action={clearAllSoldOut}>
            <button
              type="submit"
              className="border-paper-400 text-ink-600 hover:border-pks-500 hover:text-pks-600 rounded-full border bg-white px-5 py-2.5 text-sm font-semibold transition-colors"
            >
              {t("backOnAll", { count: soldOut.size })}
            </button>
          </form>
        )}
      </div>

      {soldOut.size > 0 && (
        <div className="border-pks-200 bg-pks-50 mt-6 rounded-xl border p-4">
          <p className="text-pks-700 text-sm font-semibold">
            {t("soldOutCount", { count: soldOut.size })}
          </p>
        </div>
      )}

      <div className="mt-8 space-y-10">
        {categories.map((category) => (
          <section key={category.id}>
            <h2 className="font-display text-ink-800 border-paper-300 border-b pb-2 text-xl">
              {pick(category.name, locale)}
            </h2>

            <ul className="mt-1">
              {category.items.map((item) => {
                const row = soldOut.get(item.id);
                const off = Boolean(row);
                return (
                  <li
                    key={item.id}
                    className="border-paper-300 flex items-center gap-4 border-b py-3"
                  >
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          off ? "text-ink-400 line-through" : "text-ink-800"
                        }`}
                      >
                        {pick(item.name, locale)}
                        {item.variant && (
                          <span className="text-ink-400 font-normal">
                            {" "}
                            · {pick(item.variant, locale)}
                          </span>
                        )}
                      </p>
                      {/* Always show the other language underneath — staff
                          read the ticket in one and the card in the other. */}
                      <p
                        className="text-ink-400 mt-0.5 text-xs"
                        dir={locale === "ur" ? "ltr" : "rtl"}
                      >
                        {locale === "ur" ? item.name.en : item.name.ur}
                      </p>
                      {row?.updatedBy && (
                        <p className="text-ink-400 mt-0.5 text-[11px]">
                          {t("switchedOffBy", { name: row.updatedBy.name })}
                        </p>
                      )}
                    </div>

                    <span className="text-ink-500 shrink-0 text-sm tabular-nums">
                      {formatPrice(item.price, locale)}
                    </span>

                    <form action={setItemAvailability} className="shrink-0">
                      <input type="hidden" name="itemId" value={item.id} />
                      <input
                        type="hidden"
                        name="soldOut"
                        value={off ? "false" : "true"}
                      />
                      <button
                        type="submit"
                        className={`rounded-full border px-4 py-1.5 text-xs font-semibold transition-colors ${
                          off
                            ? "border-shinwari-400 text-shinwari-700 hover:bg-shinwari-100"
                            : "border-paper-400 text-ink-500 hover:border-pks-500 hover:text-pks-600"
                        }`}
                      >
                        {off ? t("markBackOn") : t("markSoldOut")}
                      </button>
                    </form>
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
      </div>
    </>
  );
}
