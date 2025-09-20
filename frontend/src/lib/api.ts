import { StockItem, Sale } from "../types";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:3000/api";

class ApiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
    this.name = "ApiError";
  }
}

const getAuthToken = (): string | null => {
  return localStorage.getItem("auth_token");
};

const apiRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new ApiError(
        response.status,
        errorData.message || `HTTP ${response.status}: ${response.statusText}`
      );
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new Error("Network error occurred");
  }
};

export const authApi = {
  login: async (username: string, password: string) => {
    return apiRequest("/auth/login", {
      method: "POST",
      body: JSON.stringify({ username, password }),
    });
  },

  logout: async () => {
    return apiRequest("/auth/logout", { method: "POST" });
  },

  getCurrentUser: async () => {
    return apiRequest("/auth/me");
  },
};

export const salesApi = {
  getSales: async (from?: string, to?: string, page = 1, limit = 20) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(from && { from }),
      ...(to && { to }),
    });
    return apiRequest(`/sales?${params}`);
  },

  createSale: async (saleData: Partial<Sale>) => {
    return apiRequest("/sales", {
      method: "POST",
      body: JSON.stringify(saleData),
    });
  },

  updateSale: async (id: string, saleData: Partial<Sale>) => {
    return apiRequest(`/sales/${id}`, {
      method: "PUT",
      body: JSON.stringify(saleData),
    });
  },

  deleteSale: async (id: string) => {
    return apiRequest(`/sales/${id}`, { method: "DELETE" });
  },

  getDashboardMetrics: async () => {
    return apiRequest("/sales/dashboard-metrics");
  },

  getRevenueChart: async (period: "7d" | "30d" | "90d" = "30d") => {
    return apiRequest(`/sales/chart?period=${period}`);
  },
};

export const stockApi = {
  getStockReport: async () => {
    return apiRequest("/stock/report");
  },

  getStockItems: async (page = 1, limit = 20, category?: string) => {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      ...(category && { category }),
    });
    return apiRequest(`/stock?${params}`);
  },

  updateStock: async (id: string, stockData: Partial<StockItem>) => {
    return apiRequest(`/stock/${id}`, {
      method: "PUT",
      body: JSON.stringify(stockData),
    });
  },

  addStock: async (stockData: Partial<StockItem>) => {
    return apiRequest("/stock", {
      method: "POST",
      body: JSON.stringify(stockData),
    });
  },

  deleteStock: async (id: string) => {
    return apiRequest(`/stock/${id}`, { method: "DELETE" });
  },

  getLowStockAlerts: async () => {
    return apiRequest("/stock/alerts");
  },
};

export const reportsApi = {
  generateSalesReport: async (
    from: string,
    to: string,
    format: "pdf" | "csv" = "pdf"
  ) => {
    const params = new URLSearchParams({ from, to, format });
    return apiRequest(`/reports/sales?${params}`);
  },

  generateStockReport: async (format: "pdf" | "csv" = "pdf") => {
    return apiRequest(`/reports/stock?format=${format}`);
  },
};
