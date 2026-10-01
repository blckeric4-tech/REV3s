/**
 * Generates flat vector garment illustrations + hero/story art.
 * Run: npm run images
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const outDir = join(root, "public", "images", "products");
mkdirSync(outDir, { recursive: true });

const INK = "#0A0A0B";
const BONE = "#EFEAE1";
const VOLT = "#D7FF3E";
const CLAY = "#FF5A36";

const frame = (body, bg, accent, i) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 1000" width="800" height="1000">
  <rect width="800" height="1000" fill="${BONE}"/>
  <rect x="40" y="40" width="720" height="920" fill="${bg}" opacity="0.92"/>
  <circle cx="${150 + i * 120}" cy="190" r="92" fill="${accent}" opacity="0.2"/>
  <g stroke="${INK}" stroke-opacity="0.18" stroke-width="2" fill="none" stroke-linecap="square">
    <path d="M40 40h28M40 40v28M760 40h-28M760 40v28M40 960h28M40 960v-28M760 960h-28M760 960v-28"/>
  </g>
  ${body}
  <text x="70" y="906" font-family="ui-monospace, monospace" font-size="26" letter-spacing="6" fill="${INK}" fill-opacity="0.45">RAV3S</text>
</svg>`;

const shapes = {
  tee: (c) => `<path d="M270 250 L200 300 L150 400 L230 445 L262 392 L262 760 L538 760 L538 392 L570 445 L650 400 L600 300 L530 250 L400 320 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M330 262 q70 52 140 0" fill="none" stroke="${INK}" stroke-width="4"/>`,
  longsleeve: (c) => `<path d="M270 250 L195 300 L140 380 L150 620 L250 620 L262 392 L262 760 L538 760 L538 392 L550 620 L650 620 L660 380 L605 300 L530 250 L400 320 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M330 262 q70 52 140 0" fill="none" stroke="${INK}" stroke-width="4"/>`,
  crew: (c) => `<path d="M275 245 L190 300 L135 470 L235 500 L268 400 L268 770 L532 770 L532 400 L565 500 L665 470 L610 300 L525 245 L400 300 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M300 232 q100 78 200 0" fill="none" stroke="${INK}" stroke-width="4"/><g stroke="${INK}" stroke-opacity="0.22" stroke-width="3" fill="none">${Array.from({ length: 7 }, (_, i) => `<path d="M300 ${330 + i * 55} q100 34 200 0"/>`).join("")}</g>`,
  cable: (c) => `<path d="M275 245 L190 300 L135 470 L235 500 L268 400 L268 770 L532 770 L532 400 L565 500 L665 470 L610 300 L525 245 L400 300 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M300 232 q100 78 200 0" fill="none" stroke="${INK}" stroke-width="4"/><g stroke="${INK}" stroke-opacity="0.3" stroke-width="5" fill="none">${Array.from({ length: 4 }, (_, i) => `<path d="M300 ${350 + i * 110} q50 50 100 0 q50 -50 100 0"/>`).join("")}</g>`,
  hoodie: (c) => `<path d="M280 250 L185 305 L120 500 L240 530 L272 415 L272 790 L528 790 L528 415 L560 530 L680 500 L615 305 L520 250 L400 330 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M305 240 q95 90 190 0" fill="none" stroke="${INK}" stroke-width="4"/><path d="M355 340 L400 520 L445 340" fill="none" stroke="${INK}" stroke-width="4"/><rect x="300" y="600" width="200" height="120" rx="16" fill="${INK}" fill-opacity="0.12" stroke="${INK}" stroke-width="3"/>`,
  ziphoodie: (c) => `<path d="M275 250 L180 305 L115 500 L235 530 L268 415 L268 790 L532 790 L532 415 L565 530 L685 500 L620 305 L525 250 L400 330 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M300 240 q100 95 200 0" fill="none" stroke="${INK}" stroke-width="4"/><path d="M400 340 L400 780" stroke="${INK}" stroke-width="5"/><circle cx="400" cy="430" r="7" fill="${INK}"/><circle cx="400" cy="520" r="7" fill="${INK}"/>`,
  jacket: (c) => `<path d="M250 245 L165 300 L110 520 L215 545 L262 430 L262 780 L538 780 L538 430 L585 545 L690 520 L635 300 L550 245 L400 300 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><path d="M400 300 L400 780" stroke="${INK}" stroke-width="5"/><rect x="280" y="620" width="70" height="26" rx="6" fill="${INK}" fill-opacity="0.3"/><rect x="450" y="620" width="70" height="26" rx="6" fill="${INK}" fill-opacity="0.3"/><path d="M300 235 q100 70 200 0" fill="none" stroke="${INK}" stroke-width="4"/>`,
  beanie: (c) => `<path d="M215 700 q25 -340 185 -340 q160 0 185 340 Z" fill="${c}" stroke="${INK}" stroke-width="4" stroke-linejoin="round"/><rect x="195" y="690" width="410" height="86" rx="20" fill="${c}" stroke="${INK}" stroke-width="4"/><g stroke="${INK}" stroke-opacity="0.28" stroke-width="4">${Array.from({ length: 5 }, (_, i) => `<path d="M${250 + i * 75} 372 L${238 + i * 75} 692"/>`).join("")}</g>`,
};

const shots = [
  { bg: "#E7E2D7", accent: VOLT, body: "#CFC8B8" },
  { bg: "#1B1D21", accent: VOLT, body: "#2A2D33" },
  { bg: "#F5F1E8", accent: CLAY, body: "#EFEAE1" },
];

const catalog = [
  ["core-heavyweight-tee", "tee"],
  ["boxy-pocket-tee", "tee"],
  ["rav3s-long-sleeve", "longsleeve"],
  ["merino-crew-jumper", "crew"],
  ["cable-knit-jumper", "cable"],
  ["ribbed-crewneck", "crew"],
  ["heavy-fleece-hoodie", "hoodie"],
  ["oversized-zip-hoodie", "ziphoodie"],
  ["waxed-work-jacket", "jacket"],
  ["ribbed-beanie", "beanie"],
];

for (const [slug, shapeKey] of catalog) {
  const shape = shapes[shapeKey];
  shots.forEach((shot, i) => {
    writeFileSync(
      join(outDir, `${slug}-${i + 1}.svg`),
      frame(shape(shot.body), shot.bg, shot.accent, i + 1),
      "utf8"
    );
  });
}

/* ---------- hero ---------- */
writeFileSync(
  join(root, "public", "images", "hero.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 1400" width="1200" height="1400">
  <defs>
    <linearGradient id="hb" x1="0" y1="0" x2="0.6" y2="1">
      <stop offset="0%" stop-color="#1B1D21"/><stop offset="100%" stop-color="#0A0A0B"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="1400" fill="url(#hb)"/>
  <circle cx="980" cy="240" r="300" fill="${VOLT}" opacity="0.14"/>
  <circle cx="180" cy="1180" r="240" fill="${CLAY}" opacity="0.14"/>
  <g stroke="${BONE}" stroke-opacity="0.12" stroke-width="2">
    ${Array.from({ length: 17 }, (_, i) => `<path d="M0 ${140 * (i + 1)} L1200 ${140 * i}"/>`).join("")}
  </g>
  <g transform="translate(600 760) scale(1.32) translate(-400 -500)">
    ${shapes.tee("#2A2D33")}
  </g>
  <g stroke="${VOLT}" stroke-width="3" fill="none" stroke-linecap="round">
    <path d="M120 240 h60 M150 210 v60"/>
    <path d="M1080 1160 h-60 M1050 1190 v-60"/>
  </g>
  <text x="120" y="1290" font-family="ui-monospace, monospace" font-size="34" letter-spacing="14" fill="${VOLT}">RAV3S / DROP 04</text>
</svg>`,
  "utf8"
);

/* ---------- story ---------- */
writeFileSync(
  join(root, "public", "images", "story.svg"),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" width="1200" height="900">
  <rect width="1200" height="900" fill="${BONE}"/>
  <rect x="60" y="60" width="1080" height="780" fill="none" stroke="${INK}" stroke-opacity="0.14" stroke-width="2"/>
  <g transform="translate(600 430) scale(1.5) translate(-400 -500)" opacity="0.95">
    ${shapes.cable("#D8D2C6")}
  </g>
  <rect x="60" y="60" width="1080" height="120" fill="${VOLT}"/>
  <text x="100" y="140" font-family="ui-monospace, monospace" font-size="40" letter-spacing="10" fill="${INK}">SMALL RUNS / BIG FABRIC</text>
  <g fill="none" stroke="${INK}" stroke-opacity="0.3" stroke-width="3">
    <circle cx="180" cy="700" r="52"/><circle cx="1020" cy="700" r="52"/>
  </g>
  <text x="180" y="712" text-anchor="middle" font-family="ui-monospace, monospace" font-size="30" fill="${INK}" fill-opacity="0.55">01</text>
  <text x="1020" y="712" text-anchor="middle" font-family="ui-monospace, monospace" font-size="30" fill="${INK}" fill-opacity="0.55">02</text>
</svg>`,
  "utf8"
);

console.log(`Generated artwork for ${catalog.length} products + hero + story.`);
