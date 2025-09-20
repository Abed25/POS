import React, { useState, useEffect } from "react";
import { PlusIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";
import { StockItem } from "../types";
import { stockApi } from "../lib/api";

export const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<StockItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const response = await stockApi.getStockItems();

      // Mock data - replace with actual API response
      setInventory([
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
          status: "low_stock",
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
          status: "out_of_stock",
        },
        {
          id: "3",
          productName: "Smartphone Case",
          currentStock: 25,
          minStockLevel: 15,
          maxStockLevel: 75,
          unitPrice: 19.99,
          category: "Electronics",
          supplier: "TechCorp",
          lastRestocked: "2024-01-20",
          status: "in_stock",
        },
      ]);
    } catch (error) {
      console.error("Failed to fetch inventory:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (item: StockItem) => {
    if (item.status === "out_of_stock") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          Out of Stock
        </span>
      );
    } else if (item.status === "low_stock") {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          Low Stock
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          In Stock
        </span>
      );
    }
  };

  const getStockPercentage = (current: number, max: number) => {
    return Math.min(100, Math.max(0, (current / max) * 100));
  };

  const filteredInventory = inventory.filter((item) => {
    if (filter === "low_stock")
      return item.status === "low_stock" || item.status === "out_of_stock";
    if (filter === "in_stock") return item.status === "in_stock";
    return true;
  });

  return (
    <div>
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
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <PlusIcon className="-ml-1 mr-2 h-5 w-5" />
            Add Product
          </button>
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
                    inventory.filter(
                      (item) =>
                        item.status === "low_stock" ||
                        item.status === "out_of_stock"
                    ).length
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
          filteredInventory.map((item) => (
            <div
              key={item.id}
              className="bg-white overflow-hidden shadow rounded-lg hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {item.productName}
                    </h3>
                    <p className="text-sm text-gray-500">{item.category}</p>
                  </div>
                  {(item.status === "low_stock" ||
                    item.status === "out_of_stock") && (
                    <ExclamationTriangleIcon className="h-6 w-6 text-yellow-500" />
                  )}
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Current Stock</span>
                    <span className="text-sm font-medium text-gray-900">
                      {item.currentStock} / {item.maxStockLevel}
                    </span>
                  </div>

                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${
                        item.status === "out_of_stock"
                          ? "bg-red-500"
                          : item.status === "low_stock"
                          ? "bg-yellow-500"
                          : "bg-green-500"
                      }`}
                      style={{
                        width: `${getStockPercentage(
                          item.currentStock,
                          item.maxStockLevel
                        )}%`,
                      }}
                    ></div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Unit Price</span>
                    <span className="text-sm font-medium text-gray-900">
                      ${item.unitPrice}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500">Supplier</span>
                    <span className="text-sm text-gray-900">
                      {item.supplier}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  {getStatusBadge(item)}
                  <button className="text-sm text-blue-600 hover:text-blue-500 font-medium">
                    Restock
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
