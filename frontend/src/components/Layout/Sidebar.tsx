import React, { useState } from "react";
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

const navigation = [
  {
    name: "Dashboard",
    href: "/",
    icon: HomeIcon,
    roles: ["admin", "cashier", "customer"],
  },
  // {
  //   name: "Sales",
  //   href: "/sales",
  //   icon: ShoppingCartIcon,
  //   roles: ["admin", "cashier"],
  // },
  {
    name: "Stock",
    href: "/inventory",
    icon: CubeIcon,
    roles: ["admin", "cashier"],
  },

  // {
  //   name: "Reports",
  //   href: "/reports",
  //   icon: DocumentChartBarIcon,
  //   roles: ["admin"],
  // },
  // { name: "Users", href: "/users", icon: UsersIcon, roles: ["admin"] },
  // { name: "Settings", href: "/settings", icon: CogIcon, roles: ["admin"] },

  {
    name: "products",
    href: "/products",
    icon: CubeIcon,
    roles: ["admin", "cashier", "customer"],
  },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false); // closed by default

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <div
      className={`flex flex-col bg-gray-900 text-gray-300 transition-all duration-300
        ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* Header */}
      <div className="relative flex items-center h-16 px-4 bg-gray-900">
        {/* Toggle button: shows Bars when closed, X when open */}
        <button
          onClick={() => setIsOpen((s) => !s)}
          aria-label={isOpen ? "Close sidebar" : "Open sidebar"}
          className={`${
            isOpen
              ? "absolute right-3 top-3 p-2 rounded-md bg-gray-800 hover:bg-gray-700 z-10"
              : "ml-auto p-1 rounded hover:bg-gray-800"
          }`}
        >
          {isOpen ? (
            <XMarkIcon className="h-6 w-6 text-gray-200" />
          ) : (
            <Bars3Icon className="h-6 w-6 text-gray-300" />
          )}
        </button>
        <div className="flex items-center">
          <CubeIcon className="h-8 w-8 top-1 text-blue-400" />
          {isOpen && (
            <span className="ml-2 text-xl font-bold text-white">POS Pro</span>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        <nav className="flex-1 px-2 py-4 space-y-1">
          {filteredNavigation.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <NavLink
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive ? "bg-gray-800 text-white" : "hover:bg-gray-700"}`}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 flex-shrink-0
                    ${
                      isActive
                        ? "text-gray-300"
                        : "text-gray-400 group-hover:text-gray-300"
                    }`}
                />
                {isOpen && item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
