// ✅ Adjust BASE URL to your backend
const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const getToken = (): string | null => localStorage.getItem("auth_token");

async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  const res = await fetch(url, config);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new ApiError(res.status, err.message || res.statusText);
  }
  return res.json();
}

/* ---------- AUTH ---------- */
export const authApi = {
  login: (username: string, password: string) =>
    apiRequest<{ user: any; token: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    }),

  register: (data: { username: string; password: string; role: string }) =>
    apiRequest("/auth/register", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  getCurrentUser: () => apiRequest("/auth/me"),
};

/* ---------- PRODUCTS ---------- */
export const productApi = {
  getAll: () => apiRequest("/products"),
  getById: (id: number) => apiRequest(`/products/${id}`),
  getSummary: () => apiRequest("/products/summary"),
  add: (data: any) =>
    apiRequest("/products", { method: "POST", body: JSON.stringify(data) }),
  update: (id: number, data: any) =>
    apiRequest(`/products/${id}`, {
      method: "PUT",
      body: JSON.stringify(data),
    }),
  patch: (id: number, data: any) =>
    apiRequest(`/products/${id}`, {
      method: "PATCH",
      body: JSON.stringify(data),
    }),
  remove: (id: number) => apiRequest(`/products/${id}`, { method: "DELETE" }),
};

/* ---------- SALES ---------- */
export const salesApi = {
  list: (from?: string, to?: string) => {
    const params = new URLSearchParams();
    if (from) params.append("from", from);
    if (to) params.append("to", to);
    return apiRequest(`/sales?${params.toString()}`);
  },
  create: (data: any) =>
    apiRequest("/sales", { method: "POST", body: JSON.stringify(data) }),
  getById: (id: number) => apiRequest(`/sales/${id}`),
};

/* ---------- REPORTS ---------- */
export const reportApi = {
  salesSummary: (from: string, to: string) => {
    const params = new URLSearchParams({ from, to });
    return apiRequest(`/reports/sales?${params.toString()}`);
  },
  stockSummary: () => apiRequest("/reports/stock"),
};

/* ---------- STOCK ---------- */
export const stockApi = {
  lowStock: () => apiRequest("/stock/alerts"), // if implemented
  stockReport: () => apiRequest("/stock/report"), // if implemented
};
