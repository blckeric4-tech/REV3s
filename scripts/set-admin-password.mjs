/**
 * Set the admin password by writing a bcrypt hash into the AdminUser table.
 *
 * Why this exists: `ADMIN_PASSWORD` in the environment is NOT what admin login
 * checks. `src/lib/auth.ts` compares the submitted password against
 * `AdminUser.passwordHash` in the database. The env value is only a fallback for
 * the session secret. So setting ADMIN_PASSWORD alone changes nothing — the row
 * in the database has to be updated too, or nobody can log in.
 *
 * Run it once against whichever database you are deploying:
 *     $env:DATABASE_URL="mysql://..."; node scripts/set-admin-password.mjs
 *
 * The password is read from ADMIN_PASSWORD in the environment, so it never
 * appears in shell history or in this file. Hash cost is 12, matching
 * `customerSignUp`.
 */
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const EMAIL = process.env.ADMIN_EMAIL;
const PASSWORD = process.env.ADMIN_PASSWORD;
const BCRYPT_COST = 12;

if (!EMAIL || !PASSWORD) {
  console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD first.");
  process.exit(1);
}

const db = new PrismaClient();

try {
  const existing = await db.adminUser.findUnique({ where: { email: EMAIL } });

  if (!existing) {
    console.error(`No AdminUser row for ${EMAIL}.`);
    console.error("Run `npm run db:seed` first, or create the row, then re-run.");
    process.exit(1);
  }

  const passwordHash = await bcrypt.hash(PASSWORD, BCRYPT_COST);
  await db.adminUser.update({ where: { email: EMAIL }, data: { passwordHash } });

  // Read the value back rather than trusting the write.
  const saved = await db.adminUser.findUnique({ where: { email: EMAIL } });
  const verifies = await bcrypt.compare(PASSWORD, saved.passwordHash);

  console.log(`Password updated for ${EMAIL}.`);
  console.log(`Verifies against the stored hash: ${verifies}`);
  if (!verifies) {
    console.error("Verification failed — do not deploy this database.");
    process.exit(1);
  }
} catch (err) {
  console.error("Failed:", err.message);
  process.exitCode = 1;
} finally {
  await db.$disconnect();
}
