import type { Metadata } from "next";
import "./globals.css";
import { getSettings } from "@/lib/settings";
import { getCustomer } from "@/lib/customer-auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/components/cart-provider";
import { WhatsAppButton } from "@/components/whatsapp-button";
import { themeInitScript } from "@/components/theme-toggle";

export async function generateMetadata(): Promise<Metadata> {
  const s = await getSettings();
  return {
    title: { default: `${s.siteName} — ${s.tagline}`, template: `%s | ${s.siteName}` },
    description: s.heroBody,
    openGraph: {
      title: `${s.siteName} — ${s.tagline}`,
      description: s.heroBody,
      type: "website",
    },
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSettings();
  // Drives the header's Sign in / account menu. Null when signed out.
  const customer = await getCustomer();

  // Admin colour edits flow through the whole site via these CSS variables.
  // Only `ink` and `bone` are driven by the admin; the semantic tokens in
  // globals.css handle light/dark switching.
  const brandVars = {
    "--color-ink": settings.colorInk,
    "--color-bone": settings.colorBone,
  } as React.CSSProperties;

  return (
    <html lang="en" style={brandVars} data-scroll-behavior="smooth" suppressHydrationWarning>
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
