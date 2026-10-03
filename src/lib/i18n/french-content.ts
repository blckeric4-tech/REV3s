/**
 * French copy for the products that ship with the template.
 *
 * This is the shop's *seed* catalogue, not live inventory — these ten products
 * are created by `prisma/seed.ts` with English copy. Real products typed into
 * the admin are translated on their own product page instead.
 *
 * Kept as data keyed by `slug` so two callers can share it without either one
 * owning the strings:
 *   - `prisma/seed.ts`        creates the rows with French already filled in
 *   - `scripts/backfill-french.ts` fills the French columns of an existing row
 *
 * Colour and badge maps are keyed by the English text, because a variant's
 * colour and a product's badge are free-text labels rather than ids.
 *
 * `Volt` is deliberately left untranslated: it is the brand's name for its
 * accent colour, not a description of one.
 */

/** Product copy, keyed by product slug. */
export const FRENCH_PRODUCTS: Record<
  string,
  { name: string; tagline: string; description: string; badge: string }
> = {
  "boxy-pocket-tee": {
    name: "T-shirt Boxy Poche",
    tagline: "Coupe ample, poche renforcée",
    description:
      "Plus large sur le corps, avec une époule tombante et une poche de poitrine barbelée aux deux angles. Le même coton 240 g/m² que le Core, coupé plus court et plus large pour celles et ceux qui aiment que leur t-shirt ait l’air emprunté.",
    badge: "",
  },
  "cable-knit-jumper": {
    name: "Pull Tricot Cable",
    tagline: "Remontage main, jauge 5",
    description:
      "La pièce la plus lourde que nous fabriquons. Un cable cinq jauges aux coutures remontées à la main et à la bordure côtelée profonde, filé en laine d’agneau pour un toucher qui s’adoucit à chaque port.",
    badge: "Édition limitée",
  },
  "core-heavyweight-tee": {
    name: "T-shirt Lourd Essentiel",
    tagline: "Coton loopback 240 g/m²",
    description:
      "Le t-shirt sur lequel nous construisons tout le reste. Coton loopback 240 g/m², col côtelé qui garde sa forme après cinquante lavages, et une coupe boxy qui tombe juste sous l’épaule. Pré-rétréci et teint en pièce, pour qu’il se délave comme vous le souhaitez.",
    badge: "Meilleure vente",
  },
  "heavy-fleece-hoodie": {
    name: "Sweat à Capuche Molletonné",
    tagline: "Molleton gratté 480 g/m²",
    description:
      "Molleton gratté 480 g/m² avec une capuche double épaisseur, des poignets côtelés épais et une poche kangourou placée à l’angle qui permet vraiment d’atteindre. Celui que nous portons le plus.",
    badge: "Meilleure vente",
  },
  "merino-crew-jumper": {
    name: "Pull Col Rond Mérinos",
    tagline: "Mérinos extra-fin, maille fully fashioned",
    description:
      "Tricoté en laine mérinos extra-fine selon une construction fully fashioned, ce qui veut dire que les panneaux sont formés plutôt que découpés dans un jersey plat. Chaud sans lourdeur, et il se comprime pour ne rien occuper.",
    badge: "",
  },
  "oversized-zip-hoodie": {
    name: "Sweat Zip Oversize à Capuche",
    tagline: "Épaule tombante, zip métal",
    description:
      "Volontairement oversize, avec une épaule tombante et un zip métal YKK renforcé. Coupe longue sur la manche pour que les poignets tombent exactement où vous le souhaitez.",
    badge: "Nouveau",
  },
  "rav3s-long-sleeve": {
    name: "RAV3S Manche Longue",
    tagline: "Jersey lourd, poignets côtelés",
    description:
      "Manche longue en jersey lourd, avec un col, des poignets et une bordure côtelés qui restent vraiment en place. Coupe longue sur le corps pour se superposer proprement sous une veste sans remonter.",
    badge: "Nouveau",
  },
  "ribbed-beanie": {
    name: "Bonnet Côtelé",
    tagline: "Côte mérinos, bord replié",
    description:
      "Grosse côte mérinos avec un bord replié qui reste relevé. Tricotée en jauge fine pour se glisser dans une poche et en ressortir sans laisser de marque.",
    badge: "",
  },
  "ribbed-crewneck": {
    name: "Pull Col Rond Côtelé",
    tagline: "Mélange mérinos, côte 2x2",
    description:
      "Une côte fine 2x2 en mélange mérinos qui se superpose sous un manteau sans ajouter de volume. Col rond net, manches montée, et une bordure qui reste en place même portée non rentrée.",
    badge: "",
  },
  "waxed-work-jacket": {
    name: "Veste de Travail Enduite",
    tagline: "Coton enduit, quatre poches",
    description:
      "Toile de coton enduite qui raidit par temps froid et se détend à l’usage. Quatre poches à soufflet, un col en velours côtelé et des ferrures en laiton qui dureront plus longtemps que la veste.",
    badge: "Édition limitée",
  },
};

/** Colour names, keyed by the English colour stored on `Variant.color`. */
export const FRENCH_COLOURS: Record<string, string> = {
  Bone: "Os",
  Clay: "Argile",
  "Deep Navy": "Bleu Marine",
  "Haze Grey": "Gris Brume",
  "Ink Black": "Noir Encre",
  Volt: "Volt",
};

/** Badge labels, keyed by the English badge stored on `Product.badge`. */
export const FRENCH_BADGES: Record<string, string> = {
  "Best seller": "Meilleure vente",
  Limited: "Édition limitée",
  New: "Nouveau",
};