import Image from "next/image";
import { getSettings } from "@/lib/settings";

export const metadata = { title: "About" };

export default async function AboutPage() {
  const s = await getSettings();

  return (
    <div>
      <section className="container-rav3s py-16 md:py-24">
        <p className="label-xs text-fg/65">{s.storyKicker}</p>
        <h1 className="mt-4 max-w-3xl text-4xl font-black uppercase leading-[1.02] md:text-6xl">
          {s.storyTitle}
        </h1>
        <p className="mt-8 max-w-2xl text-base leading-relaxed text-fg/70">
          {s.storyBody}
        </p>
      </section>

      <section className="container-rav3s pb-16 md:pb-24">
        <div className="media-mat relative aspect-16/7 overflow-hidden rounded-[var(--radius-card)] border border-line">
          <Image
            src={s.storyImage || "/images/story.svg"}
            alt="Inside the RAV3S workshop"
            fill
            sizes="100vw"
            className="mono-media media-fit"
          />
        </div>
      </section>

      <section className="bg-inverse py-16 text-inverse-fg md:py-24">
        <div className="container-rav3s grid gap-12 md:grid-cols-3">
          <div>
            <h2 className="text-2xl font-black uppercase">The fabric</h2>
            <p className="mt-4 text-sm leading-relaxed text-inverse-fg/85">
              We buy heavyweight cotton and extra-fine merino by the roll, not the metre, so
              we can commit to a run before anyone has ordered a single piece.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase">The runs</h2>
            <p className="mt-4 text-sm leading-relaxed text-inverse-fg/85">
              Small batches mean things sell out. When a piece is gone we restock it, but we
              never inflate a run to look like we have more than we do.
            </p>
          </div>
          <div>
            <h2 className="text-2xl font-black uppercase">The promise</h2>
            <p className="mt-4 text-sm leading-relaxed text-inverse-fg/85">
              30 days to change your mind on anything unworn, free shipping over $120, and a
              real person on the other end of the email.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
