"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useChartTheme } from "@/components/charts/use-chart-theme";
import { formatCompactCurrencyIDR, formatCurrencyIDR } from "@/lib/utils/format";

type TrendPoint = {
  label: string;
  net: number;
};

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-xl border border-border/70 bg-popover px-3 py-2 shadow-lift">
      <p className="mb-0.5 text-[11px] font-medium text-muted-foreground">{label}</p>
      <div className="flex items-center gap-1.5 text-xs">
        <div className="size-2 rounded-full bg-primary" />
        <span className="text-muted-foreground">Arus Kas Net:</span>
        <span className="font-bold text-foreground">
          {formatCurrencyIDR(payload[0].value)}
        </span>
      </div>
    </div>
  );
};

export function DashboardCashflowTrendChart({
  data,
}: {
  data: TrendPoint[];
}) {
  const theme = useChartTheme();

  return (
    <div className="h-[220px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 4, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="cashflowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={theme.primary} stopOpacity={0.25} />
              <stop offset="95%" stopColor={theme.primary} stopOpacity={0.02} />
            </linearGradient>
          </defs>
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
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="net"
            stroke={theme.primary}
            fill="url(#cashflowGradient)"
            strokeWidth={2.5}
            dot={false}
            activeDot={{
              r: 5,
              fill: theme.primary,
              stroke: "var(--background)",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
