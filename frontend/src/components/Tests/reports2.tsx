import React from "react";
import { Card, CardContent, Button } from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

// Static demo data for preview
const data = [
  { name: "Mon", sales: 400 },
  { name: "Tue", sales: 300 },
  { name: "Wed", sales: 500 },
  { name: "Thu", sales: 200 },
  { name: "Fri", sales: 450 },
];

export default function Test() {
  return (
    <div className="min-h-screen p-6 bg-gray-50 text-gray-800">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Business Report (Static Preview)</h1>
        <Button className="rounded-2xl px-6 py-2">Download PDF</Button>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Summary Cards */}
        <Card className="shadow-lg rounded-2xl border bg-white">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Sales Summary</h2>
            <div className="space-y-2">
              <p>
                Total Sales Today: <span className="font-bold">KES 12,500</span>
              </p>
              <p>
                Total Orders: <span className="font-bold">35</span>
              </p>
              <p>
                Top Product: <span className="font-bold">Laptop Charger</span>
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-lg rounded-2xl border bg-white">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Inventory Summary</h2>
            <div className="space-y-2">
              <p>
                Low Stock Items: <span className="font-bold">4</span>
              </p>
              <p>
                Out of Stock: <span className="font-bold">1</span>
              </p>
              <p>
                Most Stocked: <span className="font-bold">Router Antennas</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Sales Chart */}
        <Card className="shadow-lg rounded-2xl border bg-white md:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Sales Trend (Static)</h2>
            <div className="w-full h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="sales" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* User Activity */}
        <Card className="shadow-lg rounded-2xl border bg-white md:col-span-2">
          <CardContent className="p-6">
            <h2 className="text-xl font-semibold mb-4">Recent User Activity</h2>
            <div className="space-y-3">
              <div className="p-3 bg-gray-100 rounded-xl">
                Cashier John processed 8 sales
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                Admin updated stock for 3 products
              </div>
              <div className="p-3 bg-gray-100 rounded-xl">
                Manager generated a sales report
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
