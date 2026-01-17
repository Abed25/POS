import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const data = [
  { name: "Electronics", revenue: 892000, fill: "hsl(217, 91%, 45%)" },
  { name: "Apparel", revenue: 654000, fill: "hsl(217, 91%, 55%)" },
  { name: "Home & Garden", revenue: 523000, fill: "hsl(217, 91%, 65%)" },
  { name: "Food & Bev", revenue: 412000, fill: "hsl(217, 91%, 75%)" },
  { name: "Sports", revenue: 366000, fill: "hsl(217, 91%, 85%)" },
];

export function ProductChart() {
  return (
    <div
      className="chart-container animate-fade-in w-full h-[400px]"
      style={{ animationDelay: "400ms" }}
    >
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-foreground">
          Product Performance
        </h3>
        <p className="text-sm text-muted-foreground">Revenue by category</p>
      </div>

      {/* FIX: Wrapper with explicit height ensures ResponsiveContainer works */}
      <div className="h-[300px] w-full min-h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            layout="vertical"
            margin={{ left: 20, right: 30 }}
          >
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(220, 13%, 91%)"
              horizontal={false}
              vertical={true}
            />
            <XAxis
              type="number"
              stroke="hsl(220, 10%, 46%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => `$${value / 1000}k`}
            />
            <YAxis
              type="category"
              dataKey="name"
              stroke="hsl(220, 10%, 46%)"
              fontSize={12}
              tickLine={false}
              axisLine={false}
              width={100}
            />
            <Tooltip
              cursor={{ fill: "transparent" }}
              contentStyle={{
                backgroundColor: "hsl(0, 0%, 100%)",
                border: "1px solid hsl(220, 13%, 91%)",
                borderRadius: "8px",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              }}
              formatter={(value: any) => [
                `$${Number(value).toLocaleString()}`,
                "Revenue",
              ]}
            />
            <Bar dataKey="revenue" radius={[0, 4, 4, 0]} barSize={32}>
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
