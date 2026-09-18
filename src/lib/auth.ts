import NextAuth, { type DefaultSession } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import { z } from "zod";
import { db } from "@/lib/db";

/* ---------------------------------------------------------------
   Staff authentication.

   There is no public sign-up. The owner creates accounts (see
   scripts/create-user.ts) and everyone signs in with email + password.

   Sessions are JWTs rather than database rows: the panel is small, the
   role rarely changes, and it keeps every page load from hitting the
   database just to prove who is looking.
   --------------------------------------------------------------- */

export const ROLES = ["OWNER", "MANAGER"] as const;
export type Role = (typeof ROLES)[number];

declare module "next-auth" {
  interface Session {
    user: { id: string; role: Role } & DefaultSession["user"];
  }
  interface User {
    role?: Role;
  }
}

/** What we put on the token beyond the defaults. */
type TokenExtras = { id?: string; role?: Role };

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  session: { strategy: "jwt", maxAge: 60 * 60 * 12 },
  pages: { signIn: "/admin/login" },
  trustHost: true,
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;

        const user = await db.user.findUnique({
          where: { email: parsed.data.email.toLowerCase().trim() },
        });

        // Compare a hash either way. Returning early on an unknown email
        // makes the response measurably faster and tells an attacker which
        // addresses are real.
        const hash =
          user?.passwordHash ??
          "$2a$10$invalidinvalidinvalidinvalidinvalidinvalidinvalidinvalidin";
        const ok = await bcrypt.compare(parsed.data.password, hash);

        if (!user || !ok || !user.active) return null;

        await db.user.update({
          where: { id: user.id },
          data: { lastLoginAt: new Date() },
        });

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        const extras = token as TokenExtras;
        extras.id = user.id;
        extras.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      const extras = token as TokenExtras;
      if (extras.id) session.user.id = extras.id;
      if (extras.role) session.user.role = extras.role;
      return session;
    },
  },
});

/** True when this role may change prices, menu structure or staff. */
export function canManageMenu(role: Role | undefined): boolean {
  return role === "OWNER";
}
