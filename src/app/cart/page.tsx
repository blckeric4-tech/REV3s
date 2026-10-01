import { CartView } from "@/components/cart-view";
import { getSettings } from "@/lib/settings";
import { getCustomer } from "@/lib/customer-auth";
import { availableMethods } from "@/lib/payments";

export const metadata = { title: "Your bag" };
export const dynamic = "force-dynamic";

export default async function CartPage() {
  const settings = await getSettings();
  // Prefills the checkout fields when the shopper has an account.
  const customer = await getCustomer();

  return (
    <div className="container-rav3s py-12 md:py-16">
      <h1 className="text-4xl font-black uppercase md:text-5xl">Your bag</h1>
      <CartView
        currency={settings.currency}
        flatShippingCents={settings.shippingFlatCents}
        freeShippingOverCents={settings.freeShippingOverCents}
        methods={availableMethods()}
        customer={customer ? { name: customer.name, email: customer.email } : null}
      />
    </div>
  );
}
