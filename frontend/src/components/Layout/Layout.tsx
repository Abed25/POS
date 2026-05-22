import React from "react";
import { useAuth } from "../../contexts/AuthContext";
import { DashboardLayout } from "./DashboardLayout";
import { CustomerLayout } from "./CustomerLayout";

interface Props {
  children: React.ReactNode;
}

export const Layout: React.FC<Props> = ({ children }) => {
  const { user } = useAuth();

  if (user?.role === "customer") {
    return <CustomerLayout>{children}</CustomerLayout>;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
};
