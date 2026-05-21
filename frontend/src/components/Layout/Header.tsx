import React, { useState, useEffect, useRef } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  BellIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
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

// Role badge styles — consistent with Sidebar
const roleBadgeStyle: Record<string, string> = {
  admin: "bg-blue-500/15 text-blue-600 ring-1 ring-blue-500/25",
  cashier: "bg-emerald-500/15 text-emerald-600 ring-1 ring-emerald-500/25",
  customer: "bg-amber-500/15 text-amber-600 ring-1 ring-amber-500/25",
};

// Avatar initials background
const roleAvatarBg: Record<string, string> = {
  admin: "bg-blue-600",
  cashier: "bg-emerald-600",
  customer: "bg-amber-500",
};

// Mock notifications — replace with real data
const mockNotifications = [
  {
    id: 1,
    text: "Low stock: Laptop Stand (3 left)",
    type: "warning",
    time: "2m ago",
  },
  {
    id: 2,
    text: "Sale #1042 completed successfully",
    type: "success",
    time: "15m ago",
  },
  {
    id: 3,
    text: "New user registered: jane@acme.co",
    type: "info",
    time: "1h ago",
  },
];

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [isNameLoading, setIsNameLoading] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount] = useState(mockNotifications.length);
  const notifRef = useRef<HTMLDivElement>(null);

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  // Close notification panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const fetchBusinessName = async () => {
      if (!user) return;
      try {
        const details = (await businessApi.getMyDetails()) as BusinessDetails;
        setBusinessName(details.name || "POS System");
      } catch {
        setBusinessName("POS System");
      } finally {
        setIsNameLoading(false);
      }
    };
    fetchBusinessName();
  }, [user]);

  const displayTitle = isNameLoading
    ? "Loading…"
    : businessName || "POS System";
  const userInitials = user?.username?.slice(0, 2).toUpperCase() ?? "??";
  const avatarBg = roleAvatarBg[user?.role ?? ""] ?? "bg-slate-500";

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* ── LEFT: Business name + greeting ── */}
          {/* Hidden on mobile (the sidebar topbar handles branding there) */}
          <div className="hidden md:flex flex-col justify-center min-w-0">
            <h1
              className={classNames(
                "text-base font-bold tracking-tight text-slate-800 leading-tight truncate",
                isNameLoading && "animate-pulse text-slate-400",
              )}
            >
              {displayTitle}
            </h1>
            {user && (
              <p className="text-xs text-slate-500 leading-tight mt-0.5">
                Welcome back,{" "}
                <span className="font-semibold text-slate-700">
                  {user.username}
                </span>
              </p>
            )}
          </div>

          {/* Mobile: greeting only (branding is in sidebar topbar) */}
          <div className="md:hidden flex flex-col justify-center min-w-0">
            {user && (
              <p className="text-sm font-semibold text-slate-700 truncate">
                Hi, {user.username} 👋
              </p>
            )}
          </div>

          {/* ── RIGHT: Actions ── */}
          <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                onClick={() => setShowNotifications((v) => !v)}
                aria-label="Notifications"
                className="relative p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <BellIcon className="h-5 w-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white" />
                )}
              </button>

              {/* Notification panel */}
              <Transition
                show={showNotifications}
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 scale-95 translate-y-1"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 scale-100 translate-y-0"
                leaveTo="opacity-0 scale-95 translate-y-1"
              >
                <div className="absolute right-0 mt-2 w-80 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <span className="text-sm font-semibold text-slate-800">
                      Notifications
                    </span>
                    <span className="text-xs font-medium text-blue-600 cursor-pointer hover:underline">
                      Mark all read
                    </span>
                  </div>
                  <ul className="divide-y divide-slate-50 max-h-64 overflow-y-auto">
                    {mockNotifications.map((n) => (
                      <li
                        key={n.id}
                        className="flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {n.type === "success" ? (
                          <CheckCircleIcon className="h-4 w-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                        ) : (
                          <ExclamationCircleIcon className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        )}
                        <div className="min-w-0">
                          <p className="text-xs text-slate-700 leading-snug">
                            {n.text}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            {n.time}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ul>
                  <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                    <span className="text-xs text-blue-600 hover:underline cursor-pointer font-medium">
                      View all notifications
                    </span>
                  </div>
                </div>
              </Transition>
            </div>

            {/* Divider */}
            <div className="hidden sm:block h-6 w-px bg-slate-200" />

            {/* Profile dropdown — visible on ALL screen sizes */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 p-1.5 pr-2.5 rounded-xl hover:bg-slate-100 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500">
                {/* Avatar */}
                <div
                  className={classNames(
                    "h-7 w-7 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0",
                    avatarBg,
                  )}
                >
                  {userInitials}
                </div>

                {/* Name + role (desktop only) */}
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-xs font-semibold text-slate-800 truncate max-w-[90px]">
                    {user?.username}
                  </span>
                  <span
                    className={classNames(
                      "mt-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize",
                      roleBadgeStyle[user?.role ?? ""] ??
                        "bg-slate-100 text-slate-500",
                    )}
                  >
                    {user?.role}
                  </span>
                </div>

                <ChevronDownIcon className="h-3.5 w-3.5 text-slate-400 hidden sm:block" />
              </Menu.Button>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-150"
                enterFrom="opacity-0 scale-95 translate-y-1"
                enterTo="opacity-100 scale-100 translate-y-0"
                leave="transition ease-in duration-100"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95 translate-y-1"
              >
                <Menu.Items className="absolute right-0 z-30 mt-2 w-56 origin-top-right rounded-2xl bg-white shadow-xl ring-1 ring-slate-200 overflow-hidden focus:outline-none">
                  {/* User info header */}
                  <div className="px-4 py-3 bg-slate-50 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={classNames(
                          "h-8 w-8 rounded-full flex items-center justify-center text-xs font-bold text-white flex-shrink-0",
                          avatarBg,
                        )}
                      >
                        {userInitials}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-slate-800 truncate">
                          {user?.username}
                        </p>
                        <span
                          className={classNames(
                            "text-[10px] font-semibold px-1.5 py-0.5 rounded-full capitalize",
                            roleBadgeStyle[user?.role ?? ""] ??
                              "bg-slate-100 text-slate-500",
                          )}
                        >
                          {user?.role}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Sign out — always accessible, including on mobile */}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={classNames(
                          "flex items-center w-full gap-3 px-4 py-3 text-sm font-medium transition-colors",
                          active
                            ? "bg-red-50 text-red-600"
                            : "text-slate-600 hover:bg-red-50 hover:text-red-600",
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4 flex-shrink-0" />
                        Sign out
                      </button>
                    )}
                  </Menu.Item>
                </Menu.Items>
              </Transition>
            </Menu>
          </div>
        </div>
      </div>
    </header>
  );
};
