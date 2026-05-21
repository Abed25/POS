// RevenueChart.tsx
import { useEffect, useState } from "react";
import {
  ComposedChart,
  Line,
  Area,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { analyticsApi } from "../../lib/api";
import type { PerformanceData } from "../../types/index";
import type { DateRange } from "./ReportDashboard";
import { BarChart2, LineChart as LineChartIcon } from "lucide-react";

const MONTHS_ORDER = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

type ViewMode = "line" | "bar";
type DataKey = "revenue" | "profit" | "both";

const fmtKES = (v: number) =>
  v >= 1_000_000
    ? `KES ${(v / 1_000_000).toFixed(1)}M`
    : v >= 1_000
      ? `KES ${(v / 1_000).toFixed(0)}k`
      : `KES ${v}`;

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-200 rounded-xl shadow-xl p-4 min-w-[180px]">
      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide mb-3">
        {label}
      </p>
      {payload.map((p: any) => (
        <div
          key={p.dataKey}
          className="flex items-center justify-between gap-6 mb-1.5"
        >
          <div className="flex items-center gap-1.5">
            <span
              className="w-2.5 h-2.5 rounded-full"
              style={{ backgroundColor: p.color }}
            />
            <span className="text-xs text-gray-500 capitalize">{p.name}</span>
          </div>
          <span className="text-xs font-bold text-gray-900">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
              maximumFractionDigits: 0,
            }).format(Number(p.value))}
          </span>
        </div>
      ))}
      {payload.length === 2 && (
        <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between">
          <span className="text-[10px] text-gray-400">Margin</span>
          <span className="text-[10px] font-bold text-violet-600">
            {payload[0].value > 0
              ? `${((payload[1].value / payload[0].value) * 100).toFixed(1)}%`
              : "—"}
          </span>
        </div>
      )}
    </div>
  );
};

interface Props {
  dateRange: DateRange;
}

export function RevenueChart({ dateRange }: Props) {
  const [data, setData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("line");
  const [activeKeys, setActiveKeys] = useState<DataKey>("both");

  useEffect(() => {
    setLoading(true);
    analyticsApi
      .getMonthlyPerformance()
      .then((backendData) => {
        const full = MONTHS_ORDER.map(
          (m) =>
            backendData.find((d) => d.month === m) || {
              month: m,
              revenue: 0,
              profit: 0,
            },
        );
        setData(full);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [dateRange]);

  const showRevenue = activeKeys === "both" || activeKeys === "revenue";
  const showProfit = activeKeys === "both" || activeKeys === "profit";

  // Summary stats
  const totalRevenue = data.reduce((s, d) => s + (d.revenue || 0), 0);
  const totalProfit = data.reduce((s, d) => s + (d.profit || 0), 0);
  const avgMargin =
    totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : "0";

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-gray-900">
            Annual Performance
          </h3>
          <p className="text-xs text-gray-400 mt-0.5">
            Revenue & Profit trend · {dateRange.label}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Summary pills */}
          <div className="hidden lg:flex items-center gap-3 mr-2">
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Revenue
              </p>
              <p className="text-sm font-bold text-blue-600">
                {fmtKES(totalRevenue)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Profit
              </p>
              <p className="text-sm font-bold text-emerald-600">
                {fmtKES(totalProfit)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase tracking-wide">
                Margin
              </p>
              <p className="text-sm font-bold text-violet-600">{avgMargin}%</p>
            </div>
          </div>

          {/* Data toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
            {(["both", "revenue", "profit"] as DataKey[]).map((k) => (
              <button
                key={k}
                onClick={() => setActiveKeys(k)}
                className={`px-2.5 py-1.5 capitalize transition ${
                  activeKeys === k
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {k}
              </button>
            ))}
          </div>

          {/* Chart type toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode("line")}
              className={`p-1.5 transition ${viewMode === "line" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <LineChartIcon className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("bar")}
              className={`p-1.5 transition ${viewMode === "bar" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <BarChart2 className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Chart */}
      <div className="h-72">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="space-y-2 w-full px-4">
              {[80, 60, 90, 50, 70].map((w, i) => (
                <div
                  key={i}
                  className="h-3 bg-gray-100 rounded animate-pulse"
                  style={{ width: `${w}%` }}
                />
              ))}
            </div>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={data}
              margin={{ top: 4, right: 4, left: 10, bottom: 0 }}
            >
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#2563eb" stopOpacity={0.15} />
                  <stop offset="95%" stopColor="#2563eb" stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#f1f5f9"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8" }}
                dy={8}
              />

              <YAxis
                fontSize={11}
                tickLine={false}
                axisLine={false}
                tick={{ fill: "#94a3b8" }}
                tickFormatter={fmtKES}
                width={72}
              />

              <Tooltip content={<CustomTooltip />} />

              {viewMode === "line" ? (
                <>
                  {showRevenue && (
                    <>
                      <Area
                        type="monotone"
                        dataKey="revenue"
                        fill="url(#revGrad)"
                        stroke="none"
                      />
                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2563eb"
                        strokeWidth={2.5}
                        dot={false}
                        activeDot={{
                          r: 5,
                          fill: "#2563eb",
                          stroke: "white",
                          strokeWidth: 2,
                        }}
                        name="Revenue"
                      />
                    </>
                  )}
                  {showProfit && (
                    <Line
                      type="monotone"
                      dataKey="profit"
                      stroke="#10b981"
                      strokeWidth={2.5}
                      dot={false}
                      strokeDasharray={showRevenue ? "5 3" : undefined}
                      activeDot={{
                        r: 5,
                        fill: "#10b981",
                        stroke: "white",
                        strokeWidth: 2,
                      }}
                      name="Profit"
                    />
                  )}
                </>
              ) : (
                <>
                  {showRevenue && (
                    <Bar
                      dataKey="revenue"
                      fill="#2563eb"
                      radius={[4, 4, 0, 0]}
                      barSize={14}
                      name="Revenue"
                    />
                  )}
                  {showProfit && (
                    <Bar
                      dataKey="profit"
                      fill="#10b981"
                      radius={[4, 4, 0, 0]}
                      barSize={14}
                      name="Profit"
                    />
                  )}
                </>
              )}
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-4 pt-4 border-t border-gray-100">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-blue-600 rounded-full inline-block" />
          <span className="text-xs text-gray-500">Revenue</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-0.5 bg-emerald-500 rounded-full inline-block" />
          <span className="text-xs text-gray-500">Profit</span>
        </div>
        <div className="ml-auto text-xs text-gray-400">
          Avg margin:{" "}
          <span className="font-semibold text-violet-600">{avgMargin}%</span>
        </div>
      </div>
    </div>
  );
}
