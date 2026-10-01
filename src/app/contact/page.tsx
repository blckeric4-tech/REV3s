import { getSettings } from "@/lib/settings";
import { GoogleMap } from "@/components/google-map";
import { whatsappLink, phoneHref } from "@/lib/contact";

export const metadata = { title: "Contact" };

export default async function ContactPage() {
  const s = await getSettings();

  return (
    <div className="container-rav3s py-16 md:py-24">
      <p className="label-xs text-fg/65">Get in touch</p>
      <h1 className="mt-4 text-4xl font-black uppercase md:text-5xl">Contact</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-fg/65">
        Questions about sizing, an order or a return? Message us on WhatsApp, call the
        workshop, or send an email — a real person replies within one working day.
      </p>

      {/* Quick actions */}
      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {s.whatsappOn && s.whatsappNumber ? (
          <a
            href={whatsappLink(s.whatsappNumber, s.whatsappMessage)}
            target="_blank"
            rel="noopener noreferrer"
            className="card flex flex-col justify-between p-6 transition-colors hover:bg-surface-2"
          >
            <p className="label-xs text-fg/65">Fastest</p>
            <p className="mt-3 text-xl font-black uppercase">WhatsApp</p>
            <p className="mt-2 text-sm text-fg/70">{s.whatsappNumber}</p>
          </a>
        ) : null}

        {s.phoneNumber ? (
          <a
            href={phoneHref(s.phoneNumber)}
            className="card flex flex-col justify-between p-6 transition-colors hover:bg-surface-2"
          >
            <p className="label-xs text-fg/65">Workshop</p>
            <p className="mt-3 text-xl font-black uppercase">Call us</p>
            <p className="mt-2 text-sm text-fg/70">{s.phoneNumber}</p>
          </a>
        ) : null}

        <a
          href={`mailto:${s.footerEmail}`}
          className="card flex flex-col justify-between p-6 transition-colors hover:bg-surface-2"
        >
          <p className="label-xs text-fg/65">Email</p>
          <p className="mt-3 text-xl font-black uppercase">Write to us</p>
          <p className="mt-2 break-all text-sm text-fg/70">{s.footerEmail}</p>
        </a>
      </div>

      {/* Map */}
      {s.mapAddress || s.mapEmbedUrl ? (
        <section className="mt-16">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="label-xs text-fg/65">Where we are</p>
              <h2 className="mt-3 text-2xl font-black uppercase md:text-3xl">Find the workshop</h2>
            </div>
            {s.mapAddress ? (
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(s.mapAddress)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Open in Maps
              </a>
            ) : null}
          </div>

          {s.mapAddress ? (
            <p className="mt-4 text-sm text-fg/70">{s.mapAddress}</p>
          ) : null}

          <GoogleMap
            className="mt-6"
            embedUrl={s.mapEmbedUrl}
            address={s.mapAddress}
            title={`${s.siteName} location`}
          />
        </section>
      ) : null}

      {/* Socials + FAQ */}
      <div className="mt-16 grid gap-8 md:grid-cols-2">
        <div className="card p-6">
          <h2 className="label-xs text-fg/65">Follow along</h2>
          <div className="mt-4 flex flex-wrap gap-3">
            {[
              [s.footerInstagram, "Instagram"],
              [s.footerTiktok, "TikTok"],
              [s.facebookUrl, "Facebook"],
            ]
              .filter(([href]) => href)
              .map(([href, label]) => (
                <a
                  key={String(label)}
                  href={String(href)}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="btn btn-outline"
                >
                  {label}
                </a>
              ))}
          </div>

          <h2 className="label-xs mt-10 text-fg/65">Delivery</h2>
          <p className="mt-3 text-sm text-fg/70">{s.footerAddress}</p>
        </div>

        <div className="card p-6">
          <h2 className="label-xs text-fg/65">Common questions</h2>
          <dl className="mt-4 space-y-5 text-sm">
            <div>
              <dt className="font-semibold">How do your sizes run?</dt>
              <dd className="mt-1 text-fg/65">
                True to size with a relaxed cut. If you are between sizes and want it fitted,
                size down.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">When will my order ship?</dt>
              <dd className="mt-1 text-fg/65">
                Orders leave the workshop within 2 working days. You get a confirmation the
                moment it does.
              </dd>
            </div>
            <div>
              <dt className="font-semibold">Can I return something?</dt>
              <dd className="mt-1 text-fg/65">
                Yes, within 30 days as long as it is unworn and still has its tags.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
