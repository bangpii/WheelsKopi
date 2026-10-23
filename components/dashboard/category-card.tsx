import { categorySlices } from "@/lib/dashboard-data";

export function CategoryCard() {
  const total = categorySlices.reduce((sum, slice) => sum + slice.value, 0);

  const slices: Array<{ slice: (typeof categorySlices)[number]; strokeDasharray: string; strokeDashoffset: number }> = [];
  let cumulative = 0;

  for (const slice of categorySlices) {
    const strokeDasharray = `${(slice.value / total) * 100} ${(1 - slice.value / total) * 100}`;
    const strokeDashoffset = 100 - cumulative;
    slices.push({ slice, strokeDasharray, strokeDashoffset });
    cumulative += slice.value;
  }

  return (
    <section
      data-aos="fade-up"
      data-aos-delay="70"
      className="surface flex flex-col p-5 sm:p-6 lg:col-span-4"
      aria-label="Distribusi kategori penjualan"
    >
      <div>
        <h2 className="font-display text-base font-semibold tracking-tight">Kategori Terlaris</h2>
        <p className="mt-1 text-[13px] text-muted-foreground">Proporsi unit terjual bulan ini</p>
      </div>

      <div className="mt-6 flex flex-col items-center">
        <div className="relative size-44">
          <svg viewBox="0 0 42 42" className="-rotate-90">
            <circle cx="21" cy="21" r="15.91549430918954" fill="transparent" stroke="var(--muted)" strokeWidth="6" />
            {slices.map(({ slice, strokeDasharray, strokeDashoffset }) => (
              <circle
                key={slice.label}
                cx="21"
                cy="21"
                r="15.91549430918954"
                fill="transparent"
                stroke={slice.color}
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={strokeDasharray}
                strokeDashoffset={strokeDashoffset}
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <p className="font-mono text-[10px] tracking-[0.28em] text-muted-foreground uppercase">Total</p>
            <p className="font-display mt-1 text-2xl font-semibold tabular-nums">{total}</p>
            <p className="text-xs text-muted-foreground">Unit</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-2">
        {categorySlices.map((slice) => (
          <div
            key={slice.label}
            className="flex items-center justify-between rounded-xl px-2.5 py-2 transition-colors hover:bg-muted/60"
          >
            <div className="flex items-center gap-2">
              <span className="size-1.5 rounded-full" style={{ background: slice.color }} />
              <span className="text-[13px]">{slice.label}</span>
            </div>
            <span className="font-mono text-xs font-medium tabular-nums text-muted-foreground">
              {slice.percent}%
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
