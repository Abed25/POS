//import { FilterBar } from "./FilterBar";
import { KPISection } from "./KPISection";
// import { RevenueChart } from "./RevenueChart";
// import { InventoryGauge } from "./InventoryGauge";
// import { ProductChart } from "./ProductChart";
// import { LowStockTable } from "./LowStockTable";
// import { TopProductsTable } from "./TopProductsTable";
// import { AuditLogTable } from "./AuditLogTable";
// import { BarChart3 } from "lucide-react";

export function ReportDashboard() {
  return (
    <div className="min-h-screen bg-background">
      {/* <header className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary rounded-lg">
                <BarChart3 className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Business Intelligence Dashboard</h1>
                <p className="text-sm text-muted-foreground">Real-time analytics and reporting</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <span className="w-2 h-2 rounded-full bg-success animate-pulse-subtle" />
              <span>Live Data</span>
              <span className="mx-2">•</span>
              <span>Last updated: 2 min ago</span>
            </div>
          </div>
        </div>
      </header> */}

      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* <FilterBar /> */}

        <KPISection />

        {/* <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <RevenueChart />
          </div>
          <div>
            <InventoryGauge />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ProductChart />
          <LowStockTable />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TopProductsTable />
          <AuditLogTable />
        </div> */}
      </main>

      <footer className="border-t border-border bg-card mt-8">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>© 2025 Business Intelligence Platform</span>
            <span>Data refreshes every 5 minutes</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
