import React, { useState, useEffect, useRef, Fragment } from "react";
import { Menu, Transition } from "@headlessui/react";
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

type NotificationType = "success" | "warning" | "info" | "error";

interface Notification {
  id: number;
  text: string;
  type: NotificationType;
  time: string;
  role: "admin" | "cashier" | "customer" | "all";
}

function classNames(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}

const roleAvatarBg: Record<string, string> = {
  admin: "bg-blue-600",
  cashier: "bg-emerald-600",
  customer: "bg-amber-500",
};

// Notifications (role-based)
const allNotifications: Notification[] = [
  {
    id: 1,
    text: "Low stock: Laptop Stand (3 left)",
    type: "warning",
    time: "2m ago",
    role: "admin",
  },
  {
    id: 2,
    text: "New user registered: jane@acme.co",
    type: "info",
    time: "1h ago",
    role: "admin",
  },

  {
    id: 3,
    text: "Sale #1042 completed successfully",
    type: "success",
    time: "15m ago",
    role: "cashier",
  },
  {
    id: 4,
    text: "Payment pending confirmation",
    type: "warning",
    time: "30m ago",
    role: "cashier",
  },

  {
    id: 5,
    text: "Your order #778 is being processed",
    type: "info",
    time: "10m ago",
    role: "customer",
  },
  {
    id: 6,
    text: "Your order has been delivered 🎉",
    type: "success",
    time: "1h ago",
    role: "customer",
  },

  {
    id: 7,
    text: "System maintenance scheduled tonight",
    type: "info",
    time: "today",
    role: "all",
  },
];

export const Header: React.FC = () => {
  const { user, logout } = useAuth();

  const [businessName, setBusinessName] = useState<string | null>(null);
  const [isNameLoading, setIsNameLoading] = useState(true);

  const [showNotifications, setShowNotifications] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  const role = user?.role;

  // Filter notifications by role
  const notifications = allNotifications.filter(
    (n) => n.role === "all" || n.role === role,
  );

  const unreadCount = role === "customer" ? 0 : notifications.length;

  const isCustomer = role === "customer";

  const handleLogout = async () => {
    await logout();
  };

  // close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // business name
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
  const avatarBg = roleAvatarBg[role ?? ""] ?? "bg-slate-500";

  return (
    <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 shadow-sm">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 gap-4">
          {/* LEFT */}
          <div className="hidden md:flex flex-col">
            <h1 className="text-base font-bold text-slate-800 truncate">
              {displayTitle}
            </h1>
            {user && (
              <p className="text-xs text-slate-500">
                Welcome back,{" "}
                <span className="font-semibold">{user.username}</span>
              </p>
            )}
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-2">
            {/* 🔔 NOTIFICATIONS */}
            <div className="relative" ref={notifRef}>
              <button
                disabled={isCustomer}
                onClick={() => {
                  if (isCustomer) return;
                  setShowNotifications((v) => !v);
                }}
                className={classNames(
                  "relative p-2 rounded-xl transition-colors",
                  isCustomer
                    ? "text-slate-300 cursor-not-allowed"
                    : "text-slate-500 hover:text-slate-800 hover:bg-slate-100",
                )}
              >
                <BellIcon className="h-5 w-5" />

                {!isCustomer && unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white" />
                )}
              </button>

              {/* Dropdown */}
              {!isCustomer && (
                <Transition show={showNotifications} as={Fragment}>
                  <div className="absolute right-0 mt-2 w-80 bg-white shadow-xl rounded-2xl border overflow-hidden">
                    <div className="px-4 py-3 border-b flex justify-between">
                      <span className="text-sm font-semibold">
                        Notifications
                      </span>
                      <span className="text-xs text-blue-600">
                        Mark all read
                      </span>
                    </div>

                    <ul className="max-h-64 overflow-y-auto divide-y">
                      {notifications.map((n) => (
                        <li
                          key={n.id}
                          className="flex gap-3 px-4 py-3 hover:bg-slate-50"
                        >
                          {n.type === "success" ? (
                            <CheckCircleIcon className="h-4 w-4 text-emerald-500 mt-0.5" />
                          ) : (
                            <ExclamationCircleIcon className="h-4 w-4 text-amber-500 mt-0.5" />
                          )}

                          <div>
                            <p className="text-xs text-slate-700">{n.text}</p>
                            <p className="text-[10px] text-slate-400">
                              {n.time}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                </Transition>
              )}
            </div>

            {/* PROFILE */}
            <Menu as="div" className="relative">
              <Menu.Button className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100">
                <div
                  className={`h-7 w-7 rounded-full flex items-center justify-center text-white text-xs font-bold ${avatarBg}`}
                >
                  {userInitials}
                </div>

                <span className="hidden sm:block text-xs font-medium">
                  {user?.username}
                </span>

                <ChevronDownIcon className="h-3 w-3 text-slate-400" />
              </Menu.Button>

              <Transition as={Fragment}>
                <Menu.Items className="absolute right-0 mt-2 w-56 bg-white shadow-xl rounded-2xl border overflow-hidden">
                  <div className="px-4 py-3 border-b bg-slate-50">
                    <p className="text-sm font-semibold">{user?.username}</p>
                    <span className="text-[10px] text-slate-500 capitalize">
                      {role}
                    </span>
                  </div>

                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={classNames(
                          "w-full flex items-center gap-2 px-4 py-3 text-sm",
                          active ? "bg-red-50 text-red-600" : "text-slate-600",
                        )}
                      >
                        <ArrowRightOnRectangleIcon className="h-4 w-4" />
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
