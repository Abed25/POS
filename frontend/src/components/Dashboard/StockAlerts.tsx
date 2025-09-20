import React from "react";
import {
  ExclamationTriangleIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";
import { StockItem } from "../../types";

interface StockAlertsProps {
  items: StockItem[];
}

export const StockAlerts: React.FC<StockAlertsProps> = ({ items }) => {
  const lowStockItems = items.filter((item) => item.status === "low_stock");
  const outOfStockItems = items.filter(
    (item) => item.status === "out_of_stock"
  );

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Stock Alerts</h3>

        <div className="space-y-4">
          {outOfStockItems.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <XCircleIcon className="h-5 w-5 text-red-500 mr-2" />
                <span className="text-sm font-medium text-red-800">
                  Out of Stock
                </span>
              </div>
              <div className="space-y-2">
                {outOfStockItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-red-50 rounded-md"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <span className="text-sm text-red-600 font-medium">
                      0 units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {lowStockItems.length > 0 && (
            <div>
              <div className="flex items-center mb-2">
                <ExclamationTriangleIcon className="h-5 w-5 text-yellow-500 mr-2" />
                <span className="text-sm font-medium text-yellow-800">
                  Low Stock
                </span>
              </div>
              <div className="space-y-2">
                {lowStockItems.slice(0, 3).map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-3 bg-yellow-50 rounded-md"
                  >
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {item.productName}
                      </p>
                      <p className="text-sm text-gray-500">{item.category}</p>
                    </div>
                    <span className="text-sm text-yellow-600 font-medium">
                      {item.currentStock} units
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {items.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No stock alerts at the moment
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
