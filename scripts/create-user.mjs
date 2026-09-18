/**
 * Create or update a staff account.
 *
 *   node scripts/create-user.mjs <email> <name> <OWNER|MANAGER> [password]
 *
 * With no password a strong one is generated and printed once. There is no
 * public sign-up: this script is the only way an account comes into being.
 */
import { PrismaClient } from "../src/generated/prisma/index.js";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { randomBytes } from "node:crypto";
import "dotenv/config";

const [, , email, name, role = "MANAGER", passwordArg] = process.argv;

if (!email || !name) {
  console.error(
    "Usage: node scripts/create-user.mjs <email> <name> <OWNER|MANAGER> [password]",
  );
  process.exit(1);
}

if (!["OWNER", "MANAGER"].includes(role)) {
  console.error(`Role must be OWNER or MANAGER, got "${role}"`);
  process.exit(1);
}

const password =
  passwordArg ?? randomBytes(9).toString("base64url").replace(/[-_]/g, "x");

if (!process.env.DATABASE_URL) {
  console.error("DATABASE_URL is not set. Point it at your Postgres database first.");
  process.exit(1);
}

const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});

const passwordHash = await bcrypt.hash(password, 12);
const normalised = email.toLowerCase().trim();

const user = await db.user.upsert({
  where: { email: normalised },
  update: { name, role, passwordHash, active: true },
  create: { email: normalised, name, role, passwordHash },
});

console.log(`\n  ${user.role} account ready`);
console.log(`  email    ${user.email}`);
console.log(`  name     ${user.name}`);
if (!passwordArg) {
  console.log(`  password ${password}`);
  console.log(`\n  Save this now — it is not stored anywhere in readable form.`);
}
console.log();

await db.$disconnect();
