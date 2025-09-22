import React, { createContext, useContext, useEffect, useReducer } from "react";
import type { User, AuthState } from "../types";
import axios from "axios";

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  loading: boolean;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGOUT" };

const authReducer = (
  state: AuthState & { loading: boolean },
  action: AuthAction
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

  // Restore session on mount
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
        dispatch({ type: "LOGOUT" });
      }
    } else {
      dispatch({ type: "SET_LOADING", payload: false });
    }
  }, []);

  // ✅ Corrected login function
  const login = async (username: string, password: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/auth/login",
        { username, password },
        { headers: { "Content-Type": "application/json" } }
      );

      // Build a minimal User object to satisfy the context
      const user: User = {
        id: 0, // backend doesn't send an id, placeholder is fine
        username,
        email: "",
        role: data.role as "admin" | "cashier",
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

  const logout = (): void => {
    dispatch({ type: "LOGOUT" });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
};
