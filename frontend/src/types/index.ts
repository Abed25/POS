/* ---------- USER & AUTH ---------- */
export interface User {
  id: number; // MySQL INT
  username: string;
  role: "admin" | "cashier" | "customer"; // matches ENUM in DB** // 🔑 NEW: Include business_id for multi-tenancy context
  business_id: number;
  createdAt: string; // ISO date string
  email?: string; // optional (not required in backend)
}

/* ---------- PRODUCTS ---------- */
export interface Product {
  id: number;
  name: string;
  description?: string;
  price: number; // maps to decimal(10,2)
  cost_price: number;
  stock: number;
  category?: string;
  sku?: string;
  created_at: string; // timestamp -> string
  updated_at: string; // timestamp -> string
  max_stock?: number;
  supplier?: string | null;
}

export interface ProductMetrics {
  product_count: number;
  total_stock_value: number; // Keep as string or convert to number, depending on how you want to handle it
}

/* ---------- SALES ---------- */
export interface Sale {
  id: number;
  // product_id is missing from API, but if you re-add it:
  // product_id?: number;

  product_name: string;
  quantity: number;

  // unit_price can be null from the database
  unit_price: number | string | null;

  // total_price is returned as a string
  total_price: string;

  // seller is returned instead of cashier
  seller: string;

  // sale_date is returned instead of timestamp
  sale_date: string;

  // status is optional/missing from API
  status?: "completed" | "refunded" | "pending";

  receipt_number: number | null;
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
