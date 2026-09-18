import { PrismaClient } from "@/generated/prisma";
import { PrismaPg } from "@prisma/adapter-pg";

/**
 * One Prisma client for the process.
 *
 * Next's dev server reloads modules on every edit; without stashing the
 * client on globalThis each reload opens another connection until the
 * database refuses new ones. On Vercel each serverless instance gets its
 * own, which is what a connection pooler is for.
 *
 * The client is built on first use rather than on import. Most of this site
 * is static pages that never touch the database, and a missing DATABASE_URL
 * should not stop those being built — it should surface when something
 * actually runs a query.
 */
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getClient(): PrismaClient {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "DATABASE_URL is not set. Copy .env.example to .env and point it at a Postgres database.",
    );
  }

  const client = new PrismaClient({
    adapter: new PrismaPg({ connectionString }),
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

/**
 * Behaves like a PrismaClient, but only constructs one the first time a
 * property is read — which is the first time anything queries.
 */
export const db = new Proxy({} as PrismaClient, {
  get(_target, property) {
    const client = getClient();
    const value = Reflect.get(client, property, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
});
