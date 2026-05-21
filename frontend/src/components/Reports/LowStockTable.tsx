// LowStockTable.tsx
import { useState, useMemo } from "react";
import {
  AlertTriangle,
  AlertCircle,
  Clock,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";

// ── Polished mock data (wire to your API when ready) ──
const MOCK_LOW_STOCK = [
  {
    sku: "SKU-001234",
    name: "Wireless Bluetooth Headphones",
    category: "Electronics",
    onHand: 12,
    reorderPoint: 50,
    daysLeft: 3,
    supplier: "TechSupply KE",
    unitCost: 2_800,
  },
  {
    sku: "SKU-002891",
    name: "USB-C Charging Cable 6ft",
    category: "Electronics",
    onHand: 45,
    reorderPoint: 100,
    daysLeft: 5,
    supplier: "CableWorld Ltd",
    unitCost: 350,
  },
  {
    sku: "SKU-003456",
    name: "Portable Power Bank 20000mAh",
    category: "Electronics",
    onHand: 8,
    reorderPoint: 30,
    daysLeft: 2,
    supplier: "TechSupply KE",
    unitCost: 3_200,
  },
  {
    sku: "SKU-004123",
    name: "Smart Watch Band – Black",
    category: "Accessories",
    onHand: 23,
    reorderPoint: 40,
    daysLeft: 7,
    supplier: "WearFlex Inc",
    unitCost: 750,
  },
  {
    sku: "SKU-005789",
    name: "Laptop Stand Adjustable",
    category: "Office",
    onHand: 5,
    reorderPoint: 25,
    daysLeft: 1,
    supplier: "OfficeEssentials",
    unitCost: 1_850,
  },
  {
    sku: "SKU-006312",
    name: "Wireless Mouse Ergonomic",
    category: "Electronics",
    onHand: 19,
    reorderPoint: 35,
    daysLeft: 6,
    supplier: "TechSupply KE",
    unitCost: 1_200,
  },
  {
    sku: "SKU-007901",
    name: "A4 Printing Paper (Ream)",
    category: "Stationery",
    onHand: 30,
    reorderPoint: 200,
    daysLeft: 4,
    supplier: "PaperMart",
    unitCost: 450,
  },
];

type SortKey = "name" | "onHand" | "reorderPoint" | "daysLeft";
type SortDir = "asc" | "desc";

const getStatus = (daysLeft: number) =>
  daysLeft <= 2
    ? {
        label: "Critical",
        bg: "bg-red-100",
        text: "text-red-700",
        dot: "bg-red-500",
      }
    : daysLeft <= 5
      ? {
          label: "Warning",
          bg: "bg-amber-100",
          text: "text-amber-700",
          dot: "bg-amber-500",
        }
      : {
          label: "Low",
          bg: "bg-slate-100",
          text: "text-slate-600",
          dot: "bg-slate-400",
        };

const fmtKES = (n: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    maximumFractionDigits: 0,
  }).format(n);

export function LowStockTable() {
  const [search, setSearch] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("daysLeft");
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return [...MOCK_LOW_STOCK]
      .filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.sku.toLowerCase().includes(q) ||
          i.category.toLowerCase().includes(q),
      )
      .sort((a, b) => {
        const av = a[sortKey];
        const bv = b[sortKey];
        const cmp =
          typeof av === "string"
            ? av.localeCompare(bv as string)
            : (av as number) - (bv as number);
        return sortDir === "asc" ? cmp : -cmp;
      });
  }, [search, sortKey, sortDir]);

  const criticalCount = filtered.filter((i) => i.daysLeft <= 2).length;
  const warningCount = filtered.filter(
    (i) => i.daysLeft > 2 && i.daysLeft <= 5,
  ).length;

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? (
        <ArrowUp className="h-3 w-3 text-blue-600" />
      ) : (
        <ArrowDown className="h-3 w-3 text-blue-600" />
      )
    ) : (
      <ArrowUpDown className="h-3 w-3 text-gray-300" />
    );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
      {/* Header */}
      <div className="px-6 py-5 border-b border-gray-100">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-50">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <h3 className="text-base font-bold text-gray-900">
                Stock Alerts
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Items requiring attention
              </p>
            </div>
          </div>

          {/* Summary badges */}
          <div className="flex items-center gap-2">
            {criticalCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-red-100 text-red-700">
                <AlertCircle className="h-3 w-3" />
                {criticalCount} Critical
              </span>
            )}
            {warningCount > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-100 text-amber-700">
                <Clock className="h-3 w-3" />
                {warningCount} Warning
              </span>
            )}
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-300" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, SKU or category…"
            className="w-full pl-9 pr-4 py-2 text-sm rounded-lg border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder:text-gray-300"
          />
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto flex-1">
        <table className="w-full text-left text-sm border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                SKU
              </th>
              <th
                className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 cursor-pointer select-none"
                onClick={() => toggleSort("name")}
              >
                <div className="flex items-center gap-1">
                  Product <SortIcon col="name" />
                </div>
              </th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Category
              </th>
              <th
                className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 cursor-pointer select-none text-right"
                onClick={() => toggleSort("onHand")}
              >
                <div className="flex items-center justify-end gap-1">
                  On Hand <SortIcon col="onHand" />
                </div>
              </th>
              <th
                className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 cursor-pointer select-none text-right"
                onClick={() => toggleSort("reorderPoint")}
              >
                <div className="flex items-center justify-end gap-1">
                  Reorder <SortIcon col="reorderPoint" />
                </div>
              </th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">
                Unit Cost
              </th>
              <th
                className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400 cursor-pointer select-none text-right"
                onClick={() => toggleSort("daysLeft")}
              >
                <div className="flex items-center justify-end gap-1">
                  Days Left <SortIcon col="daysLeft" />
                </div>
              </th>
              <th className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                Status
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {filtered.length === 0 ? (
              <tr>
                <td
                  colSpan={8}
                  className="py-12 text-center text-sm text-gray-400"
                >
                  No items match your search.
                </td>
              </tr>
            ) : (
              filtered.map((item) => {
                const s = getStatus(item.daysLeft);
                const pct = Math.round((item.onHand / item.reorderPoint) * 100);

                return (
                  <tr
                    key={item.sku}
                    className="hover:bg-gray-50/60 transition-colors"
                  >
                    {/* SKU */}
                    <td className="px-5 py-4">
                      <span className="font-mono text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded">
                        {item.sku}
                      </span>
                    </td>

                    {/* Product + supplier */}
                    <td className="px-5 py-4 max-w-[200px]">
                      <p className="font-semibold text-gray-900 text-sm truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {item.supplier}
                      </p>
                    </td>

                    {/* Category */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                        {item.category}
                      </span>
                    </td>

                    {/* On Hand + progress bar */}
                    <td className="px-5 py-4 text-right">
                      <p className="font-bold text-gray-900">{item.onHand}</p>
                      <div className="mt-1 h-1.5 w-16 ml-auto rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            pct <= 20
                              ? "bg-red-400"
                              : pct <= 50
                                ? "bg-amber-400"
                                : "bg-emerald-400"
                          }`}
                          style={{ width: `${Math.min(pct, 100)}%` }}
                        />
                      </div>
                    </td>

                    {/* Reorder */}
                    <td className="px-5 py-4 text-right text-gray-400 text-sm">
                      {item.reorderPoint}
                    </td>

                    {/* Unit Cost */}
                    <td className="px-5 py-4 text-right text-sm text-gray-600 font-medium">
                      {fmtKES(item.unitCost)}
                    </td>

                    {/* Days Left */}
                    <td className="px-5 py-4 text-right">
                      <span
                        className={`font-extrabold text-sm ${
                          item.daysLeft <= 2
                            ? "text-red-500"
                            : item.daysLeft <= 5
                              ? "text-amber-500"
                              : "text-gray-500"
                        }`}
                      >
                        {item.daysLeft}d
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold ${s.bg} ${s.text}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
                        {s.label}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Footer */}
      <div className="px-6 py-3 border-t border-gray-100 flex items-center justify-between text-xs text-gray-400">
        <span>
          Showing{" "}
          <span className="font-semibold text-gray-600">{filtered.length}</span>{" "}
          of {MOCK_LOW_STOCK.length} alerts
        </span>
        <span className="text-[10px] uppercase tracking-widest text-gray-300">
          Mock Data · Wire to API
        </span>
      </div>
    </div>
  );
}
