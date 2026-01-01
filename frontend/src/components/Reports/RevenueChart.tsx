import React, { useEffect, useState } from "react";
import {
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
} from "recharts";
import { analyticsApi } from "../../lib/api";
import type { PerformanceData } from "../../types/index";

// Helper to ensure the graph always has 12 months
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

export function RevenueChart() {
  const [performanceData, setPerformanceData] = useState<PerformanceData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    analyticsApi
      .getMonthlyPerformance()
      .then((backendData) => {
        // --- DATA PADDING LOGIC ---
        // Map through all 12 months to ensure none are missing
        const fullYearData = MONTHS_ORDER.map((monthName) => {
          const found = backendData.find((item) => item.month === monthName);

          // If month exists in DB, use it. Otherwise, return 0s for that month.
          return found || { month: monthName, revenue: 0, profit: 0 };
        });

        setPerformanceData(fullYearData);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load chart data:", err);
        setLoading(false);
      });
  }, []);

  return (
    <div
      className="chart-container animate-fade-in w-full bg-card p-6 rounded-xl border border-border"
      style={{ height: "450px" }}
    >
      {/* Header Section */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h3 className="text-lg font-semibold text-foreground">
            Annual Performance
          </h3>
          <p className="text-sm text-muted-foreground">
            Revenue and Profit trend for the current year (KES)
          </p>
        </div>

        {/* Custom Legend */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-600" />
            <span className="text-muted-foreground font-medium">Revenue</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-muted-foreground font-medium">Profit</span>
          </div>
        </div>
      </div>

      <div className="h-[320px] w-full">
        {loading ? (
          <div className="flex items-center justify-center h-full text-muted-foreground animate-pulse">
            Fetching sales data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={performanceData}
              margin={{ top: 10, right: 10, left: 20, bottom: 0 }}
            >
              <defs>
                <linearGradient
                  id="revenueGradient"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor="hsl(217, 91%, 45%)"
                    stopOpacity={0.2}
                  />
                  <stop
                    offset="95%"
                    stopColor="hsl(217, 91%, 45%)"
                    stopOpacity={0}
                  />
                </linearGradient>
              </defs>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(220, 13%, 91%)"
                vertical={false}
              />

              <XAxis
                dataKey="month"
                stroke="hsl(220, 10%, 46%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                dy={10}
              />

              <YAxis
                stroke="hsl(220, 10%, 46%)"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                // Formats 150000 to KES 150k
                tickFormatter={(value) =>
                  `KES ${
                    value >= 1000 ? (value / 1000).toFixed(0) + "k" : value
                  }`
                }
              />
              <Tooltip
                cursor={{ stroke: "hsl(220, 13%, 91%)", strokeWidth: 2 }}
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid hsl(220, 13%, 91%)",
                  borderRadius: "8px",
                  boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                }}
                // 🔑 Fix: Allow 'any' for both value AND name to satisfy the Recharts Formatter type
                formatter={(value: any, name: any) => {
                  const numericValue = Number(value) || 0;

                  // Safety check for name
                  const displayName =
                    name === "revenue" ? "Total Revenue" : "Net Profit";

                  return [`KES ${numericValue.toLocaleString()}`, displayName];
                }}
              />

              {/* Background Area for Revenue */}
              <Area
                type="monotone"
                dataKey="revenue"
                fill="url(#revenueGradient)"
                stroke="none"
                isAnimationActive={true}
              />

              {/* Revenue Line */}
              <Line
                type="monotone"
                dataKey="revenue"
                stroke="hsl(217, 91%, 45%)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "hsl(217, 91%, 45%)",
                  strokeWidth: 2,
                  stroke: "white",
                }}
              />

              {/* Profit Line */}
              <Line
                type="monotone"
                dataKey="profit"
                stroke="hsl(142, 71%, 45%)"
                strokeWidth={3}
                dot={false}
                activeDot={{
                  r: 6,
                  fill: "hsl(142, 71%, 45%)",
                  strokeWidth: 2,
                  stroke: "white",
                }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
