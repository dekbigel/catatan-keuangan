"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChartTheme } from "@/components/charts/use-chart-theme";
import { formatCompactCurrencyIDR, formatCurrencyIDR } from "@/lib/utils/format";

type ChartPoint = {
  label: string;
  income: number;
  expense: number;
};

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ name: string; value: number; color: string }>;
  label?: string;
}) => {
  if (!active || !payload) return null;

  return (
    <div className="rounded-xl border border-border/70 bg-popover px-3 py-2 shadow-lift">
      <p className="mb-1 text-[11px] font-medium text-muted-foreground">{label}</p>
      {payload.map((entry, index) => (
        <div key={index} className="flex items-center gap-1.5 text-xs">
          <div
            className="size-2 rounded-full"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-muted-foreground">{entry.name}:</span>
          <span className="font-bold text-foreground">
            {formatCurrencyIDR(entry.value)}
          </span>
        </div>
      ))}
    </div>
  );
};

export function DashboardMonthlyComparisonChart({
  data,
}: {
  data: ChartPoint[];
}) {
  const theme = useChartTheme();

  return (
    <div className="h-[240px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barGap={4} barCategoryGap="24%">
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke={theme.border}
            opacity={0.6}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: theme.mutedForeground }}
            dy={6}
          />
          <YAxis
            tickFormatter={(value) => formatCompactCurrencyIDR(Number(value ?? 0))}
            tickLine={false}
            axisLine={false}
            width={64}
            tick={{ fontSize: 10, fill: theme.mutedForeground }}
          />
          <Tooltip content={<CustomTooltip />} cursor={{ fill: theme.border, opacity: 0.25 }} />
          <Legend
            iconType="circle"
            iconSize={7}
            wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
          />
          <Bar
            dataKey="income"
            name="Pemasukan"
            fill={theme.income}
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
          <Bar
            dataKey="expense"
            name="Pengeluaran"
            fill={theme.expense}
            radius={[6, 6, 0, 0]}
            maxBarSize={36}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
