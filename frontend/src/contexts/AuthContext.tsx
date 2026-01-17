import React, { createContext, useContext, useEffect, useReducer } from "react";
import type { User, AuthState } from "../types";
import axios from "axios";

// ----------------------------------------------------------------------
// Types & Interfaces
// ----------------------------------------------------------------------

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGOUT" };

// ----------------------------------------------------------------------
// Reducer
// ----------------------------------------------------------------------

const authReducer = (
  state: AuthState & { loading: boolean },
  action: AuthAction,
): AuthState & { loading: boolean } => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, loading: action.payload };
    case "LOGIN_SUCCESS":
      localStorage.setItem("auth_token", action.payload.token);
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        loading: false,
      };
    case "LOGOUT":
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user");
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        loading: false,
      };
    default:
      return state;
  }
};

// ----------------------------------------------------------------------
// Context & Provider
// ----------------------------------------------------------------------

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: true,
  });

  // 1. Restore Session on Mount
  useEffect(() => {
    const storedToken = localStorage.getItem("auth_token");
    const storedUser = localStorage.getItem("user");

    if (storedToken && storedUser) {
      try {
        const user: User = JSON.parse(storedUser);
        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user, token: storedToken },
        });
      } catch {
        // Corrupted data in local storage
        dispatch({ type: "LOGOUT" });
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // 2. Interceptor for Expired Tokens (401 Handling)
  useEffect(() => {
    const interceptorId = axios.interceptors.response.use(
      (response) => response, // Return successful responses as is
      (error) => {
        // Check for 401 Unauthorized (Token Expired)
        if (error.response && error.response.status === 401) {
          console.warn("Token expired or invalid. Logging out...");

          dispatch({ type: "LOGOUT" });

          // Prevent infinite reload loop if already on login page
          if (!window.location.pathname.includes("/login")) {
            window.location.href = "/login";
          }
        }
        return Promise.reject(error);
      },
    );

    // Cleanup: Remove interceptor when component unmounts
    return () => {
      axios.interceptors.response.eject(interceptorId);
    };
  }, []);

  // 3. Login Function
  const login = async (username: string, password: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const { data } = await axios.post(
        "https://pos-backend-three-sooty.vercel.app/api/auth/login",
        { username, password },
        { headers: { "Content-Type": "application/json" } },
      );

      // Build User object (adjust fields based on your actual API response)
      const user: User = {
        id: 0, // Placeholder if ID is not returned
        username,
        email: "", // Placeholder if not returned
        role: data.role as "admin" | "cashier" | "customer",
        business_id: 0,
        createdAt: new Date().toISOString(),
      };

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: { user, token: data.token },
      });
    } catch (err: any) {
      console.error("❌ Login failed:", err.response?.data || err.message);
      dispatch({ type: "SET_LOADING", payload: false });
      throw err;
    }
  };

  // 4. Logout Function
  const logout = (): void => {
    dispatch({ type: "LOGOUT" });
    if (!window.location.pathname.includes("/login")) {
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// ----------------------------------------------------------------------
// Hook
// ----------------------------------------------------------------------

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
