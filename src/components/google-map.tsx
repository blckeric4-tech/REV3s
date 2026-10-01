type Props = {
  /** Either a full embed URL from the admin, or a plain address/place. */
  embedUrl?: string;
  address?: string;
  title?: string;
  className?: string;
};

/**
 * Google Maps embed. If the admin hasn't pasted an embed URL we fall back to
 * the key-free `output=embed` search format built from the address text, so the
 * map always works out of the box.
 */
export function GoogleMap({ embedUrl = "", address = "", title = "Our location", className = "" }: Props) {
  const isIframe = embedUrl.includes("<iframe") || embedUrl.includes("google.com/maps/embed");

  const src = embedUrl && !isIframe
    ? embedUrl
    : embedUrl && isIframe
      ? embedUrl
      : `https://maps.google.com/maps?q=${encodeURIComponent(address)}&z=15&hl=en&output=embed`;

  const mapsQuery = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;

  return (
    <div className={`frame relative ${className}`}>
      <iframe
        title={title}
        src={src}
        className="h-72 w-full grayscale-[0.35] sm:h-80 lg:h-[26rem]"
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {address ? (
        <a
          href={mapsQuery}
          target="_blank"
          rel="noopener noreferrer"
          className="absolute bottom-3 left-3 btn btn-primary h-9 px-4 text-[0.65rem] shadow"
        >
          Get directions
        </a>
      ) : null}
    </div>
  );
}
