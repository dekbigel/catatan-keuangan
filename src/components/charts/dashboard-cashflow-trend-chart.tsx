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
import { formatCompactCurrencyIDR, formatCurrencyIDR } from "@/lib/utils/format";

type TrendPoint = {
  label: string;
  net: number;
};

function formatCurrency(value: unknown) {
  const normalized = Array.isArray(value) ? value[0] : value;
  return formatCurrencyIDR(Number(normalized ?? 0));
}

const CustomTooltip = ({ active, payload, label }: {
  active?: boolean;
  payload?: Array<{ value: number }>;
  label?: string;
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="rounded-md border border-border bg-popover px-2.5 py-1.5 shadow-md">
      <p className="text-[11px] font-medium text-muted-foreground mb-0.5">{label}</p>
      <div className="flex items-center gap-1.5 text-[11px]">
        <div className="size-1.5 rounded-full bg-primary" />
        <span className="text-muted-foreground">Arus Kas Net:</span>
        <span className="font-semibold text-foreground">
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
  return (
    <div className="h-[180px] w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 4, left: 4, bottom: 4 }}>
          <defs>
            <linearGradient id="cashflowGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.25} />
              <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="hsl(var(--border))"
            opacity={0.5}
          />
          <XAxis
            dataKey="label"
            tickLine={false}
            axisLine={false}
            tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }}
            dy={6}
          />
          <YAxis
            tickFormatter={(value) => formatCompactCurrencyIDR(Number(value ?? 0))}
            tickLine={false}
            axisLine={false}
            width={70}
            tick={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="net"
            stroke="hsl(var(--primary))"
            fill="url(#cashflowGradient)"
            strokeWidth={2}
            dot={false}
            activeDot={{
              r: 4,
              fill: "hsl(var(--primary))",
              stroke: "hsl(var(--background))",
              strokeWidth: 2,
            }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
