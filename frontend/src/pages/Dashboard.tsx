import React, { useState, useEffect } from "react";
import {
  CurrencyDollarIcon,
  ShoppingCartIcon,
  CubeIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";
import { MetricCard } from "../components/Dashboard/MetricCard";
import { RevenueChart } from "../components/Dashboard/RevenueChart";
import { StockAlerts } from "../components/Dashboard/StockAlerts";
import { DashboardMetrics, StockItem } from "../types";
import { salesApi, stockApi } from "../lib/api";

export const Dashboard: React.FC = () => {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [stockAlerts, setStockAlerts] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);

        // In a real app, these would be parallel API calls
        const [metricsResponse, chartResponse, alertsResponse] =
          await Promise.all([
            salesApi.getDashboardMetrics().catch(() => ({
              todayRevenue: 2450.5,
              todaySales: 32,
              monthRevenue: 48250.75,
              monthSales: 847,
              inventoryValue: 125000,
              lowStockAlerts: 8,
              revenueGrowth: 12.5,
              salesGrowth: 8.2,
            })),
            salesApi.getRevenueChart("30d").catch(() =>
              Array.from({ length: 30 }, (_, i) => ({
                date: new Date(
                  Date.now() - (29 - i) * 24 * 60 * 60 * 1000
                ).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                }),
                revenue: Math.floor(Math.random() * 3000) + 1000,
                sales: Math.floor(Math.random() * 50) + 10,
              }))
            ),
            stockApi.getLowStockAlerts().catch(() => [
              {
                id: "1",
                productName: "Wireless Headphones",
                currentStock: 5,
                minStockLevel: 10,
                maxStockLevel: 50,
                unitPrice: 99.99,
                category: "Electronics",
                supplier: "TechCorp",
                lastRestocked: "2024-01-15",
                status: "low_stock" as const,
              },
              {
                id: "2",
                productName: "Coffee Beans Premium",
                currentStock: 0,
                minStockLevel: 20,
                maxStockLevel: 100,
                unitPrice: 24.99,
                category: "Food & Beverage",
                supplier: "CoffeeWorld",
                lastRestocked: "2024-01-10",
                status: "out_of_stock" as const,
              },
            ]),
          ]);

        setMetrics(metricsResponse as any);
        setRevenueData(chartResponse as any);
        setStockAlerts(alertsResponse as any);
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your POS management dashboard
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <MetricCard
          title="Today's Revenue"
          value={metrics?.todayRevenue || 0}
          change={metrics?.revenueGrowth}
          icon={CurrencyDollarIcon}
          color="green"
        />
        <MetricCard
          title="Today's Sales"
          value={metrics?.todaySales || 0}
          change={metrics?.salesGrowth}
          icon={ShoppingCartIcon}
          color="blue"
        />
        <MetricCard
          title="Inventory Value"
          value={metrics?.inventoryValue || 0}
          icon={CubeIcon}
          color="yellow"
        />
        <MetricCard
          title="Stock Alerts"
          value={metrics?.lowStockAlerts || 0}
          icon={ExclamationTriangleIcon}
          color="red"
        />
      </div>

      {/* Charts and Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <RevenueChart data={revenueData} />
        </div>
        <div>
          <StockAlerts items={stockAlerts} />
        </div>
      </div>
    </div>
  );
};
