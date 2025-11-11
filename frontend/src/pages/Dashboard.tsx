import React, { useState, useEffect, useCallback } from "react";
import { CubeIcon, CurrencyDollarIcon } from "@heroicons/react/24/outline";
import { MetricCard } from "../components/Dashboard/MetricCard";
import { ProductMetrics } from "../types";
import { productApi } from "../lib/api";
// 💡 Import the custom hook from the new context file
import { useMetricsRefresh } from "../contexts/MetricsRefreshContext"; // <-- Adjust the path!

// Note: The Dashboard component no longer needs to accept metricsRefresh or setMetricsRefresh as props.
export const Dashboard: React.FC = () => {
  // 💡 Retrieve the metricsRefresh value from context
  const { metricsRefresh } = useMetricsRefresh();

  const [metrics, setMetrics] = useState<ProductMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);

  // Memoized function to fetch the summary data
  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      const rawData = await productApi.getSummary();
      const data = rawData as ProductMetrics;
      setMetrics(data);
    } catch (err) {
      console.error("Failed to fetch product metrics:", err);
      setError(err);
    } finally {
      setLoading(false);
    }
  }, []);

  // 2. Fetch data on mount AND whenever metricsRefresh (from context) is incremented
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics, metricsRefresh]); // <-- Dependency on the context value

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return <div>Error loading metrics.</div>;
  }

  // Helper for KES formatting
  const formatKESValue = (value: number | undefined) => {
    // Default to 0 if value is undefined or null
    const rawValue = value || 0;

    // Use 'en-US' locale for comma-separated thousands and two decimal places
    const formatted = new Intl.NumberFormat("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(rawValue);

    return `KES ${formatted}`;
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-600">
          Welcome to your stock management dashboard
        </p>
      </div>

      {/* Metrics Cards */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        {/* Total Products (Count) */}
        <MetricCard
          title="Total Products"
          value={metrics?.product_count || 0}
          icon={CubeIcon}
          color="yellow"
        />

        {/* Total Stock Value */}
        <MetricCard
          title="Total Stock Value"
          // CORRECTED: Use the helper function with Intl.NumberFormat for thousands separator
          value={formatKESValue(metrics?.total_stock_value)}
          icon={CurrencyDollarIcon}
          color="green"
        />
      </div>

      {/* Charts and Alerts (commented out) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          {/* <RevenueChart data={revenueData} /> */}
        </div>
        <div>{/* <StockAlerts items={stockAlerts} /> */}</div>
      </div>
    </div>
  );
};
