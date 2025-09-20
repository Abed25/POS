import React from "react";
import { ArrowUpIcon, ArrowDownIcon } from "@heroicons/react/24/outline";

interface MetricCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ComponentType<any>;
  color?: "blue" | "green" | "yellow" | "red";
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  change,
  icon: Icon,
  color = "blue",
}) => {
  const colorClasses = {
    blue: "text-blue-600 bg-blue-50",
    green: "text-green-600 bg-green-50",
    yellow: "text-yellow-600 bg-yellow-50",
    red: "text-red-600 bg-red-50",
  };

  const changeColorClass =
    change && change >= 0 ? "text-green-600" : "text-red-600";

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div
              className={`inline-flex items-center justify-center p-3 rounded-md ${colorClasses[color]}`}
            >
              <Icon className="h-6 w-6" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                <div className="text-2xl font-semibold text-gray-900">
                  {typeof value === "number" &&
                  title.toLowerCase().includes("revenue")
                    ? `$${value.toLocaleString()}`
                    : value.toLocaleString()}
                </div>
                {change !== undefined && (
                  <div
                    className={`ml-2 flex items-baseline text-sm font-semibold ${changeColorClass}`}
                  >
                    {change >= 0 ? (
                      <ArrowUpIcon className="self-center flex-shrink-0 h-5 w-5" />
                    ) : (
                      <ArrowDownIcon className="self-center flex-shrink-0 h-5 w-5" />
                    )}
                    <span className="sr-only">
                      {change >= 0 ? "Increased" : "Decreased"} by
                    </span>
                    {Math.abs(change)}%
                  </div>
                )}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
