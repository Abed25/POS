// KPICard.tsx
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

interface KPICardProps {
  title: string;
  value: string;
  subValue?: string; // e.g. "vs KES 1.2M last period"
  trend: number;
  trendLabel: string;
  icon: React.ReactNode;
  accentColor: string; // Tailwind bg class e.g. "bg-blue-600"
  delay?: number;
}

export function KPICard({
  title,
  value,
  subValue,
  trend,
  trendLabel,
  icon,
  accentColor,
  delay = 0,
}: KPICardProps) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;

  const trendColor = isPositive
    ? "text-emerald-600 bg-emerald-50"
    : isNegative
      ? "text-red-600 bg-red-50"
      : "text-gray-500 bg-gray-100";

  return (
    <div
      className="relative bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5 overflow-hidden"
      style={{
        animationDelay: `${delay}ms`,
        animation: "fadeSlideUp 0.4s ease-out both",
      }}
    >
      {/* Accent bar */}
      <div className={`absolute top-0 left-0 right-0 h-1 ${accentColor}`} />

      <div className="p-5 pt-6">
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
            {title}
          </p>
          <div
            className={`p-2 rounded-xl ${accentColor} bg-opacity-10`}
            style={{ backgroundColor: undefined }}
          >
            <div className="text-gray-600">{icon}</div>
          </div>
        </div>

        {/* Main Value */}
        <p className="text-2xl font-extrabold text-gray-900 tracking-tight leading-none mb-1">
          {value}
        </p>

        {subValue && (
          <p className="text-xs text-gray-400 mt-1 mb-3">{subValue}</p>
        )}

        {/* Trend Badge */}
        <div className="flex items-center gap-2 mt-3">
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-bold ${trendColor}`}
          >
            {isPositive && <TrendingUp className="h-3 w-3" />}
            {isNegative && <TrendingDown className="h-3 w-3" />}
            {!isPositive && !isNegative && <Minus className="h-3 w-3" />}
            {isPositive ? "+" : ""}
            {trend !== 0 ? `${Math.abs(trend)}%` : "No change"}
          </span>
          <span className="text-xs text-gray-400">{trendLabel}</span>
        </div>
      </div>
    </div>
  );
}
