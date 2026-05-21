// KPISection.tsx
import { useEffect, useState } from "react";
import { KPICard } from "./KPICard";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Calculator,
  Package,
  Users,
  Percent,
  BarChart2,
} from "lucide-react";
import { kpisApi } from "../../lib/api";
import type { KPI } from "../../types/index";
import type { DateRange } from "./ReportDashboard";

// Accent colors mapped by KPI type — deterministic, no randomness
const ACCENT_COLORS: Record<string, string> = {
  dollar_sign: "bg-blue-600",
  trending_up: "bg-emerald-500",
  shopping_cart: "bg-amber-500",
  calculator: "bg-violet-500",
  package: "bg-sky-500",
  users: "bg-pink-500",
  percent: "bg-teal-500",
  chart: "bg-orange-500",
};

const ICON_MAP: Record<string, React.ReactNode> = {
  dollar_sign: <DollarSign className="h-4 w-4" />,
  trending_up: <TrendingUp className="h-4 w-4" />,
  shopping_cart: <ShoppingCart className="h-4 w-4" />,
  calculator: <Calculator className="h-4 w-4" />,
  package: <Package className="h-4 w-4" />,
  users: <Users className="h-4 w-4" />,
  percent: <Percent className="h-4 w-4" />,
  chart: <BarChart2 className="h-4 w-4" />,
};

const fmtKES = (n: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(n);

interface Props {
  dateRange: DateRange;
}

const SkeletonKPI = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
    <div className="h-2 bg-gray-200 rounded w-full mb-1" />
    <div className="flex justify-between mb-4">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-8 w-8 bg-gray-200 rounded-xl" />
    </div>
    <div className="h-7 bg-gray-200 rounded w-1/2 mb-2" />
    <div className="h-3 bg-gray-200 rounded w-2/3 mb-3" />
    <div className="h-5 bg-gray-100 rounded-full w-1/3" />
  </div>
);

export function KPISection({ dateRange }: Props) {
  const [kpis, setKpis] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    // Pass dateRange to your API when it supports it:
    // kpisApi.getAll({ from: dateRange.from, to: dateRange.to })
    kpisApi
      .getAll()
      .then((data: KPI[]) => {
        const mapped = data.map((item: KPI) => ({
          title: item.title,
          value: item.currency
            ? fmtKES(item.value)
            : item.value.toLocaleString("en-KE"),
          // subValue: item.previousValue ? `Prev: ${fmtKES(item.previousValue)}` : undefined,
          trend: item.trend,
          trendLabel: item.period,
          accentColor: ACCENT_COLORS[item.icon_key] ?? "bg-gray-400",
          icon: ICON_MAP[item.icon_key] ?? <DollarSign className="h-4 w-4" />,
        }));
        setKpis(mapped);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dateRange]);

  // Inject CSS animation once
  useEffect(() => {
    const styleId = "kpi-fade-slide";
    if (!document.getElementById(styleId)) {
      const style = document.createElement("style");
      style.id = styleId;
      style.textContent = `
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(12px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <section>
      {/* Section label */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-sm font-bold uppercase tracking-widest text-gray-400">
            Key Performance Indicators
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            {dateRange.label} • {dateRange.from} → {dateRange.to}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-6 gap-4">
        {loading
          ? Array.from({ length: 6 }).map((_, i) => <SkeletonKPI key={i} />)
          : kpis.map((kpi, i) => (
              <KPICard key={kpi.title} {...kpi} delay={i * 60} />
            ))}
      </div>
    </section>
  );
}
