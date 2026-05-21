// ProductChart.tsx
import { useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import type { DateRange } from "./ReportDashboard";

// ── Mock data (replace with API call when ready) ──
const CATEGORY_DATA = [
  { name: "Electronics", revenue: 1_240_000, units: 420, margin: 34 },
  { name: "Apparel", revenue: 892_000, units: 1_120, margin: 48 },
  { name: "Home & Garden", revenue: 654_000, units: 340, margin: 29 },
  { name: "Food & Bev", revenue: 523_000, units: 2_880, margin: 22 },
  { name: "Sports", revenue: 412_000, units: 560, margin: 41 },
  { name: "Stationery", revenue: 198_000, units: 930, margin: 55 },
];

const PRODUCT_DATA = [
  { name: "BT Headphones", revenue: 480_000, units: 160, margin: 38 },
  { name: "Laptop Stand", revenue: 310_000, units: 620, margin: 52 },
  { name: "USB-C Hub", revenue: 270_000, units: 450, margin: 44 },
  { name: "Power Bank 20k", revenue: 220_000, units: 340, margin: 31 },
  { name: "Smart Watch Band", revenue: 190_000, units: 520, margin: 61 },
  { name: "Desk Lamp", revenue: 140_000, units: 280, margin: 39 },
];

const PALETTE = [
  "#2563eb",
  "#3b82f6",
  "#60a5fa",
  "#93c5fd",
  "#bfdbfe",
  "#dbeafe",
];

type Metric = "revenue" | "units" | "margin";
type DrillMode = "category" | "product";

const fmtKES = (v: number) =>
  v >= 1_000_000
    ? `KES ${(v / 1_000_000).toFixed(2)}M`
    : `KES ${(v / 1_000).toFixed(0)}k`;

const CustomTooltip = ({ active, payload, label, metric }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 min-w-[180px]">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">
        {label}
      </p>
      <p className="text-lg font-extrabold text-gray-900">
        {metric === "revenue"
          ? new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
              maximumFractionDigits: 0,
            }).format(d.value)
          : metric === "margin"
            ? `${d.value}%`
            : d.value.toLocaleString()}
      </p>
      <p className="text-xs text-gray-400 mt-0.5 capitalize">{metric}</p>
    </div>
  );
};

interface Props {
  dateRange: DateRange;
}

export function ProductChart({ dateRange }: Props) {
  const [metric, setMetric] = useState<Metric>("revenue");
  const [drill, setDrill] = useState<DrillMode>("category");

  const data = drill === "category" ? CATEGORY_DATA : PRODUCT_DATA;
  const sorted = [...data].sort((a, b) => b[metric] - a[metric]);

  const total = sorted.reduce((s, d) => s + d[metric], 0);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Product Performance
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            {drill === "category" ? "By category" : "Top products"} ·{" "}
            {dateRange.label}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Drill toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            <button
              onClick={() => setDrill("category")}
              className={`px-2.5 py-1.5 transition ${drill === "category" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
            >
              Category
            </button>
            <button
              onClick={() => setDrill("product")}
              className={`px-2.5 py-1.5 transition ${drill === "product" ? "bg-gray-900 text-white" : "text-gray-500 hover:bg-gray-50"}`}
            >
              Products
            </button>
          </div>

          {/* Metric toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            {(["revenue", "units", "margin"] as Metric[]).map((m) => (
              <button
                key={m}
                onClick={() => setMetric(m)}
                className={`px-2.5 py-1.5 capitalize transition ${metric === m ? "bg-blue-600 text-white" : "text-gray-500 hover:bg-gray-50"}`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={sorted}
            layout="vertical"
            margin={{ left: 4, right: 48, top: 0, bottom: 0 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="#f1f5f9"
              horizontal={false}
            />
            <XAxis
              type="number"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#94a3b8" }}
              tickFormatter={(v) =>
                metric === "revenue"
                  ? fmtKES(v)
                  : metric === "margin"
                    ? `${v}%`
                    : v.toLocaleString()
              }
            />
            <YAxis
              type="category"
              dataKey="name"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tick={{ fill: "#64748b" }}
              width={110}
            />
            <Tooltip
              cursor={{ fill: "#f8fafc" }}
              content={<CustomTooltip metric={metric} />}
            />
            <Bar
              dataKey={metric}
              radius={[0, 6, 6, 0]}
              barSize={22}
              label={{
                position: "right",
                fontSize: 10,
                fill: "#94a3b8",
                formatter: (v) => {
                  const value = Number(v ?? 0);

                  return metric === "revenue"
                    ? fmtKES(value)
                    : metric === "margin"
                      ? `${value}%`
                      : value.toLocaleString();
                },
              }}
            >
              {sorted.map((_, i) => (
                <Cell key={i} fill={PALETTE[i % PALETTE.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Footer summary */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span>
            {sorted.length} {drill === "category" ? "categories" : "products"}
          </span>
          <span className="text-gray-200">|</span>
          <span>
            Total{" "}
            <span className="font-semibold text-gray-700">
              {metric === "revenue"
                ? new Intl.NumberFormat("en-KE", {
                    style: "currency",
                    currency: "KES",
                    maximumFractionDigits: 0,
                  }).format(total)
                : metric === "margin"
                  ? `${(total / sorted.length).toFixed(1)}% avg`
                  : total.toLocaleString() + " units"}
            </span>
          </span>
        </div>
        <span className="text-[10px] text-gray-300 uppercase tracking-widest">
          Mock Data
        </span>
      </div>
    </div>
  );
}
