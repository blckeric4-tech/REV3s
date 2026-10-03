import type { Metadata } from "next";
import { CartView } from "@/components/cart-view";
import { getSettings } from "@/lib/settings";
import { getCustomer } from "@/lib/customer-auth";
import { availableMethods } from "@/lib/payments";
import { getTranslator } from "@/lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  const { t } = await getTranslator();
  return { title: t("cart.meta") };
}
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const [settings, { t, locale }] = await Promise.all([getSettings(), getTranslator()]);
  // Prefills the checkout fields when the shopper has an account.
  const customer = await getCustomer();

  return (
    <div className="container-rav3s py-12 md:py-16">
      <h1 className="text-4xl font-black uppercase md:text-5xl">{t("cart.title")}</h1>
      <CartView
        currency={settings.currency}
        flatShippingCents={settings.shippingFlatCents}
        freeShippingOverCents={settings.freeShippingOverCents}
        methods={availableMethods()}
        customer={customer ? { name: customer.name, email: customer.email } : null}
        locale={locale}
      />
    </div>
  );
}
