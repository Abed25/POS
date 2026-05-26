import React from "react";
import {
  Card,
  CardContent,
  Button,
  Typography,
  Grid,
  Paper,
} from "@mui/material";

// --- KPI Card ---
const KpiCard = ({ title, value, trend, color }) => (
  <Paper className={`p-4 rounded-lg shadow-md ${color} text-gray-800`}>
    <Typography variant="body2" className="text-gray-500 mb-1">
      {title}
    </Typography>
    <Typography variant="h5" className="font-bold">
      {value}
    </Typography>
    <Typography
      variant="body2"
      className={trend.includes("↑") ? "text-green-600" : "text-red-600"}
    >
      {trend}
    </Typography>
  </Paper>
);

// --- Chart Placeholder ---
const ChartPlaceholder = ({ title }) => (
  <Paper className="p-4 bg-white rounded-lg shadow-md h-64 flex items-center justify-center">
    <p className="text-gray-400 italic">[{title} - Chart Placeholder]</p>
  </Paper>
);

// --- Table Placeholder ---
const TablePlaceholder = ({ title, headers }) => (
  <Paper className="p-4 bg-white rounded-lg shadow-md">
    <Typography variant="h6" className="mb-3 font-semibold">
      {title}
    </Typography>
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
          <tr className="hover:bg-gray-50">
            {headers.map((h, i) => (
              <td
                key={i}
                className="px-6 py-4 whitespace-nowrap text-sm text-gray-700"
              >
                Placeholder
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
    <p className="text-xs text-gray-400 mt-2">
      Dynamic data will populate here.
    </p>
  </Paper>
);

// --- Final Combined Modern Report ---
const Report3 = () => {
  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <Typography variant="h4" className="font-bold text-gray-800 mb-6">
        📊 Consolidated Business Dashboard (Merged Version)
      </Typography>

      {/* Filters */}
      <Paper className="p-4 bg-white rounded-lg shadow-md mb-6 flex space-x-4">
        <Typography className="text-gray-600 font-semibold">
          Filters:
        </Typography>
        <Button variant="contained">Date Range</Button>
        <Button variant="outlined">Category</Button>
        <Button variant="outlined">Warehouse</Button>
        <Button variant="outlined">Users</Button>
      </Paper>

      {/* KPI Cards */}
      <Grid container spacing={3} className="mb-8">
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Total Revenue"
            value="KES 2,500,000"
            trend="↑ 12.5%"
            color="bg-green-50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard
            title="Gross Profit"
            value="KES 850,000"
            trend="↑ 8.1%"
            color="bg-green-50"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Total Orders" value="452" trend="↑ 4.5%" />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <KpiCard title="Avg Order Value" value="KES 5,531" trend="↓ 1.2%" />
        </Grid>
      </Grid>

      {/* Charts Section */}
      <Grid container spacing={3} className="mb-10">
        <Grid item xs={12} md={8}>
          <ChartPlaceholder title="Revenue & Profit Trend (Line Chart)" />
        </Grid>
        <Grid item xs={12} md={4}>
          <ChartPlaceholder title="Inventory Turnover Rate (Gauge Chart)" />
        </Grid>
      </Grid>

      {/* Tables Section */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <TablePlaceholder
            title="🔴 Low Stock Alerts"
            headers={[
              "SKU",
              "Product",
              "On Hand",
              "Reorder Point",
              "Days Left",
            ]}
          />
        </Grid>

        <Grid item xs={12} md={8}>
          <TablePlaceholder
            title="📈 Top & Bottom Products"
            headers={["Product", "Revenue", "Margin %", "Units Sold", "Trend"]}
          />
        </Grid>

        <Grid item xs={12}>
          <TablePlaceholder
            title="🔒 User Activity Log"
            headers={["Timestamp", "User", "Action", "Details", "IP Address"]}
          />
        </Grid>
      </Grid>
    </div>
  );
};

export default Report3;
