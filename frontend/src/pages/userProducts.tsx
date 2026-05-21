// StoreCatalog.tsx
import { useState, useEffect, useMemo } from "react";
import { productApi } from "../lib/api";
import {
  Search,
  X,
  Package,
  AlertTriangle,
  RefreshCw,
  LayoutGrid,
  List,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  CheckCircle2,
  XCircle,
  TrendingDown,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────────────────

export interface Product {
  id: string | number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string;
  min_stock?: number;
}

type SortKey = "name" | "price" | "stock";
type SortDir = "asc" | "desc";
type StockFilter = "all" | "in_stock" | "low_stock" | "out_of_stock";
type ViewMode = "grid" | "list";

const PAGE_SIZE_OPTIONS = [8, 12, 24, 48];

// ── Helpers ────────────────────────────────────────────────────────────────

const fmtKES = (n: number) =>
  new Intl.NumberFormat("en-KE", {
    style: "currency",
    currency: "KES",
    minimumFractionDigits: 2,
  }).format(n || 0);

const getStockStatus = (stock: number, min = 5) => {
  if (stock <= 0)
    return {
      label: "Out of Stock",
      short: "Out",
      color: "text-red-600",
      bg: "bg-red-50",
      ring: "ring-red-200",
      dot: "bg-red-500",
      bar: "bg-red-400",
      icon: XCircle,
    };
  if (stock <= min)
    return {
      label: "Low Stock",
      short: `${stock} left`,
      color: "text-amber-600",
      bg: "bg-amber-50",
      ring: "ring-amber-200",
      dot: "bg-amber-400",
      bar: "bg-amber-400",
      icon: TrendingDown,
    };
  return {
    label: "In Stock",
    short: `${stock} units`,
    color: "text-emerald-600",
    bg: "bg-emerald-50",
    ring: "ring-emerald-200",
    dot: "bg-emerald-500",
    bar: "bg-emerald-400",
    icon: CheckCircle2,
  };
};

// ── Skeleton ───────────────────────────────────────────────────────────────

const GridSkeleton = () => (
  <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 animate-pulse">
    <div className="h-3 bg-gray-200 rounded w-1/3 mb-3" />
    <div className="h-5 bg-gray-200 rounded w-2/3 mb-4" />
    <div className="h-8 bg-gray-100 rounded w-1/2 mb-4" />
    <div className="h-2 bg-gray-100 rounded w-full mb-1.5" />
    <div className="h-2 bg-gray-100 rounded w-4/5 mb-4" />
    <div className="h-7 bg-gray-100 rounded-full w-1/3" />
  </div>
);

const ListSkeleton = () => (
  <div className="bg-white rounded-xl border border-gray-100 px-5 py-4 flex items-center gap-4 animate-pulse">
    <div className="w-10 h-10 rounded-xl bg-gray-200 flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-4 bg-gray-200 rounded w-1/3" />
      <div className="h-3 bg-gray-100 rounded w-1/2" />
    </div>
    <div className="h-5 bg-gray-200 rounded w-20" />
    <div className="h-6 bg-gray-100 rounded-full w-24" />
  </div>
);

// ── Product Card (Grid) ────────────────────────────────────────────────────

const ProductCard = ({ product }: { product: Product }) => {
  const status = getStockStatus(product.stock, product.min_stock);
  const StatusIcon = status.icon;
  const stockPct = Math.min(
    100,
    product.min_stock
      ? (product.stock / (product.min_stock * 4)) * 100
      : Math.min(product.stock * 5, 100),
  );

  return (
    <div
      className={`group relative bg-white rounded-2xl border shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 overflow-hidden flex flex-col ${
        product.stock <= 0 ? "border-red-100" : "border-gray-100"
      }`}
    >
      {/* Top accent bar */}
      <div className={`h-1 w-full ${status.bar}`} />

      <div className="p-5 flex flex-col flex-1">
        {/* Category pill */}
        {product.category && (
          <span className="inline-block self-start px-2 py-0.5 rounded-full bg-gray-100 text-[10px] font-semibold uppercase tracking-widest text-gray-400 mb-3">
            {product.category}
          </span>
        )}

        {/* Name */}
        <h3 className="text-sm font-bold text-gray-900 leading-snug mb-1 line-clamp-2 group-hover:text-blue-600 transition-colors">
          {product.name}
        </h3>

        {/* Description */}
        <p className="text-xs text-gray-400 line-clamp-2 flex-1 mb-4">
          {product.description || "No description available."}
        </p>

        {/* Price */}
        <p className="text-xl font-extrabold text-gray-900 tracking-tight mb-3">
          {fmtKES(product.price)}
        </p>

        {/* Stock bar */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
              Stock
            </span>
            <span className={`text-[10px] font-bold ${status.color}`}>
              {product.stock} units
            </span>
          </div>
          <div className="h-1.5 w-full rounded-full bg-gray-100 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all ${status.bar}`}
              style={{ width: `${stockPct}%` }}
            />
          </div>
        </div>

        {/* Status badge */}
        <span
          className={`inline-flex items-center gap-1.5 self-start px-2.5 py-1 rounded-full text-xs font-semibold ring-1 ${status.bg} ${status.color} ${status.ring}`}
        >
          <StatusIcon className="h-3 w-3" />
          {status.label}
        </span>
      </div>
    </div>
  );
};

// ── Product Row (List) ─────────────────────────────────────────────────────

const ProductRow = ({ product }: { product: Product }) => {
  const status = getStockStatus(product.stock, product.min_stock);
  const StatusIcon = status.icon;

  return (
    <div className="group bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all px-5 py-4 flex items-center gap-4">
      {/* Icon */}
      <div
        className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${status.bg}`}
      >
        <Package className={`h-5 w-5 ${status.color}`} />
      </div>

      {/* Name + description */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
          {product.name}
        </p>
        <p className="text-xs text-gray-400 truncate mt-0.5">
          {product.category && (
            <span className="font-semibold text-gray-500 mr-2">
              {product.category} ·
            </span>
          )}
          {product.description || "No description"}
        </p>
      </div>

      {/* Price */}
      <div className="text-right flex-shrink-0 hidden sm:block">
        <p className="text-sm font-extrabold text-gray-900 tabular-nums">
          {fmtKES(product.price)}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">Unit price</p>
      </div>

      {/* Stock count */}
      <div className="text-right flex-shrink-0 hidden md:block">
        <p className={`text-sm font-bold tabular-nums ${status.color}`}>
          {product.stock}
        </p>
        <p className="text-[10px] text-gray-400 mt-0.5">units</p>
      </div>

      {/* Status */}
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ring-1 flex-shrink-0 ${status.bg} ${status.color} ${status.ring}`}
      >
        <StatusIcon className="h-3 w-3" />
        {status.label}
      </span>
    </div>
  );
};

// ── Main Component ─────────────────────────────────────────────────────────

const StoreCatalog: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Controls
  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<StockFilter>("all");
  const [sortKey, setSortKey] = useState<SortKey>("name");
  const [sortDir, setSortDir] = useState<SortDir>("asc");
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // ── Fetch ──────────────────────────────────────────────────────────────

  const fetchProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = (await productApi.getAll()) as Product[];
      setProducts(data);
    } catch (err) {
      console.error("Failed to fetch products:", err);
      setError("Failed to load products. Check your connection and retry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // ── Sort toggle ────────────────────────────────────────────────────────

  const toggleSort = (key: SortKey) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortKey(key);
      setSortDir("asc");
    }
  };

  // ── Derived data ───────────────────────────────────────────────────────

  const processed = useMemo(() => {
    let data = [...products];

    // Search
    if (search.trim()) {
      const q = search.toLowerCase();
      data = data.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q) ||
          p.category?.toLowerCase().includes(q),
      );
    }

    // Stock filter
    if (stockFilter !== "all") {
      data = data.filter((p) => {
        const min = p.min_stock ?? 5;
        if (stockFilter === "out_of_stock") return p.stock <= 0;
        if (stockFilter === "low_stock") return p.stock > 0 && p.stock <= min;
        if (stockFilter === "in_stock") return p.stock > min;
        return true;
      });
    }

    // Sort
    data.sort((a, b) => {
      const av = a[sortKey];
      const bv = b[sortKey];
      const cmp =
        typeof av === "string"
          ? av.localeCompare(bv as string)
          : (av as number) - (bv as number);
      return sortDir === "asc" ? cmp : -cmp;
    });

    return data;
  }, [products, search, stockFilter, sortKey, sortDir]);

  // Summary counts
  const counts = useMemo(() => {
    const inStock = products.filter((p) => p.stock > (p.min_stock ?? 5)).length;
    const low = products.filter(
      (p) => p.stock > 0 && p.stock <= (p.min_stock ?? 5),
    ).length;
    const out = products.filter((p) => p.stock <= 0).length;
    return { inStock, low, out, total: products.length };
  }, [products]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(processed.length / pageSize));
  const paginated = processed.slice((page - 1) * pageSize, page * pageSize);

  const activeFilters = [
    search,
    stockFilter !== "all" ? stockFilter : "",
  ].filter(Boolean).length;

  const SortIcon = ({ col }: { col: SortKey }) =>
    sortKey === col ? (
      sortDir === "asc" ? (
        <ArrowUp className="h-3.5 w-3.5 text-blue-600" />
      ) : (
        <ArrowDown className="h-3.5 w-3.5 text-blue-600" />
      )
    ) : (
      <ArrowUpDown className="h-3.5 w-3.5 text-gray-300" />
    );

  // ── Error ──────────────────────────────────────────────────────────────

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <div className="p-3 rounded-full bg-red-50">
          <AlertTriangle className="h-8 w-8 text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-sm font-semibold text-gray-700">
            Failed to load catalog
          </p>
          <p className="text-xs text-gray-400 mt-1">{error}</p>
        </div>
        <button
          onClick={fetchProducts}
          className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 transition"
        >
          <RefreshCw className="h-4 w-4" />
          Retry
        </button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────

  return (
    <div className="space-y-6">
      {/* ── HEADER ──────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 tracking-tight">
            Inventory Lookup
          </h1>
          <p className="mt-1 text-sm text-gray-400">
            Browse and search the full product catalog
          </p>
        </div>
        <button
          onClick={fetchProducts}
          disabled={loading}
          className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition disabled:opacity-40"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </button>
      </div>

      {/* ── SUMMARY STRIP ───────────────────────────────────────────────── */}
      {!loading && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              label: "Total SKUs",
              value: counts.total,
              color: "bg-blue-600",
              filter: "all" as StockFilter,
            },
            {
              label: "In Stock",
              value: counts.inStock,
              color: "bg-emerald-500",
              filter: "in_stock" as StockFilter,
            },
            {
              label: "Low Stock",
              value: counts.low,
              color: "bg-amber-400",
              filter: "low_stock" as StockFilter,
            },
            {
              label: "Out of Stock",
              value: counts.out,
              color: "bg-red-500",
              filter: "out_of_stock" as StockFilter,
            },
          ].map((s) => (
            <button
              key={s.label}
              onClick={() => {
                setStockFilter(stockFilter === s.filter ? "all" : s.filter);
                setPage(1);
              }}
              className={`text-left bg-white rounded-xl border shadow-sm px-4 py-3 transition hover:shadow-md hover:-translate-y-0.5 ${
                stockFilter === s.filter
                  ? "border-blue-300 ring-2 ring-blue-100"
                  : "border-gray-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className={`w-2 h-2 rounded-full ${s.color}`} />
                <span className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                  {s.label}
                </span>
              </div>
              <p className="text-2xl font-extrabold text-gray-900">{s.value}</p>
            </button>
          ))}
        </div>
      )}

      {/* ── CONTROLS ────────────────────────────────────────────────────── */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-4 space-y-3">
        {/* Row 1: search + view toggle */}
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
              placeholder="Search products, categories, descriptions…"
              className="w-full pl-9 pr-9 py-2 rounded-lg border border-gray-200 bg-gray-50 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition placeholder:text-gray-300"
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

          {/* Sort controls */}
          <div className="flex items-center gap-1 rounded-lg border border-gray-200 overflow-hidden text-xs font-semibold">
            {(["name", "price", "stock"] as SortKey[]).map((k) => (
              <button
                key={k}
                onClick={() => toggleSort(k)}
                className={`flex items-center gap-1 px-3 py-2 capitalize transition ${
                  sortKey === k
                    ? "bg-gray-900 text-white"
                    : "text-gray-500 hover:bg-gray-50"
                }`}
              >
                {k}
                <SortIcon col={k} />
              </button>
            ))}
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
              <span className="w-4 h-4 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center">
                {activeFilters}
              </span>
            )}
          </button>

          {/* View toggle */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setViewMode("grid")}
              className={`p-2 transition ${viewMode === "grid" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode("list")}
              className={`p-2 transition ${viewMode === "list" ? "bg-gray-900 text-white" : "text-gray-400 hover:bg-gray-50"}`}
            >
              <List className="h-4 w-4" />
            </button>
          </div>

          {/* Per-page */}
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(1);
            }}
            className="text-xs border border-gray-200 rounded-lg px-2 py-2 text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {PAGE_SIZE_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n} per page
              </option>
            ))}
          </select>
        </div>

        {/* Row 2: advanced stock filter (expandable) */}
        {filtersOpen && (
          <div className="pt-3 border-t border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-widest text-gray-400 mb-2">
              Stock Status
            </p>
            <div className="flex gap-2 flex-wrap">
              {(
                [
                  { value: "all", label: "All" },
                  { value: "in_stock", label: "In Stock" },
                  { value: "low_stock", label: "Low Stock" },
                  { value: "out_of_stock", label: "Out of Stock" },
                ] as { value: StockFilter; label: string }[]
              ).map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => {
                    setStockFilter(opt.value);
                    setPage(1);
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold transition ${
                    stockFilter === opt.value
                      ? "bg-gray-900 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ── RESULTS HEADER ──────────────────────────────────────────────── */}
      <div className="flex items-center justify-between text-xs text-gray-400">
        <span>
          Showing{" "}
          <span className="font-semibold text-gray-700">
            {Math.min((page - 1) * pageSize + 1, processed.length)}–
            {Math.min(page * pageSize, processed.length)}
          </span>{" "}
          of{" "}
          <span className="font-semibold text-gray-700">
            {processed.length}
          </span>{" "}
          products
          {search && <span className="ml-1 text-blue-500">for "{search}"</span>}
        </span>
        {activeFilters > 0 && (
          <button
            onClick={() => {
              setSearch("");
              setStockFilter("all");
            }}
            className="text-xs text-blue-500 hover:underline"
          >
            Clear all filters
          </button>
        )}
      </div>

      {/* ── PRODUCT GRID / LIST ──────────────────────────────────────────── */}
      {loading ? (
        viewMode === "grid" ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: pageSize }).map((_, i) => (
              <GridSkeleton key={i} />
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {Array.from({ length: 8 }).map((_, i) => (
              <ListSkeleton key={i} />
            ))}
          </div>
        )
      ) : paginated.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 gap-4">
          <div className="p-4 rounded-2xl bg-gray-50">
            <Package className="h-10 w-10 text-gray-300" />
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-600">
              No products found
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Try adjusting your search or filters
            </p>
          </div>
          {activeFilters > 0 && (
            <button
              onClick={() => {
                setSearch("");
                setStockFilter("all");
              }}
              className="text-xs text-blue-500 hover:underline"
            >
              Clear all filters
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {paginated.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {/* List header */}
          <div className="hidden md:grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-2">
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Product
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">
              Price
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 text-right">
              Stock
            </span>
            <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400">
              Status
            </span>
          </div>
          {paginated.map((product) => (
            <ProductRow key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* ── PAGINATION ───────────────────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition"
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
            className="px-2.5 py-1.5 rounded-lg text-xs text-gray-500 hover:bg-gray-100 disabled:opacity-30 transition"
          >
            Last
          </button>
        </div>
      )}
    </div>
  );
};

export default StoreCatalog;
