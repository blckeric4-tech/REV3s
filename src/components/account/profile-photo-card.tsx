import Link from "next/link";
import { AvatarForm } from "@/components/account/avatar-form";

/**
 * Profile photo card for the account overview.
 *
 * The upload form is always present inline rather than hidden behind a link, so
 * a brand-new account can add a photo the moment they land here instead of
 * hunting for it. Two visual states only:
 *
 *  - No photo yet: dashed, high-contrast invitation. The avatar shows their
 *    initials at reduced opacity so the gap is obvious.
 *  - Photo set: solid card, the picture shown at full strength.
 */
export function ProfilePhotoCard({
  name,
  avatarUrl,
}: {
  name: string;
  avatarUrl: string | null;
}) {
  const empty = !avatarUrl;

  return (
    <section
      aria-labelledby="profile-photo-heading"
      className={
        empty
          ? "rounded-[var(--radius-card)] border-2 border-dashed border-line"
          : "rounded-[var(--radius-card)] border border-line bg-surface"
      }
    >
      <div className="px-6 pt-6 pb-2">
        <h2 id="profile-photo-heading" className="font-display text-lg uppercase">
          {empty ? "Add a profile photo" : "Your photo"}
        </h2>
        <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg/70">
          {empty
            ? "You are showing as initials right now. Add a photo and your name appears with your face across the site."
            : "This is how you appear in the header and across your account. Swap it whenever you like."}
        </p>
      </div>

      <div className="px-6 pb-6 pt-4">
        <AvatarForm name={name} currentAvatar={avatarUrl} muted={empty} />
      </div>

      {empty ? (
        <p className="border-t border-line bg-surface-2 px-6 py-3 text-xs text-fg/65">
          Prefer to do this later?{" "}
          <Link
            href="/account/orders"
            className="text-fg underline underline-offset-4 hover:text-fg"
          >
            Skip to your orders
          </Link>
        </p>
      ) : null}
    </section>
  );
}