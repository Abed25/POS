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
  FireIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/20/solid";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

import { productApi, salesApi } from "../lib/api";
import { ProductMetrics } from "../types";
import { useMetricsRefresh } from "../contexts/MetricsRefreshContext";

// ───────────────── TYPES ─────────────────

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

interface RevenueChartItem {
  date: string;
  revenue: number;
}

// ───────────────── METRIC CARD ─────────────────

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
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-all duration-200">
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

// ───────────────── SECTION HEADER ─────────────────

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

// ───────────────── SKELETON ─────────────────

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

// ───────────────── HELPERS ─────────────────

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

// ───────────────── DASHBOARD ─────────────────

export const Dashboard: React.FC = () => {
  const { metricsRefresh } = useMetricsRefresh();

  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const role = user?.role;

  const isAdmin = role === "admin";

  const isCashier = role === "cashier";

  const [metrics, setMetrics] = useState<ProductMetrics | null>(null);

  const [salesSummary, setSalesSummary] = useState<SalesSummary | null>(null);

  const [chartData, setChartData] = useState<RevenueChartItem[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<any>(null);

  // ───────────────── STOCK ALERTS ─────────────────

  const stockAlerts: StockAlertItem[] =
    (metrics as any)?.low_stock_products ?? [];

  // ───────────────── FETCH DATA ─────────────────

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);

      setError(null);

      const requests = [salesApi.getSalesSummary()];

      if (isAdmin) {
        requests.push(productApi.getSummary());
        requests.push(salesApi.getRevenueChart());
      }

      const responses = await Promise.all(requests);

      const salesSummaryResponse = responses[0];

      setSalesSummary(salesSummaryResponse as SalesSummary);

      if (isAdmin) {
        const productSummary = responses[1];

        const revenueChartResponse = responses[2];

        setMetrics(productSummary as ProductMetrics);

        setChartData((revenueChartResponse as RevenueChartItem[]) || []);
      }
    } catch (err) {
      console.error("Failed to fetch dashboard data:", err);

      setError(err);
    } finally {
      setLoading(false);
    }
  }, [isAdmin]);

  // ───────────────── EFFECT ─────────────────

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData, metricsRefresh]);

  // ───────────────── ERROR UI ─────────────────

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

  // ───────────────── DERIVED VALUES ─────────────────

  const productCount = metrics?.product_count ?? 0;

  const totalStockValue = (metrics as any)?.total_stock_value ?? 0;

  const lowStockCount = (metrics as any)?.low_stock_count ?? 0;

  const outOfStockCount = (metrics as any)?.out_of_stock_count ?? 0;

  // ───────────────── SALES VALUES ─────────────────

  const todaysSales = salesSummary?.todaySales || 0;

  const todaysRevenue = salesSummary?.todayRevenue || 0;

  const weeklyRevenue = salesSummary?.weeklyRevenue || 0;

  const avgMargin = salesSummary?.avgProfitMargin || 0;

  const averageSaleValue = todaysSales > 0 ? todaysRevenue / todaysSales : 0;

  const dailyTarget = 20000;

  const progressPercentage = Math.min((todaysRevenue / dailyTarget) * 100, 100);

  // ───────────────── UI ─────────────────

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            {isAdmin ? "Business Dashboard" : `My Dashboard`}
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            {new Date().toLocaleDateString("en-KE", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span
            className={`px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
              isAdmin
                ? "bg-blue-100 text-blue-700"
                : "bg-purple-100 text-purple-700"
            }`}
          >
            {role}
          </span>

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
      </div>

      {/* CASHIER DASHBOARD */}

      {isCashier && (
        <>
          <div>
            <SectionHeader
              title="My Performance"
              subtitle="Your sales activity today"
            />

            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {loading ? (
                Array.from({ length: 4 }).map((_, index) => (
                  <SkeletonCard key={index} />
                ))
              ) : (
                <>
                  <MetricCard
                    title="My Sales"
                    value={todaysSales}
                    subtitle="Transactions completed"
                    icon={ShoppingCartIcon}
                    iconBg="bg-purple-50"
                    iconColor="text-purple-600"
                  />

                  <MetricCard
                    title="My Revenue"
                    value={fmtKES(todaysRevenue)}
                    subtitle="Revenue generated today"
                    icon={CurrencyDollarIcon}
                    iconBg="bg-green-50"
                    iconColor="text-green-600"
                  />

                  <MetricCard
                    title="Average Sale"
                    value={fmtKES(averageSaleValue)}
                    subtitle="Per transaction"
                    icon={ChartBarIcon}
                    iconBg="bg-blue-50"
                    iconColor="text-blue-600"
                  />

                  <MetricCard
                    title="Shift Status"
                    value="Active"
                    subtitle="You are currently online"
                    icon={ClockIcon}
                    iconBg="bg-emerald-50"
                    iconColor="text-emerald-600"
                  />
                </>
              )}
            </div>
          </div>

          {/* TARGET PROGRESS */}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-semibold text-gray-800">
                  Daily Target Progress
                </h2>

                <p className="text-sm text-gray-400 mt-1">
                  Track your sales target performance
                </p>
              </div>

              <FireIcon className="h-6 w-6 text-orange-500" />
            </div>

            <div className="mb-3 flex items-center justify-between text-sm">
              <span className="font-medium text-gray-700">
                {fmtKES(todaysRevenue)}
              </span>

              <span className="text-gray-500">
                Target: {fmtKES(dailyTarget)}
              </span>
            </div>

            <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-500 to-blue-600 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>

            <p className="mt-3 text-sm text-gray-500">
              {progressPercentage.toFixed(0)}% of target achieved today
            </p>
          </div>

          {/* CASHIER ACTIVITY */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">
                  Performance Insights
                </h2>

                <FireIcon className="h-5 w-5 text-orange-500" />
              </div>

              <div className="space-y-4">
                <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">
                  <p className="text-sm text-purple-700 font-medium">
                    Great work today 🚀
                  </p>

                  <p className="text-xs text-purple-600 mt-1">
                    You have completed {todaysSales} sales today.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-green-50 border border-green-100">
                  <p className="text-sm text-green-700 font-medium">
                    Revenue Generated
                  </p>

                  <p className="text-xs text-green-600 mt-1">
                    You have generated {fmtKES(todaysRevenue)} today.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">
                  <p className="text-sm text-blue-700 font-medium">
                    Average Transaction Value
                  </p>

                  <p className="text-xs text-blue-600 mt-1">
                    Average customer spends {fmtKES(averageSaleValue)}.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-semibold text-gray-800">
                  Shift Summary
                </h2>

                <ClockIcon className="h-5 w-5 text-indigo-500" />
              </div>

              <div className="space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Transactions</span>

                  <span className="font-semibold text-gray-800">
                    {todaysSales}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Revenue</span>

                  <span className="font-semibold text-gray-800">
                    {fmtKES(todaysRevenue)}
                  </span>
                </div>

                <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                  <span className="text-sm text-gray-500">Performance</span>

                  <span className="font-semibold text-green-600">
                    Excellent
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-500">Status</span>

                  <span className="px-2 py-1 rounded-full bg-green-100 text-green-700 text-xs font-medium">
                    ACTIVE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ADMIN DASHBOARD */}

      {isAdmin && (
        <>
          {/* SALES OVERVIEW */}

          <div>
            <SectionHeader
              title="Business Sales Overview"
              subtitle="Live business performance"
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

          {/* INVENTORY OVERVIEW */}

          <div>
            <SectionHeader
              title="Inventory Overview"
              subtitle="Live stock data"
            />

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
                          {status === "out_of_stock"
                            ? "Out"
                            : `${item.stock} left`}
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
                  Live
                </span>
              </div>

              <div className="h-72">
                {chartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full rounded-lg border-2 border-dashed border-gray-200 gap-3">
                    <ChartBarIcon className="h-10 w-10 text-gray-300" />

                    <p className="text-sm text-gray-400">
                      No sales data available
                    </p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" />

                      <XAxis
                        dataKey="date"
                        tickFormatter={(value) =>
                          new Date(value).toLocaleDateString("en-KE", {
                            day: "2-digit",
                            month: "short",
                          })
                        }
                        tick={{ fontSize: 12 }}
                      />

                      <YAxis
                        tickFormatter={(value) =>
                          `KES ${Number(value).toLocaleString()}`
                        }
                        tick={{ fontSize: 12 }}
                      />

                      <Tooltip
                        labelFormatter={(label) => {
                          return new Date(label).toLocaleDateString("en-KE", {
                            weekday: "short",
                            month: "short",
                            day: "numeric",
                          });
                        }}
                        formatter={(value) => [
                          `KES ${Number(value).toLocaleString()}`,
                          "Revenue",
                        ]}
                        contentStyle={{
                          borderRadius: "12px",
                          border: "1px solid #e5e7eb",
                          fontSize: "13px",
                        }}
                      />

                      <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#2563eb"
                        strokeWidth={3}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default Dashboard;
