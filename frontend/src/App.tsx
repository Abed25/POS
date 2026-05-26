// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";

// import { SnackbarProvider } from "notistack";
// import { AuthProvider, useAuth } from "./contexts/AuthContext";
// import { MetricsRefreshProvider } from "./contexts/MetricsRefreshContext.tsx";
// import { Layout } from "./components/Layout/Layout";

// import { LoginForm } from "./components/Login/LoginForm";
// import { Dashboard } from "./pages/Dashboard";
// import { Sales } from "./pages/Sales";
// import { Inventory } from "./pages/Inventory";
// import UserProducts from "./pages/userProducts.tsx";
// import UserManagement from "./pages/userManagement.tsx";
// import Report from "./pages/Reports.tsx";
// import Test from "./pages/Test";

// import { User } from "./types/index.ts";

// /* =========================
//    PROTECTED ROUTE (RBAC)
// ========================= */
// const ProtectedRoute: React.FC<{
//   children: React.ReactNode;
//   allowedRoles?: User["role"][];
// }> = ({ children, allowedRoles }) => {
//   const { isAuthenticated, loading, user } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
//       </div>
//     );
//   }

//   if (!isAuthenticated) {
//     return <Navigate to="/login" replace />;
//   }

//   const role = user?.role;

//   // If role restriction exists, enforce it
//   if (allowedRoles?.length && (!role || !allowedRoles.includes(role))) {
//     return <Navigate to="/" replace />;
//   }

//   return <Layout>{children}</Layout>;
// };

// /* =========================
//    ROUTES
// ========================= */
// const AppRoutes: React.FC = () => {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center">
//         <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600" />
//       </div>
//     );
//   }

//   return (
//     <Routes>
//       {/* LOGIN */}
//       <Route
//         path="/login"
//         element={isAuthenticated ? <Navigate to="/" replace /> : <LoginForm />}
//       />

//       {/* DASHBOARD (ADMIN + CASHIER) */}
//       <Route
//         path="/"
//         element={
//           <ProtectedRoute allowedRoles={["admin", "cashier", "customer"]}>
//             <Dashboard />
//           </ProtectedRoute>
//         }
//       />

//       {/* SALES (ADMIN + CASHIER ONLY) */}
//       <Route
//         path="/sales"
//         element={
//           <ProtectedRoute allowedRoles={["admin", "cashier"]}>
//             <Sales />
//           </ProtectedRoute>
//         }
//       />

//       {/* INVENTORY (ADMIN ONLY) */}
//       <Route
//         path="/inventory"
//         element={
//           <ProtectedRoute allowedRoles={["admin"]}>
//             <Inventory />
//           </ProtectedRoute>
//         }
//       />

//       {/* PRODUCTS (ALL ROLES) */}
//       <Route
//         path="/products"
//         element={
//           <ProtectedRoute allowedRoles={["admin", "cashier", "customer"]}>
//             <UserProducts />
//           </ProtectedRoute>
//         }
//       />

//       {/* REPORTS (ADMIN ONLY) */}
//       <Route
//         path="/reports"
//         element={
//           <ProtectedRoute allowedRoles={["admin"]}>
//             <Report />
//           </ProtectedRoute>
//         }
//       />

//       {/* USERS (ADMIN ONLY) */}
//       <Route
//         path="/users"
//         element={
//           <ProtectedRoute allowedRoles={["admin"]}>
//             <UserManagement />
//           </ProtectedRoute>
//         }
//       />

//       {/* TEST (ADMIN ONLY OR REMOVE IN PRODUCTION) */}
//       <Route
//         path="/test"
//         element={
//           <ProtectedRoute allowedRoles={["admin"]}>
//             <Test />
//           </ProtectedRoute>
//         }
//       />

//       {/* SETTINGS (ADMIN ONLY) */}
//       <Route
//         path="/settings"
//         element={
//           <ProtectedRoute allowedRoles={["admin"]}>
//             <div className="text-center py-12">
//               <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
//               <p className="mt-2 text-gray-600">
//                 Settings functionality coming soon...
//               </p>
//             </div>
//           </ProtectedRoute>
//         }
//       />

//       {/* FALLBACK */}
//       <Route path="*" element={<Navigate to="/" replace />} />
//     </Routes>
//   );
// };

// /* =========================
//    APP WRAPPER
// ========================= */
// function App() {
//   return (
//     <SnackbarProvider
//       maxSnack={4}
//       anchorOrigin={{ vertical: "top", horizontal: "right" }}
//     >
//       <AuthProvider>
//         <MetricsRefreshProvider>
//           <Router>
//             <AppRoutes />
//           </Router>
//         </MetricsRefreshProvider>
//       </AuthProvider>
//     </SnackbarProvider>
//   );
// }

// export default App;

import SystemThankYouPage from "./pages/Test";

export default function App() {
  return <SystemThankYouPage />;
}
