import { Boxes, PackageCheck, TriangleAlert, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { kpis } from "@/lib/dashboard-data";

const ICONS = [Wallet, PackageCheck, Boxes, TriangleAlert];

function toPoints(values: number[]): string {
  const max = Math.max(...values);
  const min = Math.min(...values);
  const range = max - min || 1;

  return values
    .map((value, index) => {
      const x = (index / (values.length - 1)) * 100;
      const y = 30 - ((value - min) / range) * 26;

      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export function KpiGrid() {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {kpis.map((kpi, index) => {
        const Icon = ICONS[index] ?? Wallet;
        const positive = kpi.trend === "up";
        const TrendIcon = positive ? TrendingUp : TrendingDown;

        return (
          <article
            key={kpi.label}
            data-aos="fade-up"
            data-aos-delay={index * 70}
            className="surface group relative overflow-hidden p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]"
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-[13px] font-medium text-muted-foreground">{kpi.label}</p>
              <span className="flex size-9 items-center justify-center rounded-xl bg-primary/10 text-primary transition-transform duration-300 group-hover:scale-105">
                <Icon className="size-[18px]" />
              </span>
            </div>

            <p className="font-display mt-3 text-[28px] leading-none font-semibold tracking-tight tabular-nums">
              {kpi.value}
            </p>

            <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
              <span
                className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-semibold ${
                  positive ? "bg-success-soft text-success" : "bg-danger-soft text-danger"
                }`}
              >
                <TrendIcon className="size-3.5" />
                {kpi.change}
              </span>
              <span className="text-muted-foreground">{kpi.hint}</span>
            </div>

            <svg
              viewBox="0 0 100 32"
              preserveAspectRatio="none"
              aria-hidden="true"
              className="mt-4 h-9 w-full overflow-visible"
            >
              <polyline
                points={toPoints(kpi.spark)}
                fill="none"
                stroke={positive ? "var(--success)" : "var(--danger)"}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                opacity="0.9"
              />
            </svg>
          </article>
        );
      })}
    </div>
  );
}
