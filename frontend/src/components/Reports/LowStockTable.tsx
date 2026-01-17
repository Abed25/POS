import { AlertTriangle, AlertCircle } from "lucide-react";
import { cn } from "../../lib/utils";

const lowStockItems = [
  {
    sku: "SKU-001234",
    product: "Wireless Bluetooth Headphones",
    onHand: 12,
    reorderPoint: 50,
    daysLeft: 3,
  },
  {
    sku: "SKU-002891",
    product: "USB-C Charging Cable 6ft",
    onHand: 45,
    reorderPoint: 100,
    daysLeft: 5,
  },
  {
    sku: "SKU-003456",
    product: "Portable Power Bank 20000mAh",
    onHand: 8,
    reorderPoint: 30,
    daysLeft: 2,
  },
  {
    sku: "SKU-004123",
    product: "Smart Watch Band - Black",
    onHand: 23,
    reorderPoint: 40,
    daysLeft: 7,
  },
  {
    sku: "SKU-005789",
    product: "Laptop Stand Adjustable",
    onHand: 5,
    reorderPoint: 25,
    daysLeft: 1,
  },
];

export function LowStockTable() {
  return (
    <div
      // REMOVED opacity-0. Kept animate-fade-in.
      className="bg-card rounded-lg border border-border shadow-sm overflow-hidden animate-fade-in w-full"
      style={{ animationDelay: "500ms" }}
    >
      <div className="px-6 py-4 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          {/* Changed text-warning to a standard Tailwind amber color for reliability */}
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h3 className="text-lg font-semibold text-foreground">
            Low Stock Alerts
          </h3>
        </div>
        <p className="text-sm text-muted-foreground mt-1">
          Items requiring immediate attention
        </p>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 font-medium text-muted-foreground">
                SKU
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Product
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                On Hand
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Reorder
              </th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground">
                Days Left
              </th>
              <th className="px-4 py-3 font-medium text-muted-foreground">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {lowStockItems.map((item) => (
              <tr
                key={item.sku}
                className="hover:bg-muted/20 transition-colors"
              >
                <td className="px-4 py-4 font-mono text-xs text-foreground">
                  {item.sku}
                </td>
                <td className="px-4 py-4 max-w-[180px] truncate font-medium text-foreground">
                  {item.product}
                </td>
                <td className="px-4 py-4 text-right text-foreground font-semibold">
                  {item.onHand}
                </td>
                <td className="px-4 py-4 text-right text-muted-foreground">
                  {item.reorderPoint}
                </td>
                <td className="px-4 py-4 text-right">
                  <span
                    className={cn(
                      "font-bold",
                      item.daysLeft <= 2
                        ? "text-red-500"
                        : item.daysLeft <= 5
                        ? "text-amber-500"
                        : "text-muted-foreground"
                    )}
                  >
                    {item.daysLeft}d
                  </span>
                </td>
                <td className="px-4 py-4">
                  {item.daysLeft <= 2 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-700">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Critical
                    </span>
                  ) : item.daysLeft <= 5 ? (
                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 text-amber-700">
                      Warning
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-600">
                      Low
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
