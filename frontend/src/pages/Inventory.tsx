import React, { useState, useEffect } from "react";
import { ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { productApi } from "../lib/api";
import AddProductModal from "../components/Inventory/AddProductModal";

/** DB-shaped product */
export type Product = {
  id: number;
  name: string;
  description?: string;
  price: number;
  stock: number;
  category?: string | null;
  sku?: string | null;
  created_at: string;
  updated_at: string;
  maxStockLevel?: number;
  supplier?: string | null;
};

type FilterType = "all" | "low_stock" | "in_stock";

export const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<FilterType>("all");

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
    if (filter === "low_stock")
      return status === "low_stock" || status === "out_of_stock";
    if (filter === "in_stock") return status === "in_stock";
    return true;
  });

  return (
    <div>
      {/* Header + Add Product Button */}
      <div className="sm:flex sm:items-center sm:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Inventory Management
          </h1>
          <p className="mt-1 text-sm text-gray-600">
            Monitor and manage your product inventory
          </p>
        </div>
        <div className="mt-4 sm:mt-0">
          {/* ✅ Integrated Add Product Modal */}
          <AddProductModal onAdded={() => fetchInventory()} />
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
        ) : filteredInventory.length === 0 ? (
          <div className="col-span-full text-center py-12">
            <p className="text-gray-500">No inventory items found</p>
          </div>
        ) : (
          filteredInventory.map((item) => {
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

                  <div className="mt-4 flex items-center justify-between">
                    {getStatusBadge(item.stock)}
                    <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                      Restock
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

export default Inventory;
