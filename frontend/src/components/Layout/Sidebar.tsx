import React, { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  DocumentChartBarIcon,
  UsersIcon,
  CogIcon,
  Bars3Icon, // toggle icon
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon, roles: ["admin", "cashier"] },
  {
    name: "Sales",
    href: "/sales",
    icon: ShoppingCartIcon,
    roles: ["admin", "cashier"],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: CubeIcon,
    roles: ["admin", "cashier"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: DocumentChartBarIcon,
    roles: ["admin"],
  },
  { name: "Users", href: "/users", icon: UsersIcon, roles: ["admin"] },
  { name: "Settings", href: "/settings", icon: CogIcon, roles: ["admin"] },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(true); // ⬅️ sidebar toggle

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <div
      className={`flex flex-col bg-gray-900 text-gray-300 transition-all duration-300
      ${isOpen ? "w-64" : "w-20"}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between h-16 px-4 bg-gray-900">
        <div className="flex items-center">
          <CubeIcon className="h-8 w-8 text-blue-400" />
          {isOpen && (
            <span className="ml-2 text-xl font-bold text-white">POS Pro</span>
          )}
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-1 rounded hover:bg-gray-800"
        >
          <Bars3Icon className="h-6 w-6 text-gray-300" />
        </button>
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
                className={`
                  group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors
                  ${isActive ? "bg-gray-800 text-white" : "hover:bg-gray-700"}
                `}
              >
                <item.icon
                  className={`mr-3 h-6 w-6 flex-shrink-0
                    ${
                      isActive
                        ? "text-gray-300"
                        : "text-gray-400 group-hover:text-gray-300"
                    }
                  `}
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
