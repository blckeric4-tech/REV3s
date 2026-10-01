import Link from "next/link";
import type { Settings } from "@/lib/settings";
import { getCategories } from "@/lib/settings";
import { whatsappLink, phoneHref } from "@/lib/contact";

export async function SiteFooter({ settings }: { settings: Settings }) {
  const categories = await getCategories();
  const year = new Date().getFullYear();

  return (
    <footer className="mt-24 bg-inverse text-inverse-fg">
      <div className="container-rav3s py-16">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-4">
            <p className="text-3xl font-black tracking-[-0.06em]">
              {settings.logoText}
              <span className="ml-1 inline-block h-2 w-2 rounded-full bg-inverse-fg align-top" />
            </p>
            <p className="mt-4 max-w-sm text-sm leading-relaxed text-inverse-fg/80">
              {settings.footerAbout}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {settings.whatsappNumber ? (
                <a
                  href={whatsappLink(settings.whatsappNumber, settings.whatsappMessage)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-invert px-5 py-3"
                >
                  WhatsApp
                </a>
              ) : null}
              {settings.phoneNumber ? (
                <a href={phoneHref(settings.phoneNumber)} className="btn btn-inverse-outline px-5 py-3">
                  Call us
                </a>
              ) : null}
            </div>

            <div className="mt-5 flex flex-wrap gap-4">
              {settings.footerInstagram ? (
                <a
                  href={settings.footerInstagram}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="label-xs text-inverse-fg/80 underline underline-offset-4 hover:text-inverse-fg"
                >
                  Instagram
                </a>
              ) : null}
              {settings.footerTiktok ? (
                <a
                  href={settings.footerTiktok}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="label-xs text-inverse-fg/80 underline underline-offset-4 hover:text-inverse-fg"
                >
                  TikTok
                </a>
              ) : null}
              {settings.facebookUrl ? (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="label-xs text-inverse-fg/80 underline underline-offset-4 hover:text-inverse-fg"
                >
                  Facebook
                </a>
              ) : null}
            </div>
          </div>

          <div className="md:col-span-2">
            <p className="label-xs text-inverse-fg/70">Shop</p>
            <ul className="mt-4 space-y-2.5">
              <li>
                <Link href="/shop" className="text-sm text-inverse-fg/85 hover:text-inverse-fg">
                  All products
                </Link>
              </li>
              {categories.slice(0, 5).map((c) => (
                <li key={c}>
                  <Link
                    href={`/shop?category=${encodeURIComponent(c)}`}
                    className="text-sm text-inverse-fg/85 hover:text-inverse-fg"
                  >
                    {c}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-2">
            <p className="label-xs text-inverse-fg/70">Help</p>
            <ul className="mt-4 space-y-2.5">
              {[
                ["/about", "About RAV3S"],
                ["/contact", "Contact"],
                ["/shipping", "Delivery & returns"],
                ["/size-guide", "Size guide"],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="text-sm text-inverse-fg/85 hover:text-inverse-fg">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <p className="label-xs text-inverse-fg/70">Contact</p>
            <ul className="mt-4 space-y-2.5 text-sm text-inverse-fg/85">
              {settings.whatsappNumber ? (
                <li>
                  <a
                    href={whatsappLink(settings.whatsappNumber, settings.whatsappMessage)}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="underline underline-offset-4 hover:text-inverse-fg"
                  >
                    {settings.whatsappNumber}
                  </a>
                </li>
              ) : null}
              {settings.phoneNumber ? (
                <li>
                  <a href={phoneHref(settings.phoneNumber)} className="hover:text-inverse-fg">
                    {settings.phoneNumber}
                  </a>
                </li>
              ) : null}
              {settings.footerEmail ? (
                <li>
                  <a href={`mailto:${settings.footerEmail}`} className="hover:text-inverse-fg">
                    {settings.footerEmail}
                  </a>
                </li>
              ) : null}
              {settings.mapAddress ? (
                <li>
                  <Link href="/contact" className="underline underline-offset-4 hover:text-inverse-fg">
                    {settings.mapAddress}
                  </Link>
                </li>
              ) : null}
            </ul>

            <p className="mt-6 text-xs leading-relaxed text-inverse-fg/70">
              Pay with MTN MoMo, Airtel Money, Tigo Cash or card. Delivery across Kigali.
            </p>
          </div>
        </div>

        <div className="mt-14 flex flex-col gap-3 border-t border-inverse-fg/20 pt-6 text-xs text-inverse-fg/70 md:flex-row md:items-center md:justify-between">
          <p>
            &copy; {year} {settings.siteName}. All rights reserved.
          </p>
          <p className="label-xs">{settings.mapAddress || settings.footerAddress}</p>
        </div>
      </div>
    </footer>
  );
}
