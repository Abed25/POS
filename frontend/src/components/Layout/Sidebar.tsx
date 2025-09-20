import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  DocumentChartBarIcon,
  UsersIcon,
  CogIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";

const navigation = [
  { name: "Dashboard", href: "/", icon: HomeIcon, roles: ["Admin", "Cashier"] },
  {
    name: "Sales",
    href: "/sales",
    icon: ShoppingCartIcon,
    roles: ["Admin", "Cashier"],
  },
  {
    name: "Inventory",
    href: "/inventory",
    icon: CubeIcon,
    roles: ["Admin", "Cashier"],
  },
  {
    name: "Reports",
    href: "/reports",
    icon: DocumentChartBarIcon,
    roles: ["Admin"],
  },
  { name: "Users", href: "/users", icon: UsersIcon, roles: ["Admin"] },
  { name: "Settings", href: "/settings", icon: CogIcon, roles: ["Admin"] },
];

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || "")
  );

  return (
    <div className="flex flex-col w-64 bg-gray-900">
      <div className="flex items-center h-16 flex-shrink-0 px-4 bg-gray-900">
        <div className="flex items-center">
          <CubeIcon className="h-8 w-8 text-blue-400" />
          <span className="ml-2 text-xl font-bold text-white">POS Pro</span>
        </div>
      </div>

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
                  ${
                    isActive
                      ? "bg-gray-800 text-white"
                      : "text-gray-300 hover:bg-gray-700 hover:text-white"
                  }
                `}
              >
                <item.icon
                  className={`
                    mr-3 flex-shrink-0 h-6 w-6
                    ${
                      isActive
                        ? "text-gray-300"
                        : "text-gray-400 group-hover:text-gray-300"
                    }
                  `}
                />
                {item.name}
              </NavLink>
            );
          })}
        </nav>
      </div>
    </div>
  );
};
