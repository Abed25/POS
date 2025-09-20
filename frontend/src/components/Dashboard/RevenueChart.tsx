import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
  data: Array<{
    date: string;
    revenue: number;
    sales: number;
  }>;
}

export const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend</h3>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" tick={{ fontSize: 12 }} axisLine={false} />
          <YAxis
            tick={{ fontSize: 12 }}
            axisLine={false}
            tickFormatter={(value) => `$${value}`}
          />
          <Tooltip
            formatter={(value: number) => [`$${value}`, "Revenue"]}
            labelStyle={{ color: "#374151" }}
          />
          <Line
            type="monotone"
            dataKey="revenue"
            stroke="#3B82F6"
            strokeWidth={2}
            dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};
