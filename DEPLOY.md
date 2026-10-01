# RAV3S — Deployment Notes (GitHub + Render + TiDB)

This file gets you online in one pass. It is short on purpose.

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

## 2) GitHub (push the code)
We already initialized git and committed here. Create a repository on GitHub (no README), then push from this folder:

```bash
gh repo create rav3s --private --source=. --remote=origin --push
```

If `gh` isn't authenticated on this machine, create the repo in the browser and run:
```bash
git remote add origin https://github.com/<you>/rav3s.git
git branch -M main
git push -u origin main
```

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
We have a local `prisma/dev.db` with products, variants, settings, demo customer/orders. To copy them to TiDB:

```powershell
# Preview what will be written
$env:DRY_RUN="1"; node scripts/migrate-sqlite-to-tidb.mjs

# If the preview matches (10 products, 203 variants, 4 orders...), run it for real
$env:DRY_RUN="0"; node scripts/migrate-sqlite-to-tidb.mjs
```

The migrator converts SQLite epoch-millis dates to proper JavaScript Dates and normalises booleans — exactly what MySQL expects. It uses upserts, so it's safe to re-run.

**Important:** before running, set `DATABASE_URL` to the real TiDB string (not SQLite):

```powershell
$env:DATABASE_URL="mysql://USER:PASSWORD@HOST:4000/rav3s?sslaccept=strict"
```

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