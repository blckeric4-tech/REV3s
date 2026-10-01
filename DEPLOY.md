# RAV3S — Deployment Notes (GitHub + Render + TiDB)

This file gets you online in one pass. It is short on purpose.

## 0) Where things actually stand

Verified working on this machine:

- `npm run lint` — clean.
- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds, all 27 routes render.
- `/`, `/shop`, `/account/sign-in`, `/admin/login` — all HTTP 200.
- The full schema was pushed to a real MySQL server (MariaDB 13, local, port
  3306) and the SQLite → MySQL row migration ran clean: 10 products, 203
  variants, 2 customers, 4 orders, 7 order items, 1 settings row.

Still to do — all of it needs accounts or credentials only you have:

1. Create the TiDB cluster and copy its connection string.
2. Push the commit to the GitHub repo (no `origin` remote is set yet).
3. Create the Render Blueprint service and paste the env vars.
4. Run the data migration + admin password against TiDB.
5. Add the Stripe webhook.

To run the site locally:

```powershell
# MariaDB must be running (it is not a Windows service — start it manually)
& 'C:\Program Files\MariaDB 13.0\bin\mariadbd.exe' --datadir=D:\mariadb-data --port=3306 --bind-address=127.0.0.1 --console
cd D:\RAV3S
npm run dev
```

## 1) TiDB Cloud (database)
Create a **TiDB Cloud Starter (free)** cluster:

1. Go to [TiDB Cloud](https://www.pingcap.com/tidb-cloud/), create an account, create a Starter cluster.
2. When the cluster is ready, click **Connect** (top right).
3. Connection type: **Public**. Connect with: **Prisma**.
4. Copy the connection string. For TiDB Starter it looks like:
   ```text
   mysql://USER:PASSWORD@HOST:4000/rav3s?sslaccept=strict
   ```
   (Do not remove `sslaccept=strict` — it is required for the public endpoint.)

   The `rav3s` part is the **database name**, and a Starter cluster starts with
   an empty one. If `prisma db push` fails with `Unknown database 'rav3s'`,
   create it first:

   ```sql
   CREATE DATABASE rav3s CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

   The host in the Connect dialog is region-specific and looks like
   `gateway-XX.<region>.prod.aws.tidbcloud.com` — the value that was previously
   in `.env` was a guess and did not resolve in DNS.

## 2) GitHub (push the code)

Git is installed and the repo is initialised on branch `main` with one commit
(`RAV3S storefront: initial commit`, 228 files). There is no `origin` remote yet.

The repository already exists on GitHub, so just add the remote and push:

```powershell
git remote add origin https://github.com/<you>/rav3s.git
git push -u origin main
```

Git Credential Manager will pop up to sign in. If the repo was created with a
README, the push will be rejected — either delete that README on GitHub first, or
use `git push -u origin main --force` (safe here: there is only one local commit
and nothing to lose).

> Note about uploads: every file under `public/uploads/` is committed on purpose. Render's filesystem is ephemeral (wiped on redeploy), so product and avatar photos would break without this. It's a short-term stopgap until we move to object storage (R2/S3).

## 3) Render (app host)
1. Go to [Render](https://render.com/) → **New → Blueprint**.
2. Connect your GitHub repo (`rav3s`).
3. Render will detect `render.yaml`. Create the service.
4. It will prompt for environment variables (all marked `sync: false`). Fill these:

| Key | Where to get it |
|---|---|
| `DATABASE_URL` | TiDB Prisma connection string (step 1) |
| `SESSION_SECRET` | Generate: `node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"` |
| `ADMIN_EMAIL` | Your admin login email (e.g. `hello@yourdomain.com`) |
| `ADMIN_PASSWORD` | Strong password (minimum 8–10 characters) |
| `NEXT_PUBLIC_SITE_URL` | Render URL once assigned, e.g. `https://rav3s.onrender.com` (no trailing slash) |
| `STRIPE_SECRET_KEY` | Stripe test/live secret key (starts `sk_...`) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_...` |
| `STRIPE_WEBHOOK_SECRET` | `whsec_...` (from Stripe webhooks) |
| `PAYPACK_*`, `FLW_*` | Optional. Leave blank to hide mobile-money methods at checkout. |

5. First deploy: Render runs `npm ci`, `prisma generate`, `prisma db push`, `npm run build`, then `npm start`. The schema will be pushed to TiDB.
6. Hit the Render URL. It should load.

## 4) Migrate existing data (SQLite → TiDB)

The local database is now **MariaDB on this machine** (port 3306), not SQLite —
`prisma/dev.db` is the old SQLite file and is kept only as the migration source.
`.env` points at the local MariaDB so `npm run dev` works offline.

To copy the current catalogue and settings into TiDB, override the URL for one
command. The migrator reads `prisma/dev.db` and writes to whatever
`DATABASE_URL` is set to, so the local database is left untouched:

```powershell
# Preview what will be written
$env:DATABASE_URL="mysql://USER:PASSWORD@HOST:4000/rav3s?sslaccept=strict"
$env:DRY_RUN="1"; node scripts/migrate-sqlite-to-tidb.mjs

# If the preview matches (10 products, 203 variants, 4 orders...), run it for real
$env:DRY_RUN="0"; node scripts/migrate-sqlite-to-tidb.mjs
```

The migrator converts SQLite epoch-millis dates to proper JavaScript Dates and
normalises booleans — exactly what MySQL expects. It uses upserts, so it's safe
to re-run.

### Then set the admin password on TiDB

The migrator copies the admin row with its **existing** bcrypt hash. That hash is
for the old password, and login in `src/lib/auth.ts` verifies against the hash —
*not* against `ADMIN_PASSWORD`. So set it explicitly on the target database, or
nobody will be able to sign in to `/admin`:

```powershell
$env:DATABASE_URL="mysql://USER:PASSWORD@HOST:4000/rav3s?sslaccept=strict"
$env:ADMIN_EMAIL="admin@rav3s.com"
$env:ADMIN_PASSWORD="<the same value you set in Render>"
node scripts/set-admin-password.mjs
```

Use the identical `ADMIN_PASSWORD` in Render and in this command, otherwise the
cookie-signing secret and the stored hash disagree.

## 5) Webhooks
- **Stripe**: add `https://YOUR-RENDER-URL/api/stripe/webhook` in Stripe, events include `checkout.session.completed`.
- **Paypack/Flutterwave**: same pattern under `/api/paypack/webhook` and `/api/flutterwave/webhook`. Their secrets go into the env vars above.

## 6) Post-deploy checks
- Visit `/` and `/shop` — product images load (they're the committed SVGs + the existing uploads folder).
- Sign in at `/account/sign-in` with the demo account `demo@rav3s.test` / `demo1234` (if migrated), or create a new one. The avatar upload appears inline on `/account`.
- Visit `/admin/login` with `ADMIN_EMAIL`/`ADMIN_PASSWORD`. Sign out uses the confirmation dialog.

## 7) Notes (production)
- `prisma db push` is used on every deploy (not migrations). That's appropriate while you're shipping rapidly; if you need schema history later you can switch to `prisma migrate deploy`.
- Images under `public/uploads/` survive redeploys because they're committed. New runtime uploads also write there, but those new files won't exist on the next Render deploy unless you commit/push them. For a production store, plan to move uploads to Cloudflare R2, AWS S3, or Supabase Storage.
- Session secret: if you rotate it, every signed-in customer and admin is logged out.
- Keep `NEXT_PUBLIC_SITE_URL` accurate — Stripe and payment providers use it to build redirect URLs.

## 8) Rollback
If anything goes wrong, revert to a previous Git commit on Render (Deploys → Rollback). The schema/data in TiDB remain as-is; `db push` does not auto-rollback. That is the trade-off of using `db push` over migrations.