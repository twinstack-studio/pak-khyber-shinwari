import { redirect } from "next/navigation";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { LogOut, Package, UtensilsCrossed, Star, Mail, Languages } from "lucide-react";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { getAdminLocale } from "@/lib/admin-locale";
import PksCrest from "@/components/PksCrest";
import { signOutAction, setAdminLocale } from "../actions";

/**
 * Everything inside this group requires a session. The check runs here, in a
 * server layout, so a missing session never renders a single row of anyone's
 * order data — and every child page inherits the guard without repeating it.
 */
export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user) redirect("/admin/login");

  const t = await getTranslations("admin");
  const locale = await getAdminLocale();
  const other = locale === "en" ? "ur" : "en";

  // The badges are the reason a manager opens this panel at all.
  const [openOrders, pendingReviews, newMessages] = await Promise.all([
    db.order.count({
      where: {
        status: { in: ["PLACED", "CONFIRMED", "PREPARING", "READY", "ON_THE_WAY"] },
      },
    }),
    db.review.count({ where: { approved: false } }),
    db.enquiry.count({ where: { status: "NEW" } }),
  ]);

  const links = [
    { href: "/admin", label: t("navOrders"), Icon: Package, badge: openOrders },
    { href: "/admin/availability", label: t("navSoldOut"), Icon: UtensilsCrossed },
    { href: "/admin/reviews", label: t("navReviews"), Icon: Star, badge: pendingReviews },
    { href: "/admin/messages", label: t("navMessages"), Icon: Mail, badge: newMessages },
  ];

  return (
    <div className="min-h-svh">
      <header className="border-paper-300 sticky top-0 z-40 border-b bg-white/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-5">
          <Link href="/admin" className="flex shrink-0 items-center gap-2.5">
            <PksCrest className="h-9 w-9" />
            <span className="text-ink-800 hidden text-sm font-bold sm:block">
              {t("staff")}
            </span>
          </Link>

          <nav className="flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-ink-600 hover:bg-paper-200 hover:text-pks-600 inline-flex shrink-0 items-center gap-2 rounded-full px-3.5 py-2 text-sm transition-colors"
              >
                <link.Icon className="h-4 w-4" />
                {link.label}
                {link.badge ? (
                  <span className="bg-pks-500 rounded-full px-1.5 text-[11px] font-bold text-white tabular-nums">
                    {link.badge}
                  </span>
                ) : null}
              </Link>
            ))}
          </nav>

          <div className="ms-auto flex shrink-0 items-center gap-3">
            <form action={setAdminLocale}>
              <input type="hidden" name="locale" value={other} />
              <button
                type="submit"
                className="border-paper-400 text-ink-600 hover:border-pks-500 hover:text-pks-600 inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs transition-colors"
              >
                <Languages className="h-3.5 w-3.5" />
                {t("language")}
              </button>
            </form>

            <span className="hidden text-end leading-tight sm:block">
              <span className="text-ink-800 block text-xs font-semibold">
                {session.user.name}
              </span>
              <span className="text-ink-400 block text-[10px] tracking-widest uppercase">
                {session.user.role}
              </span>
            </span>

            <form action={signOutAction}>
              <button
                type="submit"
                className="text-ink-500 hover:bg-paper-200 hover:text-pks-600 rounded-full p-2 transition-colors"
                aria-label={t("signOut")}
              >
                <LogOut className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-8">{children}</main>
    </div>
  );
}
