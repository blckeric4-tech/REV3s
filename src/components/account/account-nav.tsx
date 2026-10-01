"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { customerSignOut } from "@/app/account/actions";
import { LogOutIcon, PackageIcon, SettingsIcon, UserIcon } from "@/components/icons";

const TABS = [
  {
    href: "/account",
    label: "Overview",
    Icon: UserIcon,
    // Also active while viewing a single order.
    match: (p: string) => p === "/account",
  },
  { href: "/account/orders", label: "Orders", Icon: PackageIcon, match: (p: string) => p.startsWith("/account/orders") },
  {
    href: "/account/details",
    label: "Details",
    Icon: SettingsIcon,
    match: (p: string) => p.startsWith("/account/details"),
  },
];

export function AccountNav({ active }: { active: "overview" | "orders" | "details" }) {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Account sections"
      className="-mx-5 mb-8 flex items-center justify-between gap-4 border-b border-line px-5 md:-mx-10 md:px-10"
    >
      {/* Horizontal tab rail that scrolls rather than wrapping on small screens. */}
      <div className="no-scrollbar -mb-px flex gap-1 overflow-x-auto">
        {TABS.map(({ href, label, Icon, match }) => {
          const isActive = match(pathname) || href === `/account/${active}`;
          return (
            <Link
              key={href}
              href={href}
              aria-current={isActive ? "page" : undefined}
              className={`label-xs flex shrink-0 items-center gap-2 border-b-2 px-4 py-3.5 transition-colors ${
                isActive ? "border-fg text-fg" : "border-transparent text-fg/60 hover:text-fg"
              }`}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </div>

      <form action={customerSignOut} className="hidden shrink-0 sm:block">
        <button
          type="submit"
          className="label-xs flex items-center gap-2 py-3.5 text-fg/60 transition-colors hover:text-fg"
        >
          <LogOutIcon className="h-4 w-4 shrink-0" />
          Sign out
        </button>
      </form>
    </nav>
  );
}