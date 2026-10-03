import type { Metadata } from "next";
import "./globals.css";
import { getLocalizedSettings } from "@/lib/settings";
import { getCustomer } from "@/lib/customer-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/components/cart-provider";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { themeInitScript } from "@/components/theme-toggle";
import { getLocale, getTranslator } from "@/lib/i18n";
import { LOCALE_TAGS } from "@/lib/i18n/config";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const s = await getLocalizedSettings(locale);
  const titleDefault = `${s.siteName} — ${s.tagline}`;
  return {
    title: { default: titleDefault, template: `%s | ${s.siteName}` },
    description: s.heroBody,
    openGraph: {
      title: titleDefault,
      description: s.heroBody,
      type: "website",
      // Open Graph wants the underscored form, `fr_FR`, not `fr-FR`.
      locale: LOCALE_TAGS[locale].replace("-", "_"),
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [customer, { locale, tag }] = await Promise.all([getCustomer(), getTranslator()]);
  const settings = await getLocalizedSettings(locale);

  // Admin colour edits flow through the whole site via these CSS variables.
  // Only `ink` and `bone` are driven by the admin; the semantic tokens in
  // globals.css handle light/dark switching.
  const brandVars = {
    "--color-ink": settings.colorInk,
    "--color-bone": settings.colorBone,
  } as React.CSSProperties;

  return (
    <html lang={tag} style={brandVars} data-scroll-behavior="smooth" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="flex min-h-screen flex-col">
        <CartProvider>
          <SiteHeader
            settings={settings}
            customer={
              customer
                ? { name: customer.name, email: customer.email, avatarUrl: customer.avatarUrl }
                : null
            }
            locale={locale}
          />
          <main className="flex-1">{children}</main>
          <SiteFooter settings={settings} />
          <WhatsAppButton
            number={settings.whatsappNumber}
            message={settings.whatsappMessage}
            enabled={settings.whatsappOn}
            locale={locale}
          />
        </CartProvider>
      </body>
    </html>
  );
}
