/* ---------- USER & AUTH ---------- */
export interface User {
  id: number; // MySQL INT
  username: string;
  role: "admin" | "cashier"; // matches ENUM in DB
  createdAt: string; // ISO date string
  email?: string; // optional (not required in backend)
}

/* ---------- PRODUCTS ---------- */
export interface Product {
  id: number;
  name: string;
  category?: string;
  supplier?: string;
  unitPrice: number;
  stock: number;
  minStock?: number;
  maxStock?: number;
  createdAt: string;
}

/* ---------- SALES ---------- */
export interface Sale {
  id: number;
  productId: number;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  cashier: string;
  timestamp: string; // datetime from DB
  status?: "completed" | "refunded" | "pending"; // optional if not stored
}

/* ---------- SALES SUMMARY REPORT ---------- */
export interface SalesSummary {
  totalRevenue: number;
  totalQuantitySold: number;
  topProduct: string | null;
  salesCount: number;
  averageOrderValue: number;
}

/* ---------- STOCK ---------- */
export interface StockItem {
  id: number;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  category?: string;
  supplier?: string;
  lastRestocked?: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface StockReport {
  items: StockItem[];
  totalInventoryValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  reorderAlerts: StockItem[];
}

/* ---------- AUTH STATE (FRONTEND) ---------- */
export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

/* ---------- DASHBOARD METRICS ---------- */
export interface DashboardMetrics {
  todayRevenue: number;
  todaySales: number;
  monthRevenue: number;
  monthSales: number;
  inventoryValue: number;
  lowStockAlerts: number;
  revenueGrowth: number;
  salesGrowth: number;
}
