import React, { createContext, useContext, useEffect, useReducer } from "react";
import { User, AuthState } from "../types";
import { authApi } from "../lib/api";

interface AuthContextType extends AuthState {
  login: (username: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "LOGIN_SUCCESS"; payload: { user: User; token: string } }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: User };

const authReducer = (
  state: AuthState & { loading: boolean },
  action: AuthAction
) => {
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
    case "SET_USER":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
      };
    default:
      return state;
  }
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, {
    user: null,
    isAuthenticated: false,
    token: null,
    loading: true,
  });

  useEffect(() => {
    const initializeAuth = async () => {
      const token = localStorage.getItem("auth_token");
      const userData = localStorage.getItem("user");

      if (token && userData) {
        try {
          const user = JSON.parse(userData);
          // Verify token is still valid
          await authApi.getCurrentUser();
          dispatch({ type: "LOGIN_SUCCESS", payload: { user, token } });
        } catch (error) {
          dispatch({ type: "LOGOUT" });
        }
      } else {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    initializeAuth();
  }, []);

  const login = async (username: string, password: string): Promise<void> => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      // For demo purposes, simulate login with mock credentials
      if (
        (username === "admin" && password === "admin123") ||
        (username === "cashier" && password === "cashier123")
      ) {
        const mockUser = {
          id: username === "admin" ? "1" : "2",
          username: username,
          email: `${username}@demo.com`,
          role:
            username === "admin" ? ("Admin" as const) : ("Cashier" as const),
          createdAt: new Date().toISOString(),
        };
        const mockToken = "demo-jwt-token-" + Date.now();

        dispatch({
          type: "LOGIN_SUCCESS",
          payload: { user: mockUser, token: mockToken },
        });
      } else {
        // Try actual API call for production
        const response = await authApi.login(username, password);
        dispatch({ type: "LOGIN_SUCCESS", payload: response as any });
      }
    } catch (error) {
      dispatch({ type: "SET_LOADING", payload: false });
      throw error;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await authApi.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
