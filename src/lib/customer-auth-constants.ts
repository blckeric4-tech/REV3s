/**
 * Values needed by both the server-only customer session code and the client
 * sign-in / sign-up form. Kept in their own module because `customer-auth.ts`
 * imports `server-only` and therefore cannot be pulled into a client bundle.
 */

export const CUSTOMER_COOKIE = "rav3s_customer";

/** Minimum password length for a shopper account. */
export const CUSTOMER_PASSWORD_MIN = 8;
