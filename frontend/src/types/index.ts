export interface User {
  id: string;
  username: string;
  email: string;
  role: "Admin" | "Cashier";
  createdAt: string;
}

export interface Sale {
  id: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  cashier: string;
  timestamp: string;
  status: "completed" | "refunded" | "pending";
}

export interface SalesSummary {
  totalRevenue: number;
  totalQuantitySold: number;
  topProduct: string;
  salesCount: number;
  averageOrderValue: number;
}

export interface StockItem {
  id: string;
  productName: string;
  currentStock: number;
  minStockLevel: number;
  maxStockLevel: number;
  unitPrice: number;
  category: string;
  supplier: string;
  lastRestocked: string;
  status: "in_stock" | "low_stock" | "out_of_stock";
}

export interface StockReport {
  items: StockItem[];
  totalInventoryValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  reorderAlerts: StockItem[];
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
}

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
