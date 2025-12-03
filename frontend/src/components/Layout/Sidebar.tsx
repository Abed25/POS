import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  DocumentChartBarIcon,
  UsersIcon,
  CogIcon,
  Bars3Icon, // menu
  XMarkIcon, // close
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { businessApi } from "../../lib/api";

// Define the expected structure of the business details response
interface BusinessDetails {
  id: number;
  name: string;
}

// Helper function for conditional class names
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: HomeIcon,
    roles: ["admin", "cashier", "customer"],
  },
  {
    name: "Sales (POS)",
    href: "/sales",
    icon: ShoppingCartIcon,
    roles: ["admin", "cashier"],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: DocumentChartBarIcon,
    roles: ["admin", "cashier"],
  },
  {
    name: "Products Catalog",
    href: "/products",
    icon: CubeIcon,
    roles: ["admin", "cashier", "customer"],
  },
  {
    name: "Users Management",
    href: "/users",
    icon: UsersIcon,
    roles: ["admin"],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [isNameLoading, setIsNameLoading] = useState(true);

  useEffect(() => {
    const fetchBusinessName = async () => {
      if (!user) return;

      try {
        const businessDetails =
          (await businessApi.getMyDetails()) as BusinessDetails;
        setBusinessName(businessDetails.name || "POS System");
      } catch (error) {
        console.error("Failed to fetch business details:", error);
        setBusinessName("POS System");
      } finally {
        setIsNameLoading(false);
      }
    };

    fetchBusinessName();
  }, [user]);

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  const displayTitle = isNameLoading
    ? "Loading..."
    : businessName || "POS System";

  const collapsedTitle = isNameLoading
    ? "..."
    : businessName?.slice(0, 1).toUpperCase() || "P";

  return (
    <div
      className={classNames(
        "flex flex-col bg-slate-800 text-slate-300 transition-all duration-300 min-h-screen relative",
        isOpen ? "w-64" : "w-20"
      )}
    >
      {/* 1. Header & Logo Area (Uses Flex to center/justify content) */}
      <div className="flex items-center h-16 border-b border-slate-700 relative">
        {/* Business Name/Logo Container */}
        <div
          className={classNames(
            "flex items-center truncate h-full",
            // When open, start from the left padding. When closed, center it in the 20px space.
            isOpen ? "px-4 w-full" : "justify-center w-20"
          )}
        >
          {/* Logo Icon (Visible when open) */}
          <CubeIcon
            className={classNames(
              "h-8 w-8 text-blue-400 flex-shrink-0 transition-opacity duration-300",
              isOpen ? "opacity-100" : "opacity-0 absolute"
            )}
          />

          {/* Expanded Title */}
          {isOpen ? (
            <span className="ml-2 text-xl font-extrabold text-white truncate">
              {displayTitle}
            </span>
          ) : (
            // Collapsed Single Letter Title (Visible and centered when closed)
            <span className="text-2xl font-extrabold text-blue-400 pointer-events-none">
              {collapsedTitle}
            </span>
          )}
        </div>

        {/* Toggle button (Always positioned absolutely on the right) */}
        <button
          onClick={() => setIsOpen((s) => !s)}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          className={classNames(
            "p-2 rounded-lg transition-colors hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-400 absolute",
            // Positioned correctly at the edge of the expanded/collapsed width
            isOpen ? "right-3" : "right-2"
          )}
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6 text-slate-200" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-slate-300" />
          )}
        </button>
      </div>

      {/* 2. Navigation Links */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-3 py-4 space-y-2">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                title={item.name} // Tooltip for collapsed view
                className={classNames(
                  "group flex items-center py-2 text-sm font-semibold rounded-lg transition-all duration-200",
                  "focus:outline-none focus:ring-2 focus:ring-blue-400",
                  // Active state: Brighter background and blue text/icon
                  isActive
                    ? "bg-slate-700 text-white shadow-md"
                    : "text-slate-300 hover:bg-slate-700 hover:text-white",
                  // Full width padding when open, compact padding when closed
                  isOpen ? "px-4" : "justify-center px-0"
                )}
              >
                <item.icon
                  className={classNames(
                    "h-6 w-6 flex-shrink-0 transition-colors duration-200",
                    // Active icon color
                    isActive
                      ? "text-blue-400"
                      : "text-slate-400 group-hover:text-blue-300",
                    // Spacing adjustment
                    isOpen ? "mr-3" : ""
                  )}
                  aria-hidden="true"
                />

                {/* Link Name - Only show when expanded */}
                {isOpen && <span className="truncate">{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* 3. Footer (Optional: User Role/Version) */}
      <div
        className={classNames(
          "p-4 border-t border-slate-700 text-xs text-slate-500",
          isOpen ? "block" : "hidden"
        )}
      >
        <p className="font-medium text-slate-400">
          User Role: <span className="capitalize text-white">{user?.role}</span>
        </p>
        <p className="mt-1">POS Dashboard v1.0</p>
      </div>
    </div>
  );
};
