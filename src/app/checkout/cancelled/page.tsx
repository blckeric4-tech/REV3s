import Link from "next/link";
import { db } from "@/lib/prisma";

export const metadata = { title: "Checkout cancelled" };

export default async function CancelledPage({
  searchParams,
}: {
  searchParams: Promise<{ order?: string }>;
}) {
  const { order } = await searchParams;

  if (order) {
    await db.order
      .updateMany({ where: { orderNumber: order }, data: { status: "CANCELLED" } })
      .catch(() => undefined);
  }

  return (
    <div className="container-rav3s flex min-h-[70vh] flex-col items-center justify-center py-20 text-center">
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-surface text-3xl">
        ✕
      </div>
      <h1 className="mt-8 text-4xl font-black uppercase md:text-5xl">Checkout cancelled</h1>
      <p className="mx-auto mt-4 max-w-md text-sm text-fg/65">
        No charge was made and your bag is still exactly as you left it.
      </p>
      <div className="mt-10 flex flex-wrap justify-center gap-3">
        <Link href="/cart" className="btn btn-primary">Return to bag</Link>
        <Link href="/shop" className="btn btn-outline">Keep shopping</Link>
      </div>
    </div>
  );
}
