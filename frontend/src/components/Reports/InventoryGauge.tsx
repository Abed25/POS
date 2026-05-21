// InventoryGauge.tsx
import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { inventoryApi } from "../../lib/api";
import type { InventoryStats } from "../../types/index";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";

const TRACK_COLOR = "#f1f5f9";
const FILL_COLOR = "#2563eb";

const fmtKES = (n: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(n);

export function InventoryGauge() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    inventoryApi
      .getTurnoverStats()
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load inventory stats", err);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full flex flex-col animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/2 mb-2" />
        <div className="h-3 bg-gray-100 rounded w-1/3 mb-6" />
        <div className="flex-1 bg-gray-100 rounded-xl" />
        <div className="grid grid-cols-3 gap-3 mt-4">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-12 bg-gray-100 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (!stats) return null;

  const pct = Math.min((stats.turnoverRate / stats.maxRate) * 100, 100);
  const chartData = [
    { name: "Used", value: pct },
    { name: "Remaining", value: 100 - pct },
  ];

  // Health label
  const health =
    pct >= 80
      ? { label: "Excellent", color: "text-emerald-600" }
      : pct >= 50
        ? { label: "Healthy", color: "text-blue-600" }
        : pct >= 25
          ? { label: "Moderate", color: "text-amber-500" }
          : { label: "Low", color: "text-red-500" };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-start justify-between mb-2">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Inventory Turnover
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">Annual rotation rate</p>
        </div>
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold">
          <Activity className="h-3 w-3" />
          Live
        </div>
      </div>

      {/* Gauge */}
      <div className="relative flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="80%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="85%"
              dataKey="value"
              stroke="none"
            >
              <Cell fill={FILL_COLOR} />
              <Cell fill={TRACK_COLOR} />
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-4">
          <span className="text-4xl font-extrabold text-gray-900 leading-none">
            {stats.turnoverRate}x
          </span>
          <span className={`text-sm font-semibold mt-1 ${health.color}`}>
            {health.label}
          </span>
          <span className="text-xs text-gray-400">of {stats.maxRate}x max</span>
        </div>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-3 gap-3 mt-2 pt-4 border-t border-gray-100">
        <StatCell
          label="Days of Stock"
          value={`${stats.daysOfStock}d`}
          sub={stats.daysOfStock <= 30 ? "⚠ Restock soon" : "Sufficient"}
          subColor={
            stats.daysOfStock <= 30 ? "text-amber-500" : "text-emerald-500"
          }
        />
        <StatCell
          label="Monthly COGS"
          value={fmtKES(stats.monthlyCogs)}
          sub="Cost of goods sold"
          subColor="text-gray-400"
        />
        <StatCell
          label="vs Last Year"
          value={`${stats.vsLastYear > 0 ? "+" : ""}${stats.vsLastYear}x`}
          sub={stats.vsLastYear >= 0 ? "Improving" : "Declining"}
          subColor={stats.vsLastYear >= 0 ? "text-emerald-500" : "text-red-500"}
          icon={
            stats.vsLastYear >= 0 ? (
              <TrendingUp className="h-3 w-3 text-emerald-500" />
            ) : (
              <TrendingDown className="h-3 w-3 text-red-500" />
            )
          }
        />
      </div>
    </div>
  );
}

function StatCell({
  label,
  value,
  sub,
  subColor,
  icon,
}: {
  label: string;
  value: string;
  sub: string;
  subColor: string;
  icon?: React.ReactNode;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-3 text-center">
      <p className="text-[10px] uppercase tracking-widest text-gray-400 font-semibold mb-1">
        {label}
      </p>
      <p className="text-lg font-extrabold text-gray-900 leading-none">
        {value}
      </p>
      <div
        className={`flex items-center justify-center gap-1 mt-1 text-[10px] font-medium ${subColor}`}
      >
        {icon}
        {sub}
      </div>
    </div>
  );
}
