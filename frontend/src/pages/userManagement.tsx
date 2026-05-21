// src/pages/UserManagement.tsx

import React, { useState, useEffect, useMemo } from "react";
import {
  PlusIcon,
  PencilSquareIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  UsersIcon,
  ShieldCheckIcon,
  UserIcon,
  ExclamationTriangleIcon,
} from "@heroicons/react/24/outline";

import { User } from "../types";
import { userApi } from "../lib/api";

// ───────────────── TYPES ─────────────────

interface UserFormState {
  id?: number;
  username: string;
  role: "cashier" | "customer" | "admin";
  password?: string;
}

// ───────────────── METRIC CARD ─────────────────

interface MetricCardProps {
  title: string;
  value: number;
  subtitle: string;
  icon: React.ElementType;
  iconBg: string;
  iconColor: string;
}

const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-gray-500">{title}</span>

        <div className={`p-2 rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} />
        </div>
      </div>

      <div>
        <p className="text-2xl font-bold text-gray-900">{value}</p>

        <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>
      </div>
    </div>
  );
};

// ───────────────── SECTION HEADER ─────────────────

const SectionHeader: React.FC<{
  title: string;
  subtitle?: string;
}> = ({ title, subtitle }) => {
  return (
    <div className="mb-4">
      <h2 className="text-base font-semibold text-gray-800">{title}</h2>

      {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
    </div>
  );
};

// ───────────────── SKELETON ─────────────────

const SkeletonRow = () => {
  return (
    <div className="animate-pulse flex items-center justify-between px-4 py-4 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-full bg-gray-200" />
        <div>
          <div className="h-3 w-28 bg-gray-200 rounded mb-2" />
          <div className="h-2 w-20 bg-gray-100 rounded" />
        </div>
      </div>

      <div className="h-7 w-20 bg-gray-200 rounded-full" />
    </div>
  );
};

// ───────────────── ROLE STYLES ─────────────────

const roleStyles = {
  admin: {
    badge: "bg-red-100 text-red-700",
    icon: ShieldCheckIcon,
  },

  cashier: {
    badge: "bg-green-100 text-green-700",
    icon: UserIcon,
  },

  customer: {
    badge: "bg-blue-100 text-blue-700",
    icon: UsersIcon,
  },
};

// ───────────────── PAGE ─────────────────

const UserManagement: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [search, setSearch] = useState("");

  const [selectedRole, setSelectedRole] = useState("all");

  const [isModalOpen, setIsModalOpen] = useState(false);

  const [isEditMode, setIsEditMode] = useState(false);

  const [formData, setFormData] = useState<UserFormState>({
    username: "",
    password: "",
    role: "cashier",
  });

  // ───────────────── FETCH USERS ─────────────────

  const fetchUsers = async () => {
    try {
      setLoading(true);

      setError(null);

      const data = (await userApi.getAll()) as User[];

      setUsers(data);
    } catch (err: any) {
      console.error(err);

      setError("Failed to load users.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ───────────────── FILTERED USERS ─────────────────

  const filteredUsers = useMemo(() => {
    return users.filter((user) => {
      const matchesSearch = user.username
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesRole = selectedRole === "all" || user.role === selectedRole;

      return matchesSearch && matchesRole;
    });
  }, [users, search, selectedRole]);

  // ───────────────── METRICS ─────────────────

  const totalUsers = users.length;

  const admins = users.filter((u) => u.role === "admin").length;

  const cashiers = users.filter((u) => u.role === "cashier").length;

  const customers = users.filter((u) => u.role === "customer").length;

  // ───────────────── MODAL ─────────────────

  const openAddModal = () => {
    setIsEditMode(false);

    setFormData({
      username: "",
      password: "",
      role: "cashier",
    });

    setIsModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setIsEditMode(true);

    setFormData({
      id: user.id,
      username: user.username,
      role: user.role,
      password: "",
    });

    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);

    setError(null);
  };

  // ───────────────── FORM ─────────────────

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  // ───────────────── SUBMIT ─────────────────

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      setLoading(true);

      setError(null);

      if (isEditMode && formData.id) {
        const payload: any = { ...formData };

        delete payload.id;

        if (!payload.password) {
          delete payload.password;
        }

        await userApi.update(formData.id, payload);
      } else {
        await userApi.add(formData as any);
      }

      closeModal();

      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to save user.");
    } finally {
      setLoading(false);
    }
  };

  // ───────────────── DELETE ─────────────────

  const handleDelete = async (id: number, username: string) => {
    const confirmDelete = window.confirm(
      `Delete user "${username}" permanently?`,
    );

    if (!confirmDelete) return;

    try {
      setLoading(true);

      await userApi.remove(id);

      fetchUsers();
    } catch (err: any) {
      setError(err.message || "Failed to delete user.");
    } finally {
      setLoading(false);
    }
  };

  // ───────────────── UI ─────────────────

  return (
    <div className="space-y-8">
      {/* HEADER */}

      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">User Management</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage system users, roles and permissions
          </p>
        </div>

        <button
          onClick={openAddModal}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition"
        >
          <PlusIcon className="h-5 w-5" />
          Add User
        </button>
      </div>

      {/* METRICS */}

      <div>
        <SectionHeader title="Users Overview" subtitle="Live user statistics" />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <MetricCard
            title="Total Users"
            value={totalUsers}
            subtitle="All registered accounts"
            icon={UsersIcon}
            iconBg="bg-blue-50"
            iconColor="text-blue-600"
          />

          <MetricCard
            title="Administrators"
            value={admins}
            subtitle="System administrators"
            icon={ShieldCheckIcon}
            iconBg="bg-red-50"
            iconColor="text-red-600"
          />

          <MetricCard
            title="Cashiers"
            value={cashiers}
            subtitle="Sales operators"
            icon={UserIcon}
            iconBg="bg-green-50"
            iconColor="text-green-600"
          />

          <MetricCard
            title="Customers"
            value={customers}
            subtitle="Customer accounts"
            icon={UsersIcon}
            iconBg="bg-indigo-50"
            iconColor="text-indigo-600"
          />
        </div>
      </div>

      {/* USERS TABLE */}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {/* TOP BAR */}

        <div className="p-5 border-b border-gray-100 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div>
            <h2 className="text-base font-semibold text-gray-800">
              System Users
            </h2>

            <p className="text-xs text-gray-400 mt-1">
              Search, filter and manage users
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            {/* SEARCH */}

            <div className="relative">
              <MagnifyingGlassIcon className="h-4 w-4 text-gray-400 absolute top-3 left-3" />

              <input
                type="text"
                placeholder="Search username..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 pr-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none w-full sm:w-64"
              />
            </div>

            {/* FILTER */}

            <select
              value={selectedRole}
              onChange={(e) => setSelectedRole(e.target.value)}
              className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            >
              <option value="all">All Roles</option>
              <option value="admin">Admin</option>
              <option value="cashier">Cashier</option>
              <option value="customer">Customer</option>
            </select>
          </div>
        </div>

        {/* ERROR */}

        {error && (
          <div className="mx-5 mt-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            <ExclamationTriangleIcon className="h-5 w-5" />
            {error}
          </div>
        )}

        {/* TABLE */}

        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Role
                </th>

                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  User ID
                </th>

                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-100">
              {loading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr key={index}>
                    <td colSpan={4}>
                      <SkeletonRow />
                    </td>
                  </tr>
                ))
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={4}>
                    <div className="flex flex-col items-center justify-center py-14 text-center">
                      <UsersIcon className="h-10 w-10 text-gray-300 mb-3" />

                      <p className="text-sm text-gray-500">No users found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredUsers.map((user) => {
                  const RoleIcon = roleStyles[user.role].icon;

                  return (
                    <tr key={user.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            <UserIcon className="h-5 w-5 text-gray-500" />
                          </div>

                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {user.username}
                            </p>

                            <p className="text-xs text-gray-400">
                              Active account
                            </p>
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold capitalize ${roleStyles[user.role].badge}`}
                        >
                          <RoleIcon className="h-3.5 w-3.5" />
                          {user.role}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-sm text-gray-500">
                        #{user.id}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openEditModal(user)}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-blue-50 hover:border-blue-200 transition"
                            title="Edit User"
                          >
                            <PencilSquareIcon className="h-4 w-4 text-blue-600" />
                          </button>

                          <button
                            onClick={() => handleDelete(user.id, user.username)}
                            className="p-2 rounded-lg border border-gray-200 hover:bg-red-50 hover:border-red-200 transition"
                            title="Delete User"
                          >
                            <TrashIcon className="h-4 w-4 text-red-600" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL */}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden">
            {/* HEADER */}

            <div className="px-6 py-5 border-b border-gray-100">
              <h2 className="text-lg font-semibold text-gray-900">
                {isEditMode ? "Edit User" : "Create New User"}
              </h2>

              <p className="text-sm text-gray-400 mt-1">
                Fill the required details below
              </p>
            </div>

            {/* FORM */}

            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                {/* USERNAME */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Username
                  </label>

                  <input
                    type="text"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    disabled={isEditMode}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:bg-gray-100"
                    placeholder="Enter username"
                  />
                </div>

                {/* PASSWORD */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {isEditMode ? "New Password (Optional)" : "Password"}
                  </label>

                  <input
                    type="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required={!isEditMode}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Enter password"
                  />
                </div>

                {/* ROLE */}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    User Role
                  </label>

                  <select
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  >
                    <option value="cashier">Cashier</option>
                    <option value="customer">Customer</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>

                {/* ERROR */}

                {error && (
                  <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}
              </div>

              {/* FOOTER */}

              <div className="px-6 py-4 border-t border-gray-100 flex items-center justify-end gap-3 bg-gray-50">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-100 transition"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition disabled:opacity-50"
                >
                  {loading
                    ? "Saving..."
                    : isEditMode
                      ? "Update User"
                      : "Create User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default UserManagement;
