import React, { useState, useEffect, useRef } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  HomeIcon,
  ShoppingCartIcon,
  CubeIcon,
  DocumentChartBarIcon,
  UsersIcon,
  ChartBarIcon,
  CogIcon,
  Bars3Icon,
  XMarkIcon,
  ChevronDoubleLeftIcon,
  ChevronDoubleRightIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { businessApi } from "../../lib/api";

interface BusinessDetails {
  id: number;
  name: string;
}

function classNames(...classes: (string | boolean | undefined)[]) {
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
    name: "Reports",
    href: "/reports",
    icon: ChartBarIcon,
    roles: ["admin"],
  },
  {
    name: "Users",
    href: "/users",
    icon: UsersIcon,
    roles: ["admin"],
  },
  {
    name: "Settings",
    href: "/settings",
    icon: CogIcon,
    roles: ["admin"],
  },
];

// Role badge color mapping
const roleBadgeStyle: Record<string, string> = {
  admin: "bg-blue-500/20 text-blue-300 ring-1 ring-blue-500/30",
  cashier: "bg-emerald-500/20 text-emerald-300 ring-1 ring-emerald-500/30",
  customer: "bg-amber-500/20 text-amber-300 ring-1 ring-amber-500/30",
};

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user } = useAuth();
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [isNameLoading, setIsNameLoading] = useState(true);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Close mobile drawer on route change
  useEffect(() => {
    setIsMobileOpen(false);
  }, [location.pathname]);

  // Close mobile drawer on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        isMobileOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(e.target as Node)
      ) {
        setIsMobileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [isMobileOpen]);

  // Prevent body scroll when mobile drawer is open
  useEffect(() => {
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileOpen]);

  useEffect(() => {
    const fetchBusinessName = async () => {
      if (!user) return;
      try {
        const businessDetails =
          (await businessApi.getMyDetails()) as BusinessDetails;
        setBusinessName(businessDetails.name || "POS System");
      } catch {
        setBusinessName("POS System");
      } finally {
        setIsNameLoading(false);
      }
    };
    fetchBusinessName();
  }, [user]);

  const filteredNavigation = navigation.filter((item) =>
    item.roles.includes(user?.role || ""),
  );

  const displayTitle = isNameLoading
    ? "Loading..."
    : businessName || "POS System";
  const collapsedInitial = isNameLoading
    ? "…"
    : (businessName?.charAt(0) ?? "P").toUpperCase();

  // Shared nav content rendered inside both desktop sidebar and mobile drawer
  const NavContent = ({ expanded }: { expanded: boolean }) => (
    <nav className="flex-1 px-2 py-3 space-y-0.5 overflow-y-auto">
      {filteredNavigation.map((item) => {
        const isActive =
          item.href === "/"
            ? location.pathname === "/"
            : location.pathname.startsWith(item.href);

        return (
          <NavLink
            key={item.name}
            to={item.href}
            title={!expanded ? item.name : undefined}
            className={classNames(
              "group relative flex items-center gap-3 rounded-xl text-sm font-medium transition-all duration-200 select-none",
              "focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400",
              expanded ? "px-3 py-2.5" : "justify-center px-0 py-2.5",
              isActive
                ? "bg-gradient-to-r from-blue-600/30 to-blue-500/10 text-white shadow-sm"
                : "text-slate-400 hover:bg-slate-700/60 hover:text-slate-100",
            )}
          >
            {/* Active indicator bar */}
            {isActive && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-0.5 rounded-r-full bg-blue-400" />
            )}

            <item.icon
              className={classNames(
                "h-5 w-5 flex-shrink-0 transition-colors duration-200",
                isActive
                  ? "text-blue-400"
                  : "text-slate-500 group-hover:text-slate-300",
              )}
              aria-hidden="true"
            />

            {expanded && (
              <span className="truncate leading-none">{item.name}</span>
            )}

            {/* Tooltip for collapsed state */}
            {!expanded && (
              <span className="pointer-events-none absolute left-full ml-3 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs font-medium text-white opacity-0 shadow-lg ring-1 ring-slate-700 transition-opacity group-hover:opacity-100 z-50">
                {item.name}
              </span>
            )}
          </NavLink>
        );
      })}
    </nav>
  );

  return (
    <>
      {/* ── MOBILE TOPBAR ── */}
      <header className="md:hidden fixed top-0 inset-x-0 z-30 flex items-center justify-between h-14 px-4 bg-slate-900 border-b border-slate-700/60 shadow-md">
        <button
          onClick={() => setIsMobileOpen(true)}
          aria-label="Open menu"
          className="p-2 -ml-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-400"
        >
          <Bars3Icon className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="h-6 w-6 rounded-md bg-blue-500 flex items-center justify-center">
            <CubeIcon className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="text-sm font-bold text-white truncate max-w-[160px]">
            {displayTitle}
          </span>
        </div>

        {/* Spacer to balance the hamburger */}
        <div className="w-9" />
      </header>

      {/* ── MOBILE OVERLAY ── */}
      <div
        className={classNames(
          "md:hidden fixed inset-0 z-40 bg-black/60 backdrop-blur-sm transition-opacity duration-300",
          isMobileOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none",
        )}
        aria-hidden="true"
      />

      {/* ── MOBILE DRAWER ── */}
      <div
        ref={sidebarRef}
        className={classNames(
          "md:hidden fixed inset-y-0 left-0 z-50 w-72 flex flex-col bg-slate-900 border-r border-slate-700/60 shadow-2xl transition-transform duration-300 ease-in-out",
          isMobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        {/* Mobile drawer header */}
        <div className="flex items-center justify-between h-14 px-4 border-b border-slate-700/60 flex-shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0">
              <CubeIcon className="h-4 w-4 text-white" />
            </div>
            <span className="text-sm font-bold text-white truncate">
              {displayTitle}
            </span>
          </div>
          <button
            onClick={() => setIsMobileOpen(false)}
            aria-label="Close menu"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors flex-shrink-0"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
        </div>

        {/* Mobile nav */}
        <div className="flex-1 flex flex-col overflow-hidden px-2 pt-2">
          <NavContent expanded={true} />
        </div>

        {/* Mobile footer */}
        <div className="px-4 py-4 border-t border-slate-700/60 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
              {(user?.role?.charAt(0) ?? "U").toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-slate-200 truncate">
                {user?.role
                  ? user.role.charAt(0).toUpperCase() + user.role.slice(1)
                  : "User"}
              </p>
              <p className="text-[10px] text-slate-500 mt-0.5">POS v1.0</p>
            </div>
            <span
              className={classNames(
                "ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full capitalize flex-shrink-0",
                roleBadgeStyle[user?.role ?? ""] ??
                  "bg-slate-700 text-slate-400",
              )}
            >
              {user?.role}
            </span>
          </div>
        </div>
      </div>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside
        className={classNames(
          "hidden md:flex flex-col bg-slate-900 border-r border-slate-700/60 min-h-screen transition-all duration-300 ease-in-out flex-shrink-0",
          isDesktopExpanded ? "w-60" : "w-[68px]",
        )}
      >
        {/* Desktop header */}
        <div className="flex items-center h-14 px-3 border-b border-slate-700/60 flex-shrink-0 relative">
          <div
            className={classNames(
              "flex items-center gap-2.5 min-w-0 transition-all duration-300",
              isDesktopExpanded ? "flex-1" : "justify-center w-full",
            )}
          >
            <div className="h-7 w-7 rounded-lg bg-blue-500 flex items-center justify-center flex-shrink-0 shadow-lg shadow-blue-500/20">
              {isDesktopExpanded ? (
                <CubeIcon className="h-4 w-4 text-white" />
              ) : (
                <span className="text-xs font-extrabold text-white leading-none">
                  {collapsedInitial}
                </span>
              )}
            </div>

            {isDesktopExpanded && (
              <span className="text-sm font-bold text-white truncate leading-tight">
                {displayTitle}
              </span>
            )}
          </div>

          {isDesktopExpanded && (
            <button
              onClick={() => setIsDesktopExpanded(false)}
              aria-label="Collapse sidebar"
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/60 transition-colors flex-shrink-0"
            >
              <ChevronDoubleLeftIcon className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Desktop nav */}
        <div className="flex-1 flex flex-col overflow-hidden px-2 pt-2">
          <NavContent expanded={isDesktopExpanded} />
        </div>

        {/* Desktop footer */}
        <div
          className={classNames(
            "border-t border-slate-700/60 flex-shrink-0 transition-all duration-300",
            isDesktopExpanded ? "px-3 py-4" : "px-2 py-3",
          )}
        >
          {isDesktopExpanded ? (
            <div className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white flex-shrink-0">
                {(user?.role?.charAt(0) ?? "U").toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-slate-200 truncate capitalize">
                  {user?.role ?? "User"}
                </p>
                <p className="text-[10px] text-slate-500">POS v1.0</p>
              </div>
              <span
                className={classNames(
                  "text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize flex-shrink-0",
                  roleBadgeStyle[user?.role ?? ""] ??
                    "bg-slate-700 text-slate-400",
                )}
              >
                {user?.role}
              </span>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div className="h-7 w-7 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white">
                {(user?.role?.charAt(0) ?? "U").toUpperCase()}
              </div>
              <button
                onClick={() => setIsDesktopExpanded(true)}
                aria-label="Expand sidebar"
                className="p-1.5 rounded-lg text-slate-500 hover:text-slate-200 hover:bg-slate-700/60 transition-colors"
              >
                <ChevronDoubleRightIcon className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
