import React, { useState, useEffect, useRef } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { productApi } from "../lib/api";
import { Product } from "../types";
import AddProductModal from "../components/Inventory/AddProductModal";
import RestockProductModal from "../components/Inventory/RestockProductModal";
import EditProductModal from "../components/Inventory/EditProductModal";
import DeleteProductModal from "../components/Inventory/DeleteProductModal";

type FilterType = "all" | "low_stock" | "in_stock";

export const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
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
  const [deleteProduct, setDeleteProduct] = useState<Product | null>(null);

  // --- pagination / infinite scroll state ---
  const [page, setPage] = useState(1);
  const pageSize = 3; // adjust to taste
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  /** Fetch all products and normalize */
  const fetchInventory = async () => {
    setLoading(true);
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
        const stock = Number(d.stock ?? d.currentStock ?? d.current_stock ?? 0);
        const maxStockLevelRaw =
          d.maxStockLevel ?? d.max_stock ?? d.maxStock ?? undefined;

        return {
          id,
          name: d.name ?? d.productName ?? "",
          description: d.description ?? d.desc ?? undefined,
          price: Number.isFinite(price) ? price : 0,
          stock: Number.isFinite(stock) ? stock : 0,
          category: d.category ?? d.cat ?? null,
          sku: d.sku ?? d.SKU ?? null,
          created_at: d.created_at ?? d.createdAt ?? "",
          updated_at: d.updated_at ?? d.updatedAt ?? "",
          maxStockLevel:
            maxStockLevelRaw !== undefined
              ? Number(maxStockLevelRaw)
              : undefined,
          supplier: d.supplier ?? null,
        } as Product;
      });

      setInventory(products);
    } catch (err) {
      console.error("Failed to fetch inventory:", err);
      setInventory([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  /** Helpers for stock status */
  const getStatus = (stock: number, min = 5) => {
    if (stock === 0) return "out_of_stock";
    if (stock <= min) return "low_stock";
    return "in_stock";
  };

  const getStatusBadge = (stock: number) => {
    const s = getStatus(stock);
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
    const status = getStatus(item.stock);
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
  });

  // reset page when filters/search/sort or inventory change
  useEffect(() => {
    setPage(1);
  }, [search, sortBy, filter, inventory.length]);

  // pagination slice + hasMore flag
  const paginatedInventory = sortedInventory.slice(0, page * pageSize);
  const hasMore = sortedInventory.length > paginatedInventory.length;

  // IntersectionObserver to load more when sentinel is visible
  useEffect(() => {
    const el = listEndRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && hasMore && !isFetchingMore && !loading) {
            setIsFetchingMore(true);
            // small debounce / UX delay
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
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, isFetchingMore, loading, listEndRef.current]);

  return (
    <div>
      {/* Header + Input button */}
      <div className="mb-6">
        {/* Top header section */}
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Management
          </h1>
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
            <AddProductModal onAdded={fetchInventory} />
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="mb-6">
        <nav className="flex space-x-8">
          {(
            [
              { key: "all", label: "All Items" },
              { key: "low_stock", label: "Alerts" },
              { key: "in_stock", label: "In Stock" },
            ] as { key: FilterType; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
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
                      const s = getStatus(p.stock);
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
        ) : paginatedInventory.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No inventory items found</p>
          </div>
        ) : (
          paginatedInventory.map((item) => {
            const status = getStatus(item.stock);
            const max = item.maxStockLevel ?? Math.max(20, item.stock);
            const pct = Math.min(
              100,
              Math.round((item.stock / Math.max(1, max)) * 100)
            );
            return (
              <div
                key={item.id}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-medium text-gray-900">
                        {item.name}
                      </h3>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    {(status === "low_stock" || status === "out_of_stock") && (
                      <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                    )}
                  </div>

                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Stock</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.stock}
                      </span>
                    </div>

                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          status === "out_of_stock"
                            ? "bg-red-500"
                            : status === "low_stock"
                            ? "bg-yellow-500"
                            : "bg-green-500"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Unit Price</span>
                      <span className="text-sm font-medium text-gray-900">
                        {item.price.toLocaleString("en-KE", {
                          style: "currency",
                          currency: "KES",
                          minimumFractionDigits: 0,
                        })}
                      </span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-500">Supplier</span>
                      <span className="text-sm text-gray-900">
                        {item.supplier ?? "-"}
                      </span>
                    </div>
                  </div>

                  <div className="mt-4 flex gap-2 justify-end">
                    {getStatusBadge(item.stock)}
                    <button
                      className="px-3 py-1 rounded bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
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
                      className="px-3 py-1 rounded bg-yellow-500 text-white text-sm font-medium hover:bg-yellow-600 transition"
                    >
                      Edit
                    </button>
                    <button
                      className="px-3 py-1 rounded bg-white border border-red-600 text-red-600 text-sm font-medium hover:bg-red-50 transition"
                      onClick={() => {
                        setDeleteProduct(item);
                        setDeleteModalOpen(true);
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* sentinel for infinite scroll */}
      <div ref={listEndRef} />

      {/* fallback / manual load more */}
      {!loading && hasMore && (
        <div className="mt-6 flex justify-center">
          <button
            className="px-4 py-2 rounded-lg border bg-white text-gray-700 hover:bg-gray-50"
            onClick={() => setPage((p) => p + 1)}
            disabled={isFetchingMore}
          >
            {isFetchingMore ? "Loading..." : "Load more"}
          </button>
        </div>
      )}

      {/* modals */}
      <RestockProductModal
        open={restockModalOpen}
        product={restockProduct}
        onClose={() => setRestockModalOpen(false)}
        onRestocked={fetchInventory}
      />
      <EditProductModal
        open={editModalOpen}
        product={editProduct}
        onClose={() => setEditModalOpen(false)}
        onEdited={fetchInventory}
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
          fetchInventory();
        }}
      />
    </div>
  );
};

export default Inventory;
