export const metadata = { title: "Size guide" };

const ROWS: { size: string; chest: string; length: string; shoulder: string }[] = [
  { size: "XS", chest: "84–89 cm", length: "66 cm", shoulder: "42 cm" },
  { size: "S", chest: "90–95 cm", length: "69 cm", shoulder: "44 cm" },
  { size: "M", chest: "96–101 cm", length: "72 cm", shoulder: "46 cm" },
  { size: "L", chest: "102–107 cm", length: "74 cm", shoulder: "48 cm" },
  { size: "XL", chest: "108–115 cm", length: "76 cm", shoulder: "50 cm" },
  { size: "XXL", chest: "116–123 cm", length: "78 cm", shoulder: "52 cm" },
];

export default function SizeGuidePage() {
  return (
    <div className="container-rav3s py-16 md:py-24">
      <p className="label-xs text-fg/65">Measurements</p>
      <h1 className="mt-4 text-4xl font-black uppercase md:text-5xl">Size guide</h1>
      <p className="mt-5 max-w-xl text-sm leading-relaxed text-fg/65">
        Our cuts are relaxed. Measure your favourite tee and compare it to the numbers
        below &mdash; that is far more reliable than going by your usual size.
      </p>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full min-w-[36rem] text-sm">
          <thead>
            <tr className="border-b border-fg text-left">
              <th className="py-3 pr-4">Size</th>
              <th className="py-3 pr-4">Chest</th>
              <th className="py-3 pr-4">Length</th>
              <th className="py-3">Shoulder</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((r) => (
              <tr key={r.size} className="border-b border-line">
                <td className="py-3.5 pr-4 font-semibold">{r.size}</td>
                <td className="py-3.5 pr-4 text-fg/70">{r.chest}</td>
                <td className="py-3.5 pr-4 text-fg/70">{r.length}</td>
                <td className="py-3.5 text-fg/70">{r.shoulder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 text-sm text-fg/70">
        Between two sizes and want a closer fit? Size down. Still unsure? Email us and we will
        measure a finished piece for you.
      </p>
    </div>
  );
}
