import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { auth } from "@/lib/auth";
import { getAdminLocale } from "@/lib/admin-locale";
import PksCrest from "@/components/PksCrest";
import LoginForm from "./LoginForm";
import { setAdminLocale } from "../actions";

export default async function LoginPage() {
  const session = await auth();
  if (session?.user) redirect("/admin");

  const t = await getTranslations("admin");
  const locale = await getAdminLocale();
  const other = locale === "en" ? "ur" : "en";

  return (
    <main className="flex min-h-svh items-center justify-center px-5 py-16">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center text-center">
          <PksCrest className="h-20 w-20" />
          <h1 className="font-display text-ink-800 mt-6 text-2xl">
            Pak Khyber Shinwari
          </h1>
          <p className="text-ink-400 mt-1 text-[11px] tracking-[0.24em] uppercase">
            {t("signIn")}
          </p>
        </div>

        <div className="border-paper-300 mt-9 rounded-2xl border bg-white p-7 shadow-sm">
          <LoginForm
            labels={{
              email: t("email"),
              password: t("password"),
              submit: t("signInButton"),
              submitting: t("signingIn"),
            }}
          />
        </div>

        <p className="text-ink-400 mt-6 text-center text-xs leading-relaxed">
          {t("accountsNote")}
        </p>

        {/* The language switch has to be reachable before signing in — a
            manager who cannot read the form cannot get past it. */}
        <form action={setAdminLocale} className="mt-6 flex justify-center">
          <input type="hidden" name="locale" value={other} />
          <button
            type="submit"
            className="border-paper-400 text-ink-500 hover:border-pks-500 hover:text-pks-600 rounded-full border px-4 py-1.5 text-xs transition-colors"
          >
            {t("language")}
          </button>
        </form>
      </div>
    </main>
  );
}
