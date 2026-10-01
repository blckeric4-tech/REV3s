# RAV3S — Project Handoff & Next Steps

**Last updated:** after the UI/UX overhaul of the customer account area.

Read this first if you are resuming the project cold. It should save you an hour of
investigation.

---

## 1. The one thing you need to know first

**The project is at `D:\RAV3S`, NOT `C:\Users\HP\Desktop\RAV3S`.**

The Desktop folder is empty — a leftover from the very first attempt. Drive C: was also
nearly full (2.35 GB free), which is why everything was moved to D:. Never create project
files on C:, and never copy the project back to the Desktop.

```
cd D:\RAV3S
```

---

## 2. Running and accessing the site

The site only exists while the dev server runs.

```powershell
cd D:\RAV3S
npm run dev
```

Leave that terminal open. Closing it stops the site.

| What | Where |
| --- | --- |
| This computer | http://localhost:3000 |
| Phone / other device, same Wi-Fi | http://192.168.56.1:3000 |
| Admin dashboard | http://localhost:3000/admin |

Admin credentials are in `D:\RAV3S\.env` as `ADMIN_EMAIL` and `ADMIN_PASSWORD`:

```powershell
Get-Content D:\RAV3S\.env
```

### Demo customer account (for reviewing the account pages)

```
email:    demo@rav3s.test
password: demo1234
```

Has 4 orders — one in every status (DELIVERED, SHIPPED, PAID, PENDING) — so all status
pills, timeline steps and stat tiles render with realistic content.

Recreate it any time:

```powershell
node seed-demo-account.mjs
```

**Delete it when you are finished reviewing:**

```powershell
node -e "const{PrismaClient}=require('@prisma/client');const d=new PrismaClient();d.customer.deleteMany({where:{email:'demo@rav3s.test'}}).then(r=>{console.log('deleted',r.count);return d.\$disconnect()})"
```

Customer accounts cannot currently be deleted from the admin UI — another reason to
remove the demo row before going live.

**The entire database is one file:** `D:\RAV3S\prisma\dev.db`. Products, orders and
customer accounts are all in it. Back the site up by copying that single file.

---

## 3. Verification commands

Run all three before calling any work finished. All currently pass.

```powershell
cd D:\RAV3S
npm run lint
npx tsc --noEmit
npm run build
```

There is no automated test suite. Verification has been lint + typecheck + production
build + manual HTTP checks against the dev server.

---

## 4. Environment gotchas — each of these has already cost time

1. **`prisma generate` fails with `EPERM` if the dev server is running.** The Node
   process holds the Prisma engine DLL.
   ```powershell
   Get-Process node | Stop-Process -Force
   npx prisma generate
   ```
2. **`prisma db push` is already done.** Schema and SQLite are in sync. Re-run only if
   `prisma/schema.prisma` changes.
3. **Next.js 16 + React 19 differ from older tutorials.** Read `AGENTS.md`, and check
   `node_modules/next/dist/docs/` for anything framework-specific. Things that bit us:
   - `cookies()` from `next/headers` is **async** — must be awaited.
   - Page `params` and `searchParams` are **async** props — must be awaited, and
     `searchParams` values are `string | string[] | undefined`.
   - The guard file is `proxy.ts` at the project root exporting `proxy()` — not
     `middleware.ts` / `middleware()`.
   - **A `"use server"` file may only export async functions.** Exporting a plain object
     (e.g. `initialAuthState`) from `actions.ts` fails the build. Those live in
     `src/app/account/state.ts`.
4. **Git is now installed and the repo is initialised** (branch `main`, one
   commit). It was previously unavailable, which is why there was no history.
   There is still **no `origin` remote** — see `DEPLOY.md` section 2.
5. **Tailwind v4.** Never build class names dynamically. `object-${heroFit}` produces
   *no CSS at all* because the scanner only sees static literals. Write whole literal
   class names and choose between them with a ternary.

---

## 5. What has been built

### 5.1 Images are never cropped (original request)

Every uploaded photo displays in full.

| CSS class | Effect |
| --- | --- |
| `.media-fit` | `object-fit: contain` — whole photo always visible |
| `.media-fill` | `object-fit: cover` — fills and crops (hero only, admin opt-in) |
| `.media-mat` | neutral backdrop showing through when photo shape ≠ frame shape |
| `.media-mat-inverse` | same, for dark frames |

Converted in: `src/app/page.tsx` (hero, gallery, lookbook, story, rail),
`src/components/product-card.tsx`, `src/app/product/[slug]/page.tsx` (both grids),
`src/components/cart-view.tsx`, `src/app/about/page.tsx`,
`src/app/admin/(dashboard)/products/page.tsx`, `src/app/admin/(dashboard)/orders/[id]/page.tsx`,
`src/components/admin/image-picker.tsx`.

Zero `object-cover` / `object-fill` usages remain in `src/`.

**Colour decision:** `.mono-media` used to apply `grayscale(1)`, rendering every garment
grey. It is now `contrast(1.02) saturate(1.02)` — effectively a no-op. The *interface* is
strictly monochrome, but product photos keep real colour, because greyscale contradicts
the colour swatches shown beside each product. Do not reintroduce grayscale.

Hero keeps an admin setting (`heroFit` in `SiteSettings`, default `contain`).

### 5.2 Customer accounts

| File | Purpose |
| --- | --- |
| `src/lib/customer-auth.ts` | Session library. HMAC-signed `rav3s_customer` cookie, bcrypt cost 12, constant-time signature compare, login doing equal work whether or not the email exists. Server-only. |
| `src/lib/customer-auth-constants.ts` | Constants shared with client code. Split out because `customer-auth.ts` imports `server-only`. |
| `src/app/account/state.ts` | `AuthState` + `initialAuthState`. Split out because `"use server"` files may only export async functions. |
| `src/app/account/actions.ts` | `customerSignUp`, `customerSignIn`, `customerSignOut`, `customerUpdateName` |
| `src/components/account/auth-form.tsx` | Sign-in / sign-up form, split brand+form layout |
| `src/components/account/account-nav.tsx` | Tab rail: Overview / Orders / Details |
| `src/components/account/account-name-form.tsx` | Editable name field |
| `src/app/account/account-shell.tsx` | Shared account layout + `AccountEmpty` |
| `src/app/account/page.tsx` | Overview: stat tiles, recent orders, shortcut cards |
| `src/app/account/orders/page.tsx` | Order cards with thumbnails and status |
| `src/app/account/orders/[orderNumber]/page.tsx` | Single order + progress timeline |
| `src/app/account/details/page.tsx` | Personal details, sign-in info, session |

Security decisions already made — **keep them**:

- Customer and admin sessions are entirely separate: different cookie
  (`rav3s_customer` vs `rav3s_admin`), different guard, different table. A shopper can
  never reach `/admin`; an admin is never treated as a customer.
- All order queries filter by `customerId`. Guessing another shopper's order number
  returns 404.
- `safeNext()` blocks open redirects — `?next=` accepts only same-site paths starting
  with a single `/`, rejecting `//`.
- Duplicate sign-up emails rejected with a message pointing at sign-in.

### 5.3 Session wiring

- `src/app/layout.tsx` — `getCustomer()` result passed to the header.
- `src/components/site-header.tsx` — Sign in link when signed out; account menu with
  initials chip, My account, My orders, Sign out when signed in.
- `src/app/cart/page.tsx` + `src/components/cart-view.tsx` — checkout prefills from the
  account, email becomes read-only, "Paying as" strip, guest prompt. Page is
  `force-dynamic` because it now reads the session cookie.
- `src/app/api/checkout/route.ts` — attaches `customerId`. **When signed in the account's
  verified email and name override whatever the browser sent**, so an order can never be
  filed into someone else's history.
- `proxy.ts` — guards `/admin/:path*` and `/account/:path*`, exempts the sign-in/sign-up
  pages, redirects signed-in visitors away from them, stamps `?next=` on bounces.

### 5.4 Confirm dialog for destructive actions

`src/components/admin/confirm-button.tsx` exports `ConfirmDialog` (generic) and
`ConfirmButton` (convenience wrapper). Admin sign-out now asks "Sign out of admin?" before
running the action.

Features: warning strip, subject row (which admin account), Escape to cancel, **real
focus trap** on Tab/Shift+Tab, focus restored to the trigger on close, background scroll
locked, pending state, error recovery, mobile bottom-sheet presentation, `role="alertdialog"`.

**Reuse it** for deleting products and cancelling orders — see section 6.3.

### 5.5 Icon system

`src/components/icons.tsx` — one inline SVG icon set, shared by header, cart and the
whole account area.

Visual language, matched to the site's hairline monochrome identity:

- 24×24 viewBox, `fill="none"`, `stroke="currentColor"`
- `strokeWidth={1.6}`, round caps and joins
- No fills anywhere — filled shapes look pasted on next to 1px rules

Icons: `UserIcon`, `BagIcon`, `ChevronDownIcon`, `MenuIcon`, `CloseIcon`, `PackageIcon`,
`SettingsIcon`, `LogOutIcon`, `ArrowRightIcon`, `TruckIcon`, `RulerIcon`, `BoxIcon`,
`CheckIcon`, `ClockIcon`, `UploadIcon`, `TrashIcon`.

**Bag icon geometry** — if you redraw it, keep the handle arc springing from the two
ends of the rim. The first attempt drew the handle starting from *inside* the body,
which read as a strap poking out of the bag rather than being attached to it. Rim sits
at y=8.2 spanning x 5.6→18.4; the handle arc spans x 9.6→14.4 (exactly `2r`, so
`a2.4 2.4` gives a clean semicircle peaking at y=5.8); the body tapers to x 6.7→17.3 at
the base.

Conventions to preserve when adding more:

- Icons are `aria-hidden` by default; the accessible name always lives on the wrapping
  control. Pass `title` only when the icon is genuinely a control's sole content.
- Icon-only controls **must** carry an `aria-label`. The bag reads
  `Bag, 3 items` / `Bag, empty`.
- The bag badge is hidden at zero — an "0" chip is noise — and clamps at `99+`.
- Never inline an SVG directly in a component. Add it to `icons.tsx` so stroke weight
  stays consistent.

Applied in: `site-header.tsx` (account control, account menu, bag with badge, mobile menu
toggle), `account-nav.tsx` (tab icons), `account/page.tsx` (stat cards, row arrows),
`account/orders/[orderNumber]/page.tsx` (timeline checkmarks, delivery/payment headers),
`cart-view.tsx` (empty state).

### 5.6 Profile photo (avatar)

Customers can upload a photo that replaces their initials everywhere.

| File | Purpose |
| --- | --- |
| `src/components/account/avatar.tsx` | Shared avatar. Renders the photo, falls back to an initials monogram — and also falls back if the image **fails to load** (client component purely so it can watch `onError`; a deleted upload must not leave a broken frame in the header). |
| `src/components/account/avatar-form.tsx` | One form, one real `<input type="file">` so the browser owns the multipart body. Object-URL preview on pick (revoked on every change so the blob does not leak), then Save / Discard, plus a separate remove form. |
| `src/app/account/actions.ts` | `customerUpdateAvatar`, `customerRemoveAvatar` |
| `src/app/account/page.tsx` | `ProfilePhotoCard` — **first block on the overview**, so a new account sees the upload immediately instead of hunting for it |
| `src/components/account/profile-photo-card.tsx` | Two-state wrapper: dashed invitation when there is no photo, solid card when there is. Wraps `AvatarForm`, never duplicates it |
| `src/app/account/details/page.tsx` | "Profile photo" card (`id="photo"`, anchorable), above "Personal details" |
| `prisma/schema.prisma` | `Customer.avatarUrl String?` — null means use initials |

**Security decisions — keep these:**

- Avatars are **sniffed by magic bytes**, not trusted from the browser's
  Content-Type. JPEG / PNG / WebP / AVIF signatures only. A renamed `.html` or
  `.svg` is refused, which stops a script being stored under `/uploads` and served
  from the site's own origin.
- 4 MB ceiling, tighter than the 6 MB product limit — avatars are small.
- `avatarUrl` is only ever written from `storeImage()`, so it is always a local
  `/uploads/...` path, which `next/image` accepts without a host allow-list change.
- No image processing or resizing yet — the original bytes are stored as-is.

**Known limitation:** replacing a photo orphans the previous file in
`public/uploads`. Nothing prunes it. A cleanup job or delete-on-replace is not
written; see 6.10.

**Where the user actually finds it:** the upload form is inline on `/account`
(above the stats) *and* on `/account/details#photo`. Two entry points, one shared
`AvatarForm` — do not fork the markup. Once a photo is saved, the overview card
flips to a solid state showing the picture plus a "Replace photo" button.

**Gotcha — `.env` values are quoted.** `SESSION_SECRET` is unset in this project, so
`lib/customer-auth.ts` falls back to `ADMIN_PASSWORD`. Any script that mints a session
cookie for testing must strip the surrounding quotes from `.env`, exactly as `dotenv`
does, or every HMAC signature mismatches and the account redirects to sign-in.

### 5.7 Design system additions

Added to `src/app/globals.css`:

- `.status-pill` — with `[data-status]` variants. Monochrome, so status is encoded by
  fill level and outline weight, not hue: PENDING dashed, PAID solid, SHIPPED solid
  outline + dot, DELIVERED solid + check, CANCELLED/REFUNDED muted and struck through.
- `.stat-tile` — account dashboard metric tile.
- `.dialog-panel` / `.dialog-backdrop` — dialog entrance animations.

---

## 6. Outstanding work

Ordered by value. 6.1 and 6.2 are quick.

### 6.1 Upload size limits — quick win, do this first

`src/app/api/upload/route.ts` caps **images at 6 MB** and **video at 40 MB**. A real
product photo exceeded the limit and returned 413.

Suggested: raise images to 12 MB, video to 80 MB. Then check the admin UI surfaces the
real limit so users are not surprised.

### 6.2 Duplicate `assertAdmin()` call

`src/app/admin/actions.ts` calls `assertAdmin()` twice in one handler. Harmless but
sloppy — collapse to a single call.

### 6.3 Confirmation dialogs for other destructive admin actions

`ConfirmDialog` exists and is ready; these still act immediately:

- Deleting a product (does `ConfirmDialog` support a dialog with its own form submit? Not
  yet — see 6.4).
- Cancelling or refunding an order via `updateOrderStatus`.
- `SiteSettings` changes that destroy content.

### 6.4 `ConfirmDialog` needs a confirm-form variant

The current dialog calls an `action` function. Some admin forms are `<form action={...}>`
with hidden inputs (e.g. product delete passes an `id`), which cannot be expressed as
`() => Promise<void>`. Add an optional `confirmForm?: React.ReactNode` prop rendered
inside the dialog so form-based destructive actions can also confirm.

### 6.5 Customer password reset — blocked on your decision

Not implemented. Needs an email provider — Resend, Postmark, or Gmail SMTP — plus a
sending domain and API key. Requires from you:

1. Which provider.
2. The API key / SMTP credentials.
3. The sending domain (or whether to use a Gmail address).

Then: a working "Forgot password?" on `/account/sign-in` (a placeholder exists with
`title="Coming soon"`), a request action that emails a single-use signed token, and an
`/account/reset-password` page. The `Customer` model has no reset-token column yet, so
`prisma/schema.prisma` needs one and `prisma db push` must be re-run.

### 6.6 No customer admin UI

Customer accounts exist and can sign in, but there is no admin screen listing customers
or viewing a customer's order history by name. Also no way to delete a customer account.

### 6.7 Brand colour contrast — spot-fixed, not audited

`src/lib/brand.ts` was introduced to fix specific invisible-text bugs. It has not been
applied everywhere admin-editable colours can render text. Worth an audit of
`site-header.tsx`, `site-footer.tsx` and the announcement bar if the admin changes
`colorVolt` away from black.

### 6.8 Not yet tested in a real browser

The account redesign, the auth split layout, the confirm dialog, the icon set and the
avatar upload all compile and pass all checks, but have **not been visually reviewed**.
Rendering *is* verified by HTTP assertions (photo card, file input, unique input id,
label association, forged-cookie rejection); appearance is not. See section 8.

### 6.9 Old avatar uploads are never deleted

Replacing a profile photo writes a new file to `public/uploads` and leaves the previous
one orphaned. Same issue applies to product images. Options: delete the old file inside
`customerUpdateAvatar` (needs a `deleteStoredAsset` helper in `lib/image-store.ts`), or
add a periodic sweep. Not written.

### 6.10 Avatars are not resized

Original bytes are stored at full resolution. A 4 MB phone photo becomes a 4 MB file
served into a 28px header chip. A `sharp` dependency and an `/_next/image`-style resize
step at upload time would fix both this and 6.9.

---

## 7. Verified working

- `npm run lint` — clean.
- `npx tsc --noEmit` — clean.
- `npm run build` — succeeds. All 6 account routes present and dynamic.
- `/account` returns 307 to sign-in when signed out.
- `/account/sign-in`, `/account/sign-up`, `/account`, `/account/details`,
  `/account/orders`, `/admin/login` all return 200 (or 307 where a guard applies).
- Auth primitives tested directly against SQLite, all passed: bcrypt cost 12, correct
  password verifies, wrong password rejected, duplicate email rejected, forged cookie
  signature rejected, own order visible, another customer's order hidden.

---

## 8. Recommended next session

1. Open http://localhost:3000 in a browser and review the redesigned account area with the
   demo login — this is the one thing that cannot be verified from the terminal.
2. Fix 6.1 (upload limits) and 6.2 (duplicate `assertAdmin`).
3. Decide on the email provider for password reset (6.5).
4. Then 6.3 / 6.4 to roll the confirm dialog out to other destructive actions.

---

## 9. File map

```
D:\RAV3S
├─ AGENTS.md                     ← read first, project-specific Next.js rules
├─ HANDOFF.md                    ← this file
├─ proxy.ts                      ← guards /admin and /account
├─ seed-demo-account.mjs         ← demo customer + 4 orders, safe to re-run
├─ prisma
│  ├─ schema.prisma              ← Customer, Order (has customerId), SiteSettings
│  └─ dev.db                     ← the whole database, one file
├─ public/uploads                ← admin-uploaded photos and video
└─ src
   ├─ lib
   │  ├─ auth.ts                 ← ADMIN session (rav3s_admin)
   │  ├─ customer-auth.ts        ← customer session, server-only
   │  ├─ customer-auth-constants.ts
   │  ├─ brand.ts                ← contrast helpers
   │  ├─ money.ts                ← formatMoney / currencySymbol / parseList
   │  ├─ settings.ts  prisma.ts  payments.ts  stripe.ts
   ├─ app
   │  ├─ layout.tsx              ← settings + customer → header
   │  ├─ globals.css             ← media-*, status-pill, stat-tile, dialog
   │  ├─ page.tsx                ← homepage
   │  ├─ account/                ← customer area (redesigned)
   │  ├─ admin/
   │  │  ├─ actions.ts           ← duplicate assertAdmin (6.2)
   │  │  └─ (dashboard)/layout.tsx ← admin shell + sign-out dialog
   │  ├─ api/
   │  │  ├─ checkout/route.ts    ← attaches customerId
   │  │  └─ upload/route.ts      ← 6 MB / 40 MB caps (6.1)
   │  ├─ cart/page.tsx
   │  └─ product/[slug]/page.tsx
   └─ components
      ├─ icons.tsx               ← the shared SVG icon set
      ├─ site-header.tsx         ← account menu, readable brand colours, icons
      ├─ cart-view.tsx           ← prefill from account, icon empty state
      ├─ product-card.tsx
      ├─ account/                ← auth-form, account-nav, account-name-form
      └─ admin/confirm-button.tsx ← generic confirm dialog
```

---

## 10. Design conventions to preserve

- Monochrome interface, black and white only, via the tokens in `globals.css`. Product
  photography is the deliberate exception.
- Status is encoded by fill level and outline weight, never by hue.
- Labels are uppercase, wide-tracked, small — the `.label-xs` utility.
- Headings use `font-display` (Arial Black) with tight tracking.
- Buttons: `btn-primary`, `btn-invert` (on dark), `btn-inverse-outline`, `btn-ghost`.
  All pill-shaped, uppercase.
- Inputs use `.field`. Error text is always `text-xs text-fg` on a normal background,
  `text-inverse-fg` only on `bg-inverse`.
- Cards: `rounded-[var(--radius-card)] border border-line bg-surface`.
- Money always goes through `formatMoney(cents, settings.currency)`.
- Never interpolate a Tailwind class name.
- Icons come from `components/icons.tsx`, never inlined. 24×24, `currentColor`,
  stroke-width 1.6, no fill.
- Destructive actions always confirm first.