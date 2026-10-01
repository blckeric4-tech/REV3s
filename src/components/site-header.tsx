"use client";

import Link from "next/link";
import { useState } from "react";
import type { Settings } from "@/lib/settings";
import { useCart } from "@/components/cart-provider";
import { ThemeToggle } from "@/components/theme-toggle";
import { readableOn } from "@/lib/brand";
import { customerSignOut } from "@/app/account/actions";
import { Avatar } from "@/components/account/avatar";
import { LanguageSwitcher } from "@/components/language-switcher";
import type { Locale, Translate, TranslationKey } from "@/lib/i18n";
import {
  BagIcon,
  ChevronDownIcon,
  CloseIcon,
  LogOutIcon,
  MenuIcon,
  PackageIcon,
  SettingsIcon,
  UserIcon,
} from "@/components/icons";

/**
 * Nav labels are translation keys, not strings, so the header follows the
 * locale without the caller having to pass text down.
 */
const NAV = [
  { href: "/shop", key: "nav.shop" },
  { href: "/shop?sort=newest", label: "New in", key: "shop.sortNewest" },
  { href: "/about", key: "nav.about" },
  { href: "/contact", key: "nav.contact" },
] as const satisfies readonly { href: string; key: TranslationKey; label?: string }[];

/** First name only, so the header never gets pushed around by a long name. */
function shortName(name: string) {
  return name.trim().split(/\s+/)[0] || name;
}

export function SiteHeader({
  settings,
  customer,
  t,
  locale,
}: {
  settings: Settings;
  /** Present only when the visitor is signed in. */
  customer: { name: string; email: string; avatarUrl: string | null } | null;
  t: Translate;
  locale: Locale;
}) {
  const { count } = useCart();
  const [open, setOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);

  // Ink and Volt both default to black, so a hard-coded pairing here made the
  // logo mark and the bag count render black-on-black and vanish.
  const markFg = readableOn(settings.colorVolt, settings.colorBone, settings.colorInk);
  const markBg = settings.colorVolt || settings.colorInk;

  return (
    <>
      {settings.announcementOn && settings.announcementText ? (
        <div className="relative overflow-hidden bg-inverse text-inverse-fg">
          <div className="flex w-max animate-[var(--animate-marquee)] gap-16 py-2.5">
            {Array.from({ length: 8 }).map((_, i) => (
              <span key={i} className="label-xs whitespace-nowrap text-inverse-fg/90">
                {settings.announcementText}
                <span className="ml-16 text-inverse-fg">&#9679;</span>
              </span>
            ))}
          </div>
        </div>
      ) : null}

      <header className="sticky top-0 z-50 border-b border-line bg-surface/85 backdrop-blur-md">
        <div className="container-rav3s flex h-16 items-center justify-between gap-3 md:h-20 md:gap-4">
          {/* ── Left: desktop nav / mobile menu button ─────────────────── */}
          <div className="flex flex-1 items-center">
            <nav className="hidden items-center gap-8 md:flex">
              {NAV.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="label-xs text-fg/70 transition-colors hover:text-fg"
                >
                  {"label" in item ? item.label : t(item.key)}
                </Link>
              ))}
            </nav>

            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-expanded={open}
              aria-controls="mobile-menu"
              aria-label={open ? t("nav.closeMenu") : t("nav.openMenu")}
              className="-ml-2 flex h-10 w-10 items-center justify-center transition-colors hover:text-fg md:hidden"
            >
              {open ? <CloseIcon className="h-5 w-5" /> : <MenuIcon className="h-5 w-5" />}
            </button>
          </div>

          {/* ── Centre: wordmark ──────────────────────────────────────── */}
          <Link
            href="/"
            className="group shrink-0 text-2xl font-black tracking-[-0.06em] md:text-3xl"
          >
            <span style={{ color: settings.colorInk }}>{settings.logoText}</span>
            {settings.logoMark ? (
              <span
                className="ml-1 inline-flex h-2.5 min-w-2.5 items-center justify-center rounded-full px-0.5 align-top text-[9px] font-black leading-none transition-transform group-hover:scale-125"
                style={{ backgroundColor: markBg, color: markFg }}
              >
                {settings.logoMark}
              </span>
            ) : null}
          </Link>

          {/* ── Right: account, theme, bag ────────────────────────────── */}
          <div className="flex flex-1 items-center justify-end gap-1 sm:gap-2">
            {customer ? (
              /* ── Signed in ── */
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setAccountOpen((v) => !v)}
                  aria-expanded={accountOpen}
                  aria-haspopup="menu"
                  aria-label={`${t("nav.account")} — ${customer.name}`}
                  className="flex items-center gap-2 rounded-full border border-transparent py-2 pl-2 pr-2.5 transition-colors hover:border-line sm:pr-3"
                >
                  <Avatar
                    name={customer.name}
                    src={customer.avatarUrl}
                    size={28}
                    className="sm:!h-6 sm:!w-6"
                    priority
                  />
                  <span className="label-xs hidden sm:inline">{shortName(customer.name)}</span>
                  <ChevronDownIcon
                    className={`hidden h-3.5 w-3.5 shrink-0 text-haze transition-transform sm:block ${
                      accountOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {accountOpen ? (
                  <>
                    <button
                      type="button"
                      aria-label="Close account menu"
                      onClick={() => setAccountOpen(false)}
                      className="fixed inset-0 z-10 cursor-default"
                    />
                    <div
                      role="menu"
                      className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-[var(--radius-card)] border border-line bg-surface shadow-xl"
                    >
                      <div className="border-b border-line px-4 py-3">
                        <p className="truncate text-sm font-semibold">{customer.name}</p>
                        <p className="mt-0.5 truncate text-xs text-fg/65">{customer.email}</p>
                      </div>

                      <div className="p-1.5">
                        <Link
                          href="/account"
                          onClick={() => setAccountOpen(false)}
                          role="menuitem"
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-2"
                        >
                          <UserIcon className="h-4 w-4 shrink-0 text-haze" />
                          {t("nav.account")}
                        </Link>
                        <Link
                          href="/account/orders"
                          onClick={() => setAccountOpen(false)}
                          role="menuitem"
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-2"
                        >
                          <PackageIcon className="h-4 w-4 shrink-0 text-haze" />
                          {t("nav.orders")}
                        </Link>
                        <Link
                          href="/account/details"
                          onClick={() => setAccountOpen(false)}
                          role="menuitem"
                          className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors hover:bg-surface-2"
                        >
                          <SettingsIcon className="h-4 w-4 shrink-0 text-haze" />
                          {t("nav.details")}
                        </Link>
                      </div>

                      <form action={customerSignOut} className="border-t border-line p-1.5">
                        <button
                          type="submit"
                          role="menuitem"
                          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm transition-colors hover:bg-surface-2"
                        >
                          <LogOutIcon className="h-4 w-4 shrink-0 text-haze" />
                          {t("nav.signOut")}
                        </button>
                      </form>
                    </div>
                  </>
                ) : null}
              </div>
            ) : (
              /* ── Signed out ── */
              <Link
                href="/account/sign-in"
                aria-label={t("nav.signIn")}
                className="flex items-center gap-2 rounded-full px-3 py-2 text-fg/70 transition-colors hover:text-fg"
              >
                <UserIcon className="h-5 w-5" />
                <span className="label-xs hidden sm:inline">{t("nav.signIn")}</span>
              </Link>
            )}

            <ThemeToggle />

            <LanguageSwitcher current={locale} />

            {/* Bag: icon carries the meaning, the number is a badge on it. */}
            <Link
              href="/cart"
              aria-label={
                count === 0
                  ? t("nav.cartEmpty")
                  : count === 1
                    ? t("nav.cartOneItem")
                    : t("nav.cartItems", { count })
              }
              className="group relative flex h-10 w-10 items-center justify-center rounded-full border border-transparent transition-colors hover:border-line md:h-11 md:w-11"
            >
              <BagIcon className="h-5 w-5 transition-transform group-hover:scale-105" />

              {/* Only badge when non-empty — an "0" chip adds noise. */}
              {count > 0 ? (
                <span
                  aria-hidden
                  className="absolute -right-0.5 -top-0.5 flex h-[1.15rem] min-w-[1.15rem] items-center justify-center rounded-full px-1 text-[10px] font-bold tabular-nums ring-2 ring-surface"
                  style={{ backgroundColor: markBg, color: markFg }}
                >
                  {count > 99 ? "99+" : count}
                </span>
              ) : null}
            </Link>
          </div>
        </div>

        {open ? (
          <nav id="mobile-menu" className="border-t border-line bg-surface md:hidden">
            {NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setOpen(false)}
                className="label-xs block border-b border-line px-5 py-4"
              >
                {"label" in item ? item.label : t(item.key)}
              </Link>
            ))}
            <Link
              href={customer ? "/account" : "/account/sign-in"}
              onClick={() => setOpen(false)}
              className="label-xs flex items-center gap-2.5 border-b border-line px-5 py-4"
            >
              <UserIcon className="h-4 w-4" />
              {customer ? t("nav.account") : t("nav.signIn")}
            </Link>
          </nav>
        ) : null}
      </header>
    </>
  );
}