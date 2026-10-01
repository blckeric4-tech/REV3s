import Link from "next/link";

export default function NotFound() {
  return (
    <div className="container-rav3s flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
      <p className="label-xs text-fg/65">404</p>
      <h1 className="mt-4 text-4xl font-black uppercase md:text-5xl">Page not found</h1>
      <p className="mt-4 max-w-md text-sm text-fg/70">
        That link has moved, sold out, or never existed. Here is the way back.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link href="/" className="btn btn-primary">Back home</Link>
        <Link href="/shop" className="btn btn-outline">Browse the shop</Link>
      </div>
    </div>
  );
}
