import React, { useState, useEffect, useRef } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { productApi } from "../lib/api";
import { Product } from "../types";
import AddProductModal from "../components/Inventory/AddProductModal";
import RestockProductModal from "../components/Inventory/RestockProductModal";
import EditProductModal from "../components/Inventory/EditProductModal";
import DeleteProductModal from "../components/Inventory/DeleteProductModal";
import { useSnackbar } from "notistack";
// 💡 1. IMPORT THE REFRESH CONTEXT HOOK
import { useMetricsRefresh } from "../contexts/MetricsRefreshContext"; // <-- Adjust path as needed

type FilterType = "all" | "low_stock" | "in_stock";

export const Inventory: React.FC = () => {
  const { enqueueSnackbar } = useSnackbar(); // 💡 2. CALL THE HOOK TO GET THE TRIGGER FUNCTION
  const { triggerRefresh } = useMetricsRefresh();

  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>("all");
  const [restockModalOpen, setRestockModalOpen] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState<"name_asc" | "stock_desc" | "stock_asc">(
    "name_asc"
  );
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null); // --- pagination / infinite scroll state (unchanged) ---

  const [page, setPage] = useState(1);
  const pageSize = 6;
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const [isFetchingMore, setIsFetchingMore] =
    useState(false); /** Fetch all products and normalize (unchanged) */

  const fetchInventory = async () => {
    setLoading(true);
    setFetchError(null);
    try {
      const raw = await productApi.getAll();
      let arr: any[] = [];
      if (Array.isArray(raw)) arr = raw;
      else if (raw && Array.isArray((raw as any).data)) arr = (raw as any).data;
      else if (raw && Array.isArray((raw as any).items))
        arr = (raw as any).items;

      const products: Product[] = arr.map((d: any) => {
        const id = Number(d.id ?? d.ID ?? d._id ?? 0);
        const price = Number(d.price ?? d.unitPrice ?? d.unit_price ?? 0);
        const cost_price = Number(d.cost_price ?? d.costPrice ?? 0);
        const stock = Number(d.stock ?? d.currentStock ?? d.current_stock ?? 0);
        const maxStockLevelRaw =
          d.maxStockLevel ?? d.max_stock ?? d.maxStock ?? undefined;
        const minStockRaw =
          d.min_stock ??
          d.minStock ??
          d.minimum_stock ??
          d.minimumStock ??
          undefined;
        return {
          id,
          name: d.name ?? d.productName ?? "",
          description: d.description ?? d.desc ?? undefined,
          price: Number.isFinite(price) ? price : 0,
          cost_price: Number.isFinite(cost_price) ? cost_price : 0,
          stock: Number.isFinite(stock) ? stock : 0,
          category: d.category ?? d.cat ?? null,
          created_at: d.created_at ?? d.createdAt ?? "",
          updated_at: d.updated_at ?? d.updatedAt ?? "",
          max_stock:
            maxStockLevelRaw !== undefined
              ? Number(maxStockLevelRaw)
              : undefined,

          min_stock:
            minStockRaw !== undefined && Number.isFinite(Number(minStockRaw))
              ? Number(minStockRaw)
              : undefined,

          supplier: d.supplier ?? null,
        } as Product;
      });

      setInventory(products);
    } catch (err: any) {
      console.error("Failed to fetch inventory:", err);
      const message =
        err?.message?.toString() ||
        "Unable to load products. Please check your network connection or try again.";
      setFetchError(message);
      enqueueSnackbar(message, { variant: "error" });
      setInventory([]);
    } finally {
      setLoading(false);
    }
  }; /** Helper to refresh inventory and optionally show success toast */

  const refreshAndNotify = async (message?: string) => {
    try {
      await fetchInventory();
      if (message) enqueueSnackbar(message, { variant: "success" }); // 💡 CRITICAL CHANGE: Trigger the dashboard metrics refresh

      triggerRefresh();
    } catch {
      // fetchInventory already handles errors/toasts
    }
  };

  useEffect(() => {
    fetchInventory(); // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // ... (rest of the component logic is unchanged)

  const getStatus = (stock: number, min_stock?: number) => {
    const min = Number.isFinite(min_stock) ? min_stock! : 5; // fallback to 5
    if (stock === 0) return "out_of_stock";
    if (stock <= min) return "low_stock";
    return "in_stock";
  };

  const getStatusBadge = (stock: number, min_stock?: number) => {
    const s = getStatus(stock, min_stock);
    if (s === "out_of_stock")
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    if (s === "low_stock")
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Low Stock
        </span>
      );
    return (
      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
        In Stock
      </span>
    );
  };

  const filteredInventory = inventory.filter((item) => {
    const status = getStatus(item.stock, item.min_stock);
    const matchesFilter =
      filter === "low_stock"
        ? status === "low_stock" || status === "out_of_stock"
        : filter === "in_stock"
        ? status === "in_stock"
        : true;

    const q = search.trim().toLowerCase();
    const matchesSearch =
      q.length === 0 ||
      item.name.toLowerCase().includes(q) ||
      (item.sku && item.sku.toLowerCase().includes(q));

    return matchesFilter && matchesSearch;
  });

  const sortedInventory = [...filteredInventory].sort((a, b) => {
    if (sortBy === "name_asc") {
      return a.name.localeCompare(b.name);
    }
    if (sortBy === "stock_desc") {
      return b.stock - a.stock;
    }
    if (sortBy === "stock_asc") {
      return a.stock - b.stock;
    }
    return 0;
  }); // reset page when filters/search/sort or inventory change

  useEffect(() => {
    setPage(1);
  }, [search, sortBy, filter, inventory.length]); // pagination slice + hasMore flag

  const paginatedInventory = sortedInventory.slice(0, page * pageSize);
  const hasMore = sortedInventory.length > paginatedInventory.length; // totals used for contextual empty states

  const totalProducts = inventory.length;
  const filteredCount = filteredInventory.length; // IntersectionObserver to load more when sentinel is visible

  useEffect(() => {
    const el = listEndRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !isFetchingMore && !loading) {
            setIsFetchingMore(true);
            setTimeout(() => {
              setPage((p) => p + 1);
              setIsFetchingMore(false);
            }, 250);
          }
        });
      },
      { root: null, rootMargin: "200px", threshold: 0.1 }
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
    }; // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isFetchingMore, loading, listEndRef.current]);

  return (
    <div>
            {/* Header + Input button */}   
      <div className="mb-6">
                {/* Top header section */}     
        <div className="mb-4">
                 
          <h1 className="text-2xl font-bold text-gray-900">Stock Management</h1>
                 
          <p className="mt-1 text-sm text-gray-600">
                        Monitor and manage your product inventory        
          </p>
               
        </div>
                {/* Controls section: search, sort, add product */}     
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-end w-full">
                 
          <div className="relative w-full sm:w-80">
                     
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                         
              <svg
                className="h-5 w-5 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                             
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M21 21l-4.35-4.35m0 0A7.5 7.5 0 104.5 4.5a7.5 7.5 0 0012.15 12.15z"
                />
                           
              </svg>
                       
            </span>
                     
            <input
              type="text"
              placeholder="Search products..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="block w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition text-gray-900 bg-white shadow-sm"
            />
                   
          </div>
                 
          <div className="w-full sm:w-auto">
                     
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
              className="block w-full sm:w-48 px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50 transition"
            >
                            <option value="name_asc">A-Z (Name)</option>       
                    <option value="stock_desc">Highest Stock First</option>     
                      <option value="stock_asc">Low Stock First</option>       
               
            </select>
                   
          </div>
                 
          <div className="w-full sm:w-auto">
                     
            {/* The onAdded prop calls refreshAndNotify, which now triggers context */}
                     
            <AddProductModal
              onAdded={() => refreshAndNotify("Product added")}
            />
                   
          </div>
               
        </div>
           
      </div>
            {/* Filter Tabs */}   
      <div className="mb-6">
        <nav className="flex space-x-8">
          {[
            { key: "all", label: "All Items" },
            { key: "low_stock", label: "Alerts" },
            { key: "in_stock", label: "In Stock" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as FilterType)}
              className={`whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab.label}
              {tab.key === "low_stock" && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                  {
                    inventory.filter((p) => {
                      const s = getStatus(p.stock, p.min_stock);
                      return s === "low_stock" || s === "out_of_stock";
                    }).length
                  }
                </span>
              )}
            </button>
          ))}
        </nav>
      </div>
      {/* Inventory Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {loading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="bg-white overflow-hidden shadow rounded-lg animate-pulse"
            >
              <div className="p-6">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-2 bg-gray-200 rounded w-full mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-1/3"></div>
              </div>
            </div>
          ))
        ) : fetchError ? (
          <div className="col-span-full">
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Unable to load products
              </h3>
              <p className="text-sm text-gray-600 mb-4">{fetchError}</p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => refreshAndNotify()}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  Retry
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="px-4 py-2 rounded border bg-white text-gray-700 hover:bg-gray-50 transition"
                >
                  Reload page
                </button>
              </div>
            </div>
          </div>
        ) : totalProducts === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No products yet
              </h3>
              <p className="text-sm text-gray-600 mb-6">
                Your inventory is empty. Start by adding your first product.
              </p>
              <div className="flex items-center justify-center gap-3">
                <AddProductModal
                  onAdded={() => refreshAndNotify("Product added")}
                />
                <button
                  onClick={() => refreshAndNotify()}
                  className="px-4 py-2 rounded border bg-white text-gray-700 hover:bg-gray-50 transition"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        ) : filteredCount === 0 ? (
          <div className="col-span-full">
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                No items match this view
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                {filter === "low_stock"
                  ? "No alerts right now — all products are sufficiently stocked."
                  : filter === "in_stock"
                  ? "No items currently in stock."
                  : "No products match your search or filters."}
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setFilter("all")}
                  className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                  View all products
                </button>
                <AddProductModal
                  onAdded={() => refreshAndNotify("Product added")}
                />
                <button
                  onClick={() => refreshAndNotify()}
                  className="px-4 py-2 rounded border bg-white text-gray-700 hover:bg-gray-50 transition"
                >
                  Refresh
                </button>
              </div>
            </div>
          </div>
        ) : (
          paginatedInventory.map((item) => {
            const status = getStatus(item.stock, item.min_stock);
            const max = item.max_stock ?? Math.max(20, item.stock);
            const pct = Math.min(
              100,
              Math.round((item.stock / Math.max(1, max)) * 100)
            );

            const alertClass =
              status === "out_of_stock"
                ? "border-l-4 border-red-600 bg-red-50"
                : status === "low_stock"
                ? "border-l-4 border-yellow-600 bg-yellow-50"
                : "border-l-4 border-green-600 bg-white";

            return (
              <div
                key={item.id}
                className={`overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow ${alertClass}`}
              >
                <div className="p-4 sm:p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-base font-semibold text-gray-900 truncate">
                        {item.name}
                      </h3>
                    </div>
                    {(status === "low_stock" || status === "out_of_stock") && (
                      <ExclamationTriangleIcon className="h-6 w-6 text-red-500 ml-3 flex-shrink-0" />
                    )}
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-gray-700">
                        Current Stock
                      </span>
                      <span className="text-lg font-bold">{item.stock}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1.5">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          status === "out_of_stock"
                            ? "bg-red-600"
                            : status === "low_stock"
                            ? "bg-yellow-500"
                            : "bg-green-600"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      {status === "out_of_stock"
                        ? "Action Required"
                        : `Target: ${max}`}
                    </p>
                  </div>
                  <div className="mt-4 space-y-2">
                                        {/* Unit Price */}                 
                    <div className="flex items-center justify-between text-sm">
                                         
                      <span className="text-gray-500">Price (KES)</span>       
                                 
                      <span className="font-semibold text-gray-900">
                                             
                        {item.price.toLocaleString("en-KE", {
                          style: "currency",
                          currency: "KES",
                          minimumFractionDigits: 2, // Show decimal places for price
                        })}
                                           
                      </span>
                                       
                    </div>
                                        {/* Category / Supplier */}             
                       
                    <div className="flex items-center justify-between text-xs">
                                         
                      <span className="text-gray-500">Category</span>           
                             
                      <span className="text-gray-700 font-medium">
                                                {item.category ?? "-"}         
                                 
                      </span>
                                       
                    </div>
                    <div className="flex items-center justify-between text-xs">
                                         
                      <span className="text-gray-500">Supplier</span>           
                             
                      <span className="text-gray-700 font-medium">
                                                {item.supplier ?? "-"}         
                                 
                      </span>
                                       
                    </div>
                      {/* Category / Supplier */}                 
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500">Profit margin</span>
                      <span
                        className={`font-medium ${
                          item.cost_price === 0
                            ? "text-gray-700"
                            : item.price - item.cost_price < 0
                            ? "text-red-500"
                            : "text-green-700"
                        }`}
                      >
                        {item.cost_price === 0
                          ? "-" // cost price missing → just "-"
                          : (() => {
                              const margin = item.price - item.cost_price;
                              const percentage = (
                                (margin / item.cost_price) *
                                100
                              ).toFixed(0);
                              const sign = margin < 0 ? "-" : "+";
                              return `${sign}${Math.abs(
                                margin
                              )} (${percentage}%)`;
                            })()}
                      </span>
                    </div>
                                   
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2 justify-between items-center border-t pt-4 border-gray-200">
                    {getStatusBadge(item.stock, item.min_stock)}

                    <div className="flex gap-2">
                      <button
                        className="px-3 py-1 rounded bg-blue-600 text-white text-xs font-medium hover:bg-blue-700 transition flex-grow"
                        onClick={() => {
                          setRestockProduct(item);
                          setRestockModalOpen(true);
                        }}
                      >
                        Restock
                      </button>
                      <button
                        onClick={() => {
                          setEditProduct(item);
                          setEditModalOpen(true);
                        }}
                        className="px-3 py-1 rounded border border-gray-300 bg-white text-gray-700 text-xs font-medium hover:bg-gray-50 transition"
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 rounded border border-red-600 text-red-600 text-xs font-medium hover:bg-red-50 transition"
                        onClick={() => {
                          setDeleteProduct(item);
                          setDeleteModalOpen(true);
                        }}
                      >
                        Del
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
        <div ref={listEndRef}></div>
      </div>
            {/* modals */}
         
      <RestockProductModal
        open={restockModalOpen}
        product={restockProduct}
        onClose={() => setRestockModalOpen(false)}
        onRestocked={() => refreshAndNotify("Stock updated")} // <-- Calls refreshAndNotify
      />
         
      <EditProductModal
        open={editModalOpen}
        product={editProduct}
        onClose={() => setEditModalOpen(false)}
        onEdited={() => refreshAndNotify("Product updated")} // <-- Calls refreshAndNotify
      />
         
      <DeleteProductModal
        open={deleteModalOpen}
        product={deleteProduct}
        onClose={() => {
          setDeleteModalOpen(false);
          setDeleteProduct(null);
        }}
        onDeleted={() => {
          setDeleteModalOpen(false);
          setDeleteProduct(null);
          refreshAndNotify("Product deleted"); // <-- Calls refreshAndNotify
        }}
      />
       
    </div>
  );
};

export default Inventory;
