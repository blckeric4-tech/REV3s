import { getSettings } from "@/lib/settings";
import { formatMoney } from "@/lib/money";

export const metadata = { title: "Shipping & returns" };

export default async function ShippingPage() {
  const s = await getSettings();

  return (
    <div className="container-rav3s py-16 md:py-24">
      <p className="label-xs text-fg/65">Policies</p>
      <h1 className="mt-4 text-4xl font-black uppercase md:text-5xl">
        Shipping &amp; returns
      </h1>

      <div className="mt-12 grid gap-10 md:grid-cols-2">
        <section>
          <h2 className="text-xl font-black uppercase">Shipping</h2>
          <ul className="mt-4 space-y-3 text-sm text-fg/70">
            <li>
              Flat rate:{" "}
              <strong>
                {s.shippingFlatCents === 0
                  ? "Free"
                  : formatMoney(s.shippingFlatCents, s.currency)}
              </strong>
            </li>
            <li>
              Free shipping on orders over{" "}
              <strong>
                {formatMoney(s.freeShippingOverCents, s.currency)}
              </strong>
            </li>
            <li>Orders leave the workshop within 2 working days.</li>
            <li>Tracked delivery, 3–6 working days once dispatched.</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-black uppercase">Returns</h2>
          <ul className="mt-4 space-y-3 text-sm text-fg/70">
            <li>30 days from delivery on unworn items with tags attached.</li>
            <li>Email us first so we can send you a return label.</li>
            <li>Refunds land back on your original payment method within 5 working days.</li>
            <li>Sale items and pierced goods are not returnable.</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
