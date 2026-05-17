import React, { useState, useEffect, useCallback } from "react";
import {
  CubeIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  ArrowTrendingUpIcon,
  ShoppingCartIcon,
  ArchiveBoxXMarkIcon,
  BanknotesIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/20/solid";

import { productApi, salesApi } from "../lib/api";
import { ProductMetrics } from "../types";
import { useMetricsRefresh } from "../contexts/MetricsRefreshContext";

// ─── TYPES ───────────────────────────────────────────────────────────────────

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
  trend?: {
    value: number;
    label: string;
  };
}

interface StockAlertItem {
  id: number;
  name: string;
  stock: number;
  min_stock?: number;
  status: "out_of_stock" | "low_stock";
}

interface SalesSummary {
  todaySales: number;
  todayRevenue: number;
  weeklyRevenue: number;
  avgProfitMargin: number;
}

// ─── METRIC CARD ─────────────────────────────────────────────────────────────

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>

        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold text-gray-900 tracking-tight">
          {value}
        </p>

        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>

      {trend && (
        <div className="flex items-center gap-1 text-xs font-medium">
          {trend.value >= 0 ? (
            <ArrowUpIcon className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <ArrowDownIcon className="h-3.5 w-3.5 text-red-500" />
          )}

          <span
            className={trend.value >= 0 ? "text-green-600" : "text-red-600"}
          >
            {Math.abs(trend.value)}%
          </span>

          <span className="text-gray-400">{trend.label}</span>
        </div>
      )}
    </div>
  );
};

// ─── SECTION HEADER ──────────────────────────────────────────────────────────

const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>

      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
};

// ─── SKELETON CARD ───────────────────────────────────────────────────────────

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="flex justify-between mb-3">
        <div className="h-3 bg-gray-200 rounded w-1/3" />
        <div className="h-8 w-8 bg-gray-200 rounded-lg" />
      </div>

      <div className="h-7 bg-gray-200 rounded w-1/2 mb-2" />

      <div className="h-3 bg-gray-200 rounded w-1/4" />
    </div>
  );
};

// ─── HELPERS ─────────────────────────────────────────────────────────────────

const fmtKES = (value: number) => {
  return `KES ${new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value || 0)}`;
};

const getStatus = (stock: number, min?: number) => {
  const minimum = min ?? 5;

  if (stock === 0) return "out_of_stock";

  if (stock <= minimum) return "low_stock";

  return "in_stock";
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────

export const Dashboard: React.FC = () => {
  const { metricsRefresh } = useMetricsRefresh();

  const [metrics, setMetrics] = useState<ProductMetrics | null>(null);

  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<any>(null);

  // ─── STOCK ALERTS ────────────────────────────────────────────────────────

  const stockAlerts: StockAlertItem[] =
    (metrics as any)?.low_stock_products ?? [];

  // ─── FETCH DATA ──────────────────────────────────────────────────────────

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      setError(null);

      const [productSummary, salesSummaryResponse] = await Promise.all([
        productApi.getSummary(),
        salesApi.getSalesSummary(),
      ]);

      setMetrics(productSummary as ProductMetrics);

      setSalesSummary(salesSummaryResponse as SalesSummary);
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);

      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── EFFECT ──────────────────────────────────────────────────────────────

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, metricsRefresh]);

  // ─── ERROR UI ────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <ExclamationTriangleIcon className="h-12 w-12 text-red-400" />

        <p className="text-gray-600 text-sm">Failed to load dashboard data.</p>

        <button
          onClick={fetchDashboardData}
          className="px-4 py-2 rounded-lg bg-blue-600 text-white text-sm hover:bg-blue-700 transition"
        >
          Retry
        </button>
      </div>
    );
  }

  // ─── DERIVED METRICS ─────────────────────────────────────────────────────

  const productCount = metrics?.product_count ?? 0;

  const totalStockValue = (metrics as any)?.total_stock_value ?? 0;

  const lowStockCount = (metrics as any)?.low_stock_count ?? 0;

  const outOfStockCount = (metrics as any)?.out_of_stock_count ?? 0;

  // ─── SALES VALUES ────────────────────────────────────────────────────────

  const todaysSales = salesSummary?.todaySales || 0;

  const todaysRevenue = salesSummary?.todayRevenue || 0;

  const weeklyRevenue = salesSummary?.weeklyRevenue || 0;

  const avgMargin = salesSummary?.avgProfitMargin || 0;

  // ─── UI ──────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>

          <p className="mt-1 text-sm text-gray-500">
            {new Date().toLocaleDateString("en-KE", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <button
          onClick={fetchDashboardData}
          disabled={loading}
          className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-50"
        >
          <svg
            className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
          Refresh
        </button>
      </div>

      {/* INVENTORY OVERVIEW */}

      <div>
        <SectionHeader title="Inventory Overview" subtitle="Live stock data" />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {loading ? (
            Array.from({ length: 4 }).map((_, index) => (
              <SkeletonCard key={index} />
            ))
          ) : (
            <>
              <MetricCard
                title="Total Products"
                value={productCount}
                subtitle="Unique SKUs in inventory"
                icon={CubeIcon}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />

              <MetricCard
                title="Total Stock Value"
                value={fmtKES(totalStockValue)}
                subtitle="Based on selling price"
                icon={BanknotesIcon}
                iconBg="bg-green-50"
                iconColor="text-green-600"
              />

              <MetricCard
                title="Low Stock Alerts"
                value={lowStockCount}
                subtitle="Products below minimum"
                icon={ExclamationTriangleIcon}
                iconBg="bg-yellow-50"
                iconColor="text-yellow-600"
              />

              <MetricCard
                title="Out of Stock"
                value={outOfStockCount}
                subtitle="Requires immediate restock"
                icon={ArchiveBoxXMarkIcon}
                iconBg="bg-red-50"
                iconColor="text-red-600"
              />
            </>
          )}
        </div>
      </div>

      {/* SALES OVERVIEW */}

      <div>
        <SectionHeader
          title="Sales Overview"
          subtitle="Live sales performance"
        />

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <MetricCard
            title="Today's Sales"
            value={todaysSales}
            subtitle="Number of transactions"
            icon={ShoppingCartIcon}
            iconBg="bg-purple-50"
            iconColor="text-purple-600"
          />

          <MetricCard
            title="Today's Revenue"
            value={fmtKES(todaysRevenue)}
            subtitle="Total sales amount today"
            icon={CurrencyDollarIcon}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />

          <MetricCard
            title="Weekly Revenue"
            value={fmtKES(weeklyRevenue)}
            subtitle="Last 7 days"
            icon={ChartBarIcon}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />

          <MetricCard
            title="Avg. Profit Margin"
            value={`${avgMargin}%`}
            subtitle="Across all sold products"
            icon={ArrowTrendingUpIcon}
            iconBg="bg-teal-50"
            iconColor="text-teal-600"
          />
        </div>
      </div>

      {/* LOWER PANELS */}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* STOCK ALERTS */}

        <div className="lg:col-span-1 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              Stock Alerts
            </h2>

            {lowStockCount + outOfStockCount > 0 && (
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-700">
                {lowStockCount + outOfStockCount} item
                {lowStockCount + outOfStockCount > 1 ? "s" : ""}
              </span>
            )}
          </div>

          {loading ? (
            <div className="space-y-3">
              {Array.from({ length: 4 }).map((_, index) => (
                <div
                  key={index}
                  className="h-10 bg-gray-100 rounded animate-pulse"
                />
              ))}
            </div>
          ) : stockAlerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
              <CubeIcon className="h-8 w-8 text-gray-300" />

              <p className="text-sm text-gray-400">
                All products are sufficiently stocked
              </p>
            </div>
          ) : (
            <ul className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {stockAlerts.map((item) => {
                const status = getStatus(item.stock, item.min_stock);

                return (
                  <li
                    key={item.id}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm ${
                      status === "out_of_stock"
                        ? "bg-red-50 border border-red-200"
                        : "bg-yellow-50 border border-yellow-200"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <ExclamationTriangleIcon
                        className={`h-4 w-4 flex-shrink-0 ${
                          status === "out_of_stock"
                            ? "text-red-500"
                            : "text-yellow-500"
                        }`}
                      />

                      <span className="truncate font-medium text-gray-800">
                        {item.name}
                      </span>
                    </div>

                    <span
                      className={`ml-3 flex-shrink-0 text-xs font-semibold ${
                        status === "out_of_stock"
                          ? "text-red-600"
                          : "text-yellow-700"
                      }`}
                    >
                      {status === "out_of_stock" ? "Out" : `${item.stock} left`}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* REVENUE CHART */}

        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-800">
              Revenue Over Time
            </h2>

            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
              Coming soon
            </span>
          </div>

          <div className="flex flex-col items-center justify-center h-56 rounded-lg border-2 border-dashed border-gray-200 gap-3">
            <ChartBarIcon className="h-10 w-10 text-gray-300" />

            <p className="text-sm text-gray-400">
              Sales chart will appear here
            </p>

            <p className="text-xs text-gray-300">
              Connect your sales API to populate
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
