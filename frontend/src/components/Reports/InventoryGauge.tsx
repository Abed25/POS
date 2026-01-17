import { useState, useEffect } from "react";
import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
//import { inventoryApi, InventoryStats } from "@/services/api"; // Adjust path as needed
import { inventoryApi } from "../../lib/api";
import type { InventoryStats } from "../../types/index";

const COLORS = ["hsl(217, 91%, 45%)", "hsl(220, 14%, 92%)"];

export function InventoryGauge() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    inventoryApi
      .getTurnoverStats()
      .then((data) => {
        setStats(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("Failed to load inventory stats", err);
        setIsLoading(false);
      });
  }, []);

  if (isLoading)
    return (
      <div className="h-[400px] flex items-center justify-center">
        Loading...
      </div>
    );
  if (!stats) return null;

  // Calculate gauge fill based on dynamic maxRate from backend
  const percentage = (stats.turnoverRate / stats.maxRate) * 100;
  const chartData = [
    { name: "Current", value: percentage },
    { name: "Remaining", value: 100 - percentage },
  ];

  return (
    <div className="chart-container animate-fade-in w-full h-[400px]">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Inventory Turnover
        </h3>
        <p className="text-sm text-muted-foreground">Annual turnover rate</p>
      </div>

      <div className="relative h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              startAngle={180}
              endAngle={0}
              innerRadius="60%"
              outerRadius="80%"
              dataKey="value"
              stroke="none"
              isAnimationActive={true}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[index % COLORS.length]}
                />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        <div className="absolute inset-0 flex flex-col items-center justify-center translate-y-4">
          <span className="text-4xl font-bold text-foreground">
            {stats.turnoverRate}x
          </span>
          <span className="text-sm text-muted-foreground">Turnover Rate</span>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-border">
        <div className="text-center">
          <p className="text-xl font-semibold text-foreground">
            {stats.daysOfStock}
          </p>
          <p className="text-xs text-muted-foreground">Days of Stock</p>
        </div>
        <div className="text-center">
          {/* Formatting for KES */}
          <p className="text-xl font-semibold text-foreground">
            {new Intl.NumberFormat("en-KE", {
              style: "currency",
              currency: "KES",
              maximumFractionDigits: 0,
            }).format(stats.monthlyCogs)}
          </p>
          <p className="text-xs text-muted-foreground">Monthly COGS</p>
        </div>
        <div className="text-center">
          <p
            className={`text-xl font-semibold ${
              stats.vsLastYear >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {stats.vsLastYear > 0 ? `+${stats.vsLastYear}` : stats.vsLastYear}x
          </p>
          <p className="text-xs text-muted-foreground">vs Last Year</p>
        </div>
      </div>
    </div>
  );
}
