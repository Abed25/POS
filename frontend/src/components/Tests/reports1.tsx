import React from "react";

// --- Placeholder Component for Material UI Elements ---
const Card = ({ title, value, trend, color = "bg-white" }) => (
  <div className={`p-4 rounded-lg shadow-md ${color} text-gray-800`}>
    <h3 className="text-sm font-medium text-gray-500 mb-1">{title}</h3>
    <p className="text-2xl font-bold">{value}</p>
    <p
      className={`text-sm mt-1 ${
        trend.includes("↑") ? "text-green-500" : "text-red-500"
      }`}
    >
      {trend}
    </p>
  </div>
);

const ChartPlaceholder = ({ title }) => (
  <div className="p-4 bg-white rounded-lg shadow-md h-64 flex items-center justify-center">
    <p className="text-gray-400 italic">
      [{title} - Chart Visualization Placeholder]
    </p>
  </div>
);

const TablePlaceholder = ({ title, headers }) => (
  <div className="p-4 bg-white rounded-lg shadow-md">
    <h3 className="text-lg font-semibold mb-3">{title}</h3>
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header) => (
              <th
                key={header}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {/* Placeholder Rows for Demonstration */}
          <tr className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
              SKU-456
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              Widget Pro
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              12
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-red-500 font-semibold">
              50
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
              10 Days
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <p className="text-xs text-gray-400 mt-2">
      Note: This table needs full sorting, pagination, and data from your
      system.
    </p>
  </div>
);

const Reports1 = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        📊 "Test" Consolidated Dashboard
      </h1>

      {/* --- 1. Top Control Bar --- */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6 flex space-x-4">
        <p className="text-gray-600 font-semibold">Filters:</p>
        <button className="text-sm bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded">
          Date Range Selector (MUI)
        </button>
        <button className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded">
          Product Category Filter (MUI)
        </button>
        <button className="text-sm bg-gray-200 text-gray-700 px-3 py-1 rounded">
          Warehouse Location Filter (MUI)
        </button>
      </div>

      {/* --- 2. Sales & Profit Snapshot (Header Cards) --- */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card
          title="Total Revenue"
          value="KES 2,500,000"
          trend="↑ 12.5% (vs. Prior)"
          color="bg-green-50"
        />
        <Card
          title="Gross Profit"
          value="KES 850,000"
          trend="↑ 8.1% (vs. Prior)"
          color="bg-green-50"
        />
        <Card title="Total Orders" value="452" trend="↑ 4.5% (vs. Prior)" />
        <Card
          title="Avg. Order Value (AOV)"
          value="KES 5,531"
          trend="↓ 1.2% (vs. Prior)"
        />
      </div>

      {/* --- 3. Core Visualizations (Center Block) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Revenue & Profit Chart */}
        <div className="lg:col-span-2">
          <ChartPlaceholder title="Revenue & Profit Trend (Line Chart)" />
        </div>

        {/* Inventory Turnover Rate */}
        <div>
          <ChartPlaceholder title="Inventory Turnover Rate (Gauge Chart)" />
        </div>
      </div>

      {/* --- 4. Detailed Tables & Alerts (Bottom Block) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Low Stock Alerts */}
        <div className="lg:col-span-1">
          <TablePlaceholder
            title="🔴 Low Stock Alerts (Inventory)"
            headers={[
              "SKU",
              "Product",
              "On Hand",
              "Reorder Point",
              "Days Left",
            ]}
          />
        </div>

        {/* Top/Bottom Products */}
        <div className="lg:col-span-2">
          <TablePlaceholder
            title="📈 Top 5/Bottom 5 Products (Sales Performance)"
            headers={[
              "Product Name",
              "Revenue (KES)",
              "Gross Margin %",
              "Units Sold",
              "Trend",
            ]}
          />
        </div>

        {/* User Activity Log */}
        <div className="lg:col-span-3 mt-6">
          <TablePlaceholder
            title="🔒 User Activity / Audit Log"
            headers={[
              "Timestamp",
              "User Name",
              "Action Performed",
              "Details",
              "IP Address",
            ]}
          />
        </div>
      </div>
    </div>
  );
};

export default Reports1;
