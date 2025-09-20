import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { Layout } from "./components/Layout/Layout";
import { LoginForm } from "./components/Login/LoginForm";
import { Dashboard } from "./pages/Dashboard";
import { Sales } from "./pages/Sales";
import { Inventory } from "./pages/Inventory";

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return isAuthenticated ? (
    <Layout>{children}</Layout>
  ) : (
    <Navigate to="/login" />
  );
};

const AppRoutes: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" /> : <LoginForm />}
      />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/sales"
        element={
          <ProtectedRoute>
            <Sales />
          </ProtectedRoute>
        }
      />
      <Route
        path="/inventory"
        element={
          <ProtectedRoute>
            <Inventory />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Reports</h2>
              <p className="mt-2 text-gray-600">
                Reports functionality coming soon...
              </p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/users"
        element={
          <ProtectedRoute>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">
                User Management
              </h2>
              <p className="mt-2 text-gray-600">
                User management functionality coming soon...
              </p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route
        path="/settings"
        element={
          <ProtectedRoute>
            <div className="text-center py-12">
              <h2 className="text-2xl font-bold text-gray-900">Settings</h2>
              <p className="mt-2 text-gray-600">
                Settings functionality coming soon...
              </p>
            </div>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
