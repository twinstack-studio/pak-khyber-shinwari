import path from "node:path";
import { defineConfig } from "prisma/config";
import "dotenv/config";

/**
 * Prisma 7 keeps the connection URL here rather than in schema.prisma.
 * One Postgres URL serves local development and production alike; the two
 * simply point at different databases.
 */
export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  migrations: {
    path: path.join("prisma", "migrations"),
  },
  datasource: {
    url: process.env.DATABASE_URL ?? "",
  },
});
