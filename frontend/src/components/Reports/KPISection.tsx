import { useEffect, useState } from "react";
import { KPICard } from "./KPICard";
import {
  DollarSign,
  TrendingUp,
  ShoppingCart,
  Calculator,
  Package,
  Users,
} from "lucide-react";
import { kpisApi } from "../../lib/api";
import type { KPI } from "../../types/index";

/* icon mapping stays simple */
const iconMap = {
  dollar_sign: <DollarSign className="h-5 w-5 text-primary" />,
  trending_up: <TrendingUp className="h-5 w-5 text-success" />,
  shopping_cart: <ShoppingCart className="h-5 w-5 text-warning" />,
  calculator: <Calculator className="h-5 w-5 text-primary" />,
  package: <Package className="h-5 w-5 text-muted-foreground" />,
  users: <Users className="h-5 w-5 text-success" />,
};

export function KPISection() {
  const [kpis, setKpis] = useState<any[]>([]);

  useEffect(() => {
    kpisApi.getAll().then((data: KPI[]) => {
      const mapped = data.map((item: KPI) => ({
        title: item.title,
        value: item.currency
          ? `${item.currency} ${item.value.toLocaleString()}`
          : item.value.toLocaleString(),
        trend: item.trend,
        trendLabel: item.period,
        icon: iconMap[item.icon_key],
      }));

      setKpis(mapped);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {kpis.map((kpi, index) => (
        <KPICard key={kpi.title} {...kpi} delay={index * 50} />
      ))}
    </div>
  );
}
