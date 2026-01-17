import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { cn } from "../../lib/utils.ts";

interface KPICardProps {
  title: string;
  value: string;
  trend: number;
  trendLabel: string;
  icon: React.ReactNode;
  delay?: number;
}

export function KPICard({
  title,
  value,
  trend,
  trendLabel,
  icon,
  delay = 0,
}: KPICardProps) {
  const isPositive = trend > 0;
  const isNegative = trend < 0;
  const isNeutral = trend === 0;

  /* ---------- Trend Color ---------- */
  const trendColorClass = isPositive
    ? "text-emerald-600"
    : isNegative
      ? "text-red-600"
      : "text-gray-500";

  /* ---------- Indicator Color (kept simple) ---------- */
  const indicatorColor = title.includes("Revenue")
    ? "bg-indigo-500"
    : title.includes("Profit")
      ? "bg-emerald-500"
      : title.includes("Orders")
        ? "bg-amber-500"
        : title.includes("Users")
          ? "bg-sky-500"
          : "bg-gray-400";

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-white rounded-xl",
        "border border-gray-100 p-6",
        "shadow-sm hover:shadow-lg transition-all duration-300",
        "hover:-translate-y-0.5",
      )}
      style={{ animation: `fade-in 0.3s ease-out ${delay}ms forwards` }}
    >
      {/* Indicator Line */}
      <div
        className={cn("absolute top-0 left-0 h-full w-1.5", indicatorColor)}
      />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 pl-1">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-600">
          {title}
        </p>
        <div className="p-2 rounded-md bg-gray-50 text-gray-700">{icon}</div>
      </div>

      {/* Value */}
      <div className="pl-1">
        <p className="text-2xl font-extrabold tracking-tight text-gray-900 mb-3">
          {value}
        </p>

        {/* Trend */}
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "flex items-center gap-1 text-sm font-semibold",
              trendColorClass,
            )}
          >
            {isPositive && <TrendingUp className="h-4 w-4" />}
            {isNegative && <TrendingDown className="h-4 w-4" />}
            {isNeutral && <Minus className="h-4 w-4" />}

            {!isNeutral && <span>{Math.abs(trend).toLocaleString()}</span>}
            {isNeutral && <span>No change</span>}
          </span>

          <span className="text-xs text-gray-400">{trendLabel}</span>
        </div>
      </div>
    </div>
  );
}
