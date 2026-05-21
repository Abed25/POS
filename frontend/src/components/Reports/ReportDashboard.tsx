// ReportDashboard.tsx
import { useState } from "react";
import { KPISection } from "./KPISection";
import { RevenueChart } from "./RevenueChart";
import { InventoryGauge } from "./InventoryGauge";
import { ProductChart } from "./ProductChart";
import { LowStockTable } from "./LowStockTable";
import { DateRangeFilter } from "./DateRangeFilter";
import { ReportExportButton } from "./ReportExportButton";
import { BarChart3, RefreshCw } from "lucide-react";

export type DateRange = {
  from: string; // ISO date string e.g. "2025-01-01"
  to: string;
  label: string; // e.g. "Last 30 Days"
};

const DEFAULT_RANGE: DateRange = {
  from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10),
  to: new Date().toISOString().slice(0, 10),
  label: "Last 30 Days",
};

export function ReportDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>(DEFAULT_RANGE);
  const [refreshKey, setRefreshKey] = useState(0);
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshKey((k) => k + 1);
      setRefreshing(false);
    }, 800);
  };

  return (
    <div className="min-h-screen bg-[#f5f6fa] font-sans">
      {/* ── TOP HEADER ── */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center">
              <BarChart3 className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-base font-bold text-gray-900 leading-none">
                Business Intelligence
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">Advanced Reporting</p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-3">
            {/* Live indicator */}
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-gray-400 border border-gray-200 rounded-full px-3 py-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              Live
            </div>

            {/* Date Range */}
            <DateRangeFilter value={dateRange} onChange={setDateRange} />

            {/* Refresh */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
              />
              Refresh
            </button>

            {/* Export */}
            <ReportExportButton dateRange={dateRange} />
          </div>
        </div>
      </header>

      {/* ── MAIN ── */}
      <main
        key={refreshKey}
        className="max-w-screen-2xl mx-auto px-6 py-8 space-y-8"
      >
        {/* KPI Row */}
        <KPISection dateRange={dateRange} />

        {/* Revenue + Gauge */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart dateRange={dateRange} />
          </div>
          <div>
            <InventoryGauge />
          </div>
        </div>

        {/* Product Chart + Low Stock */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductChart dateRange={dateRange} />
          <LowStockTable />
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-200 bg-white mt-8">
        <div className="max-w-screen-2xl mx-auto px-6 py-4 flex items-center justify-between text-xs text-gray-400">
          <span>
            © {new Date().getFullYear()} Business Intelligence Platform
          </span>
          <span>
            Reporting period:{" "}
            <span className="font-medium text-gray-600">{dateRange.label}</span>
          </span>
        </div>
      </footer>
    </div>
  );
}

export default ReportDashboard;
