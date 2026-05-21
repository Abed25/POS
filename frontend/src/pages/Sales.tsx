// Sales.tsx
import { useState, useEffect, useMemo, useCallback } from "react";
import { salesApi } from "../lib/api";
import { format } from "date-fns";
import { Sale } from "../types";
import AddSaleModal from "../components/Sales/AddSaleModal";
import { useAuth } from "../contexts/AuthContext";
import {
  Search,
  SlidersHorizontal,
  Download,
  RefreshCw,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ShoppingCart,
  TrendingUp,
  Receipt,
  CheckCircle2,
  Clock,
  XCircle,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

type SortKey = keyof Pick<
  Sale,
  | "product_name"
  | "quantity"
  | "selling_price"
  | "total_price"
  | "seller"
  | "sale_date"
  | "status"
>;
type SortDir = "asc" | "desc";
type StatusFilter = "" | "completed" | "pending" | "refunded";

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

// ── Helpers ────────────────────────────────────────────────────────────────

const fmtKES = (n: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(n || 0);

const STATUS_CONFIG = {
  completed: {
    label: "Completed",
    icon: CheckCircle2,
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    dot: "bg-emerald-500",
    ringColor: "ring-emerald-200",
  },
  pending: {
    label: "Pending",
    icon: Clock,
    bg: "bg-amber-50",
    text: "text-amber-700",
    dot: "bg-amber-400",
    ringColor: "ring-amber-200",
  },
  refunded: {
    label: "Refunded",
    icon: XCircle,
    bg: "bg-red-50",
    text: "text-red-700",
    dot: "bg-red-400",
    ringColor: "ring-red-200",
  },
};

// ── Sub-components ─────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: Sale["status"] }) => {
  const s = STATUS_CONFIG[status || "completed"] ?? STATUS_CONFIG.completed;
  const Icon = s.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${s.bg} ${s.text} ${s.ringColor}`}
    >
      <Icon className="h-3.5 w-3.5" />
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />
      {s.label}
    </span>
  );
};

const SortBtn = ({
  col,
  active,
  dir,
  onClick,
}: {
  col: SortKey;
  active: boolean;
  dir: SortDir;
  onClick: () => void;
}) => (
  <button
    onClick={onClick}
    title={`Sort by ${col}`}
    className="inline-flex items-center gap-0.5 hover:text-gray-900 transition-colors"
  >
    {active ? (
      dir === "asc" ? (
        <ArrowUp className="h-3 w-3 text-blue-600" />
      ) : (
        <ArrowDown className="h-3 w-3 text-blue-600" />
      )
    ) : (
      <ArrowUpDown className="h-3 w-3 text-gray-300" />
    )}
  </button>
);

const SkeletonRow = () => (
  <tr className="animate-pulse">
    {Array.from({ length: 7 }).map((_, i) => (
      <td key={i} className="px-5 py-4">
        <div className="h-4 bg-gray-100 rounded w-3/4" />
      </td>
    ))}
  </tr>
);

const SummaryCard = ({
  label,
  value,
  icon: Icon,
  color,
  sub,
}: {
  label: string;
  value: string;
  icon: React.ElementType;
  color: string;
  sub?: string;
}) => (
  <div className="bg-white rounded-xl border border-gray-100 shadow-sm px-5 py-4 flex items-center gap-4">
    <div className={`p-2.5 rounded-xl ${color}`}>
      <Icon className="h-5 w-5 text-white" />
    </div>
    <div className="min-w-0">
      <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
        {label}
      </p>
      <p className="text-xl font-extrabold text-gray-900 truncate">{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  </div>
);

// ── Main Component ─────────────────────────────────────────────────────────

export const Sales = () => {
  const { user } = useAuth();

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Filters
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [status, setStatus] = useState<StatusFilter>("");
  const [search, setSearch] = useState("");

  // Table controls
  const [sortKey, setSortKey] = useState<SortKey>("sale_date");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);

  // ── Fetch ────────────────────────────────────────────────────────────────

  const fetchSales = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const res = await salesApi.list(from || undefined, to || undefined);
      setSales(res as Sale[]);
      setPage(1);
    } catch (err) {
      console.error("Failed to fetch sales:", err);
      setSales([]);
    } finally {
      setLoading(false);
    }
  }, [user, from, to]);

  useEffect(() => {
    fetchSales();
  }, [fetchSales]);

  // ── Derived data ─────────────────────────────────────────────────────────

  const processed = useMemo(() => {
    let data = [...sales];

    // Status filter
    if (status) data = data.filter((s) => s.status === status);

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (s) =>
          s.product_name?.toLowerCase().includes(q) ||
          s.seller?.toLowerCase().includes(q),
      );
    }

    // Sort
    data.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "string"
          ? (av ?? "").localeCompare((bv as string) ?? "")
          : Number(av ?? 0) - Number(bv ?? 0);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [sales, status, search, sortKey, sortDir]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

  // Summary stats
  const totalRevenue = processed.reduce(
    (s, r) => s + Number(r.total_price || 0),
    0,
  );
  const completedCount = processed.filter(
    (s) => s.status === "completed" || !s.status,
  ).length;
  const avgOrder = processed.length > 0 ? totalRevenue / processed.length : 0;

  // ── Sort toggle ───────────────────────────────────────────────────────────

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // ── Export CSV ────────────────────────────────────────────────────────────

  const exportCSV = () => {
    const headers = [
      "Product",
      "Qty",
      "Selling Price",
      "Total",
      "Seller",
      "Date",
      "Status",
    ];
    const rows = processed.map((s) => [
      s.product_name,
      s.quantity,
      Number(s.selling_price || 0).toFixed(2),
      Number(s.total_price || 0).toFixed(2),
      s.seller,
      format(new Date(s.sale_date), "yyyy-MM-dd HH:mm"),
      s.status || "completed",
    ]);
    const csv = [headers, ...rows].map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `sales_${from || "all"}_to_${to || "today"}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // ── Guard ─────────────────────────────────────────────────────────────────

  const canAddSale = user && (user.role === "admin" || user.role === "cashier");

  if (!user && !loading) {
    return (
      <div className="flex items-center justify-center h-64 text-red-500 text-sm font-medium">
        Access Denied. Please log in.
      </div>
    );
  }

  // Active filter count
  const activeFilters = [from, to, status].filter(Boolean).length;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── PAGE HEADER ─────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Sales
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            {new Date().toLocaleDateString("en-KE", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={exportCSV}
            disabled={processed.length === 0}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>

          <button
            onClick={fetchSales}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>

          {canAddSale && <AddSaleModal onAdded={fetchSales} />}
        </div>
      </div>

      {/* ── SUMMARY CARDS ───────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard
          label="Total Sales"
          value={processed.length.toLocaleString()}
          icon={ShoppingCart}
          color="bg-blue-600"
          sub={`${completedCount} completed`}
        />
        <SummaryCard
          label="Total Revenue"
          value={fmtKES(totalRevenue)}
          icon={TrendingUp}
          color="bg-emerald-500"
          sub="Filtered period"
        />
        <SummaryCard
          label="Avg. Order Value"
          value={fmtKES(avgOrder)}
          icon={Receipt}
          color="bg-violet-500"
          sub="Per transaction"
        />
        <SummaryCard
          label="Completed"
          value={`${processed.length > 0 ? Math.round((completedCount / processed.length) * 100) : 0}%`}
          icon={CheckCircle2}
          color="bg-teal-500"
          sub={`${completedCount} of ${processed.length}`}
        />
      </div>

      {/* ── SEARCH + FILTER BAR ─────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-300" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search product or seller…"
              className="w-full pl-9 pr-4 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder:text-gray-300"
            />
            {search && (
              <button
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Status quick filter */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
            {(["", "completed", "pending", "refunded"] as StatusFilter[]).map(
              (s) => (
                <button
                  key={s}
                  onClick={() => {
                    setStatus(s);
                    setPage(1);
                  }}
                  className={`px-3 py-2 capitalize transition ${
                    status === s
                      ? "bg-gray-900 text-white"
                      : "text-gray-500 hover:bg-gray-50"
                  }`}
                >
                  {s === "" ? "All" : s}
                </button>
              ),
            )}
          </div>

          {/* Advanced filters toggle */}
          <button
            onClick={() => setFiltersOpen((o) => !o)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-lg border text-sm font-medium transition ${
              filtersOpen || activeFilters > 0
                ? "border-blue-300 bg-blue-50 text-blue-700"
                : "border-gray-200 text-gray-600 hover:bg-gray-50"
            }`}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
            {activeFilters > 0 && (
              <span className="ml-0.5 w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>
        </div>

        {/* Expanded date filters */}
        {filtersOpen && (
          <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                From Date
              </label>
              <input
                type="date"
                value={from}
                onChange={(e) => setFrom(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wide">
                To Date
              </label>
              <input
                type="date"
                value={to}
                onChange={(e) => setTo(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
              />
            </div>
            <div className="flex items-end gap-2">
              <button
                onClick={fetchSales}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
              >
                Apply
              </button>
              <button
                onClick={() => {
                  setFrom("");
                  setTo("");
                  setStatus("");
                  setSearch("");
                  fetchSales();
                }}
                className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-500 hover:bg-gray-50 transition"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── TABLE ───────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
        {/* Table header controls */}
        <div className="px-5 py-3 border-b border-gray-100 flex items-center justify-between gap-3 flex-wrap">
          <p className="text-xs text-gray-400">
            Showing{" "}
            <span className="font-semibold text-gray-700">
              {Math.min((page - 1) * pageSize + 1, processed.length)}–
              {Math.min(page * pageSize, processed.length)}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-gray-700">
              {processed.length}
            </span>{" "}
            transactions
          </p>

          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-400">Rows:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="text-xs border border-gray-200 rounded-lg px-2 py-1.5 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {PAGE_SIZE_OPTIONS.map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {(
                  [
                    { label: "Product", key: "product_name" },
                    { label: "Qty", key: "quantity" },
                    { label: "Unit Price", key: "selling_price" },
                    { label: "Total", key: "total_price" },
                    { label: "Seller", key: "seller" },
                    { label: "Date", key: "sale_date" },
                    { label: "Status", key: "status" },
                  ] as { label: string; key: SortKey }[]
                ).map(({ label, key }) => (
                  <th
                    key={key}
                    className="px-5 py-3 text-[10px] font-bold uppercase tracking-widest text-gray-400"
                  >
                    <div className="flex items-center gap-1">
                      {label}
                      <SortBtn
                        col={key}
                        active={sortKey === key}
                        dir={sortDir}
                        onClick={() => toggleSort(key)}
                      />
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                Array.from({ length: 6 }).map((_, i) => <SkeletonRow key={i} />)
              ) : paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center">
                    <div className="flex flex-col items-center gap-3 text-gray-300">
                      <ShoppingCart className="h-10 w-10" />
                      <p className="text-sm font-medium text-gray-400">
                        No sales found
                      </p>
                      {(search || status || from || to) && (
                        <button
                          onClick={() => {
                            setSearch("");
                            setStatus("");
                            setFrom("");
                            setTo("");
                          }}
                          className="text-xs text-blue-500 hover:underline"
                        >
                          Clear filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                paginated.map((sale) => {
                  const total = Number(sale.total_price || 0);
                  const unit = Number(sale.selling_price || 0);

                  return (
                    <tr
                      key={sale.id}
                      className="hover:bg-gray-50/70 transition-colors group"
                    >
                      {/* Product */}
                      <td className="px-5 py-4">
                        <p className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                          {sale.product_name}
                        </p>
                      </td>

                      {/* Qty */}
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-sm font-bold text-gray-700">
                          {sale.quantity}
                        </span>
                      </td>

                      {/* Unit price */}
                      <td className="px-5 py-4 text-gray-600 font-medium tabular-nums">
                        {fmtKES(unit)}
                      </td>

                      {/* Total */}
                      <td className="px-5 py-4">
                        <span className="font-extrabold text-gray-900 tabular-nums">
                          {fmtKES(total)}
                        </span>
                      </td>

                      {/* Seller */}
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full bg-blue-100 text-blue-700 text-xs font-bold flex items-center justify-center flex-shrink-0">
                            {(sale.seller || "?")[0].toUpperCase()}
                          </div>
                          <span className="text-gray-700 text-sm">
                            {sale.seller}
                          </span>
                        </div>
                      </td>

                      {/* Date */}
                      <td className="px-5 py-4 text-gray-500 text-xs whitespace-nowrap">
                        <div className="font-medium text-gray-700 text-sm">
                          {format(new Date(sale.sale_date), "MMM dd, yyyy")}
                        </div>
                        <div className="text-gray-400">
                          {format(new Date(sale.sale_date), "HH:mm")}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-5 py-4">
                        <StatusBadge status={sale.status} />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* ── PAGINATION ──────────────────────────────────────────────────── */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-gray-100 flex items-center justify-between gap-3 flex-wrap">
            <p className="text-xs text-gray-400">
              Page <span className="font-semibold text-gray-700">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-gray-700">{totalPages}</span>
            </p>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition"
              >
                First
              </button>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition"
              >
                <ChevronLeft className="h-4 w-4" />
              </button>

              {/* Page number pills */}
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                const start = Math.max(1, Math.min(page - 2, totalPages - 4));
                const p = start + i;
                return (
                  <button
                    key={p}
                    onClick={() => setPage(p)}
                    className={`w-8 h-8 rounded-lg text-xs font-semibold transition ${
                      p === page
                        ? "bg-blue-600 text-white shadow-sm"
                        : "text-gray-500 hover:bg-gray-100"
                    }`}
                  >
                    {p}
                  </button>
                );
              })}

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="p-1.5 rounded-lg text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition"
              >
                <ChevronRight className="h-4 w-4" />
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition"
              >
                Last
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sales;
