import { NextResponse, type NextRequest } from "next/server";
import { CUSTOMER_COOKIE } from "@/lib/customer-auth-constants";

/**
 * Route protection for the admin and account areas. This is a first line of
 * defence only — every admin page, account page and server action re-checks the
 * session itself, because Server Actions POST to the page route and can
 * otherwise be invoked directly. The proxy never touches the database (it runs
 * on the edge runtime); it only checks that a session cookie is present.
 */

/** Where a shopper is sent when their account session is missing. */
const CUSTOMER_PUBLIC = ["/account/sign-in", "/account/sign-up"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;

  /* ── Admin: staff only, and never satisfied by a customer cookie ── */
  const adminToken = request.cookies.get("rav3s_admin")?.value;

  if (pathname === "/admin/login") {
    if (adminToken) {
      return NextResponse.redirect(new URL("/admin", request.url));
    }
    return NextResponse.next();
  }

  if (pathname.startsWith("/admin") && !adminToken) {
    const url = new URL("/admin/login", request.url);
    if (search) url.search = search;
    return NextResponse.redirect(url);
  }

  /* ── Account: requires a customer cookie, and an admin cookie is not one ── */
  if (pathname.startsWith("/account")) {
    if (CUSTOMER_PUBLIC.includes(pathname)) {
      // Already signed in? Skip the form.
      if (request.cookies.get(CUSTOMER_COOKIE)?.value) {
        return NextResponse.redirect(new URL("/account", request.url));
      }
      return NextResponse.next();
    }

    if (!request.cookies.get(CUSTOMER_COOKIE)?.value) {
      const url = new URL("/account/sign-in", request.url);
      const next = pathname + search;
      if (next && next !== "/account") url.searchParams.set("next", next);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*"],
};
