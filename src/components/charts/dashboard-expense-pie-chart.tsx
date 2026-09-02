"use client";

import React from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatCurrencyIDR } from "@/lib/utils/format";

/** Palet warna yang jelas dan mudah dibedakan antar kategori */
const PALETTE = [
  "#f43f5e", // rose-500
  "#f97316", // orange-500
  "#eab308", // yellow-500
  "#84cc16", // lime-500
  "#10b981", // emerald-500
  "#06b6d4", // cyan-500
  "#3b82f6", // blue-500
  "#6366f1", // indigo-500
  "#8b5cf6", // violet-500
  "#d946ef", // fuchsia-500
  "#ec4899", // pink-500
  "#14b8a6", // teal-500
];

type PiePoint = {
  name: string;
  value: number;
  color?: string;
};

const RADIAN = Math.PI / 180;

type SliceLabelProps = {
  cx?: number;
  cy?: number;
  midAngle?: number;
  innerRadius?: number;
  outerRadius?: number;
  percent?: number;
};

/** Label persentase di tengah setiap slice; diabaikan jika < 5% agar tidak berantakan */
function SliceLabel(props: SliceLabelProps) {
  const {
    cx = 0,
    cy = 0,
    midAngle = 0,
    innerRadius = 0,
    outerRadius = 0,
    percent = 0,
  } = props;

  if (percent < 0.05) return null;

  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text
      x={x}
      y={y}
      fill="white"
      textAnchor="middle"
      dominantBaseline="central"
      className="text-[10px] font-bold"
    >
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

const CustomTooltip = ({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{
    name: string;
    value: number;
    payload: { color: string; percent: number };
  }>;
}) => {
  if (!active || !payload || !payload.length) return null;

  const entry = payload[0];
  return (
    <div className="rounded-xl border border-border/70 bg-popover px-3 py-2 shadow-lift">
      <div className="flex items-center gap-1.5 text-xs">
        <div
          className="size-2 rounded-full"
          style={{ backgroundColor: entry.payload.color }}
        />
        <span className="text-muted-foreground">{entry.name}:</span>
        <span className="font-bold text-foreground">
          {formatCurrencyIDR(entry.value)}
        </span>
        <span className="text-muted-foreground">
          ({(entry.payload.percent * 100).toFixed(1)}%)
        </span>
      </div>
    </div>
  );
};

export function DashboardExpensePieChart({
  data,
}: {
  data: PiePoint[];
}) {
  const total = data.reduce((sum, entry) => sum + entry.value, 0);

  const chartData = data.map((entry, index) => ({
    ...entry,
    color: PALETTE[index % PALETTE.length],
    percent: total > 0 ? entry.value / total : 0,
  }));

  return (
    <div className="space-y-4">
      <div className="relative h-[220px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              innerRadius={64}
              outerRadius={92}
              paddingAngle={3}
              cornerRadius={6}
              strokeWidth={0}
              /* eslint-disable-next-line @typescript-eslint/no-explicit-any --
                 Recharts label meneruskan props internal yang tidak diekspos tipenya */
              label={SliceLabel as any}
              labelLine={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
        {/* Label total di tengah donut */}
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
            Total
          </p>
          <p className="text-sm font-extrabold tracking-tight text-foreground">
            {formatCurrencyIDR(total)}
          </p>
        </div>
      </div>

      {/* Legend custom */}
      <ul className="grid grid-cols-1 gap-1.5">
        {chartData.slice(0, 5).map((entry) => (
          <li
            key={entry.name}
            className="flex items-center gap-2 text-xs"
          >
            <span
              className="size-2.5 shrink-0 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="min-w-0 flex-1 truncate text-muted-foreground">
              {entry.name}
            </span>
            <span className="font-bold text-foreground">
              {formatCurrencyIDR(entry.value)}
            </span>
          </li>
        ))}
        {chartData.length > 5 && (
          <li className="text-[11px] text-muted-foreground">
            +{chartData.length - 5} kategori lainnya
          </li>
        )}
      </ul>
    </div>
  );
}
