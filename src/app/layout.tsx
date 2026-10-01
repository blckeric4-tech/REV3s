import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { getCustomer } from "@/lib/customer-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/components/cart-provider";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { themeInitScript } from "@/components/theme-toggle";
import { getLocale, getTranslator } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const [s, locale] = await Promise.all([getSettings(), getLocale()]);
  const titleDefault = `${s.siteName} — ${s.tagline}`;
  return {
    title: { default: titleDefault, template: `%s | ${s.siteName}` },
    description: s.heroBody,
    openGraph: {
      title: titleDefault,
      description: s.heroBody,
      type: "website",
      locale,
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [settings, customer, { locale, t }] = await Promise.all([
    getSettings(),
    getCustomer(),
    getTranslator(),
  ]);

  // Admin colour edits flow through the whole site via these CSS variables.
  // Only `ink` and `bone` are driven by the admin; the semantic tokens in
  // globals.css handle light/dark switching.
  const brandVars = {
    "--color-ink": settings.colorInk,
    "--color-bone": settings.colorBone,
  } as React.CSSProperties;

  return (
    <html lang={locale} style={brandVars} data-scroll-behavior="smooth" suppressHydrationWarning>
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
            t={t}
            locale={locale}
          />
          <main className="flex-1">{children}</main>
          <SiteFooter settings={settings} />
          <WhatsAppButton
            number={settings.whatsappNumber}
            message={settings.whatsappMessage}
            enabled={settings.whatsappOn}
          />
        </CartProvider>
      </body>
    </html>
  );
}
