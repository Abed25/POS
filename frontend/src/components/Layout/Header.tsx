import React, { useState, useEffect } from "react";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import {
  BellIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";
import { useAuth } from "../../contexts/AuthContext";
import { businessApi } from "../../lib/api";

// Helper function for conditional class names
function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(" ");
}

export const Header: React.FC = () => {
  const { user, logout } = useAuth();
  const [businessName, setBusinessName] = useState<string | null>(null);
  const [isNameLoading, setIsNameLoading] = useState(true);

  interface BusinessDetails {
    id: number;
    name: string; // The property we need
  }
  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

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

  const displayTitle = isNameLoading
    ? "Loading..."
    : businessName || "POS System";

  return (
    <div className="sticky top-0 z-10 bg-white shadow-md border-b border-gray-100">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          {/* 1. Brand/Business Title and Welcome Greeting (Left Side) */}
          <div className="flex items-center space-x-4">
            <div className="flex flex-col justify-center h-full py-2">
              <h1
                className={classNames(
                  "text-xl font-extrabold tracking-tight text-blue-700 sm:text-2xl",
                  isNameLoading ? "animate-pulse" : ""
                )}
                title="Business Name"
              >
                {displayTitle}
              </h1>

              {/* Added Welcome Message Here */}
              {user && (
                <p className="text-sm font-medium text-gray-700 mt-[-2px] sm:mt-0">
                  Welcome back,{" "}
                  <span className="font-semibold">{user.username}</span>
                </p>
              )}
            </div>
          </div>

          {/* 2. User Controls (Right Side) */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Notifications Button */}
            <button
              type="button"
              className="p-2 rounded-full text-gray-400 bg-gray-50 hover:text-blue-500 hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
              title="Notifications"
            >
              <BellIcon className="h-6 w-6" aria-hidden="true" />
            </button>

            {/* Profile dropdown */}
            <Menu as="div" className="relative">
              <div>
                <Menu.Button className="flex items-center p-1.5 rounded-full text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out">
                  {/* User Icon and Name */}
                  <UserCircleIcon
                    className="h-8 w-8 text-blue-500"
                    aria-hidden="true"
                  />

                  <div className="hidden md:flex flex-col items-start ml-2 mr-1">
                    <span className="text-sm font-semibold text-gray-900 truncate max-w-[100px]">
                      {user?.username}
                    </span>
                    {/* Enhanced Role Badge */}
                    <span className="mt-0.5 px-2 py-0 text-xs font-medium rounded-full bg-blue-500 text-white capitalize">
                      {user?.role}
                    </span>
                  </div>

                  {/* Dropdown Indicator */}
                  <ChevronDownIcon
                    className="h-5 w-5 text-gray-400 ml-1 hidden md:block"
                    aria-hidden="true"
                  />
                </Menu.Button>
              </div>

              <Transition
                as={Fragment}
                enter="transition ease-out duration-100"
                enterFrom="transform opacity-0 scale-95"
                enterTo="transform opacity-100 scale-100"
                leave="transition ease-in duration-75"
                leaveFrom="transform opacity-100 scale-100"
                leaveTo="transform opacity-0 scale-95"
              >
                <Menu.Items className="absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  {/* Profile Item (optional, can be linked to a settings page) */}
                  <Menu.Item disabled>
                    {({ active }) => (
                      <span
                        className={classNames(
                          active ? "bg-gray-100" : "",
                          "block px-4 py-2 text-sm text-gray-500 pointer-events-none"
                        )}
                      >
                        Signed in as **{user?.username}**
                      </span>
                    )}
                  </Menu.Item>
                  <div className="my-1 border-t border-gray-100" />{" "}
                  {/* Separator */}
                  {/* Logout Item */}
                  <Menu.Item>
                    {({ active }) => (
                      <button
                        onClick={handleLogout}
                        className={classNames(
                          active ? "bg-gray-100 text-red-600" : "text-gray-700",
                          "flex items-center w-full px-4 py-2 text-sm transition duration-150 ease-in-out"
                        )}
                      >
                        <ArrowRightOnRectangleIcon
                          className="mr-3 h-5 w-5 text-red-500"
                          aria-hidden="true"
                        />
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
    </div>
  );
};
