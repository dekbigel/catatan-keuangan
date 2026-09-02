import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type Trend = "up" | "down" | "neutral";

type SummaryCardProps = {
  label: string;
  value: string;
  helper: string;
  icon: LucideIcon;
  trend?: Trend;
  trendValue?: string;
  variant?: "default" | "income" | "expense" | "balance" | "savings";
};

const variantStyles = {
  default: {
    iconBg: "bg-secondary",
    iconColor: "text-secondary-foreground",
    gradient: "",
  },
  income: {
    iconBg: "bg-emerald-500/10",
    iconColor: "text-emerald-600 dark:text-emerald-400",
    gradient: "gradient-income",
  },
  expense: {
    iconBg: "bg-rose-500/10",
    iconColor: "text-rose-600 dark:text-rose-400",
    gradient: "gradient-expense",
  },
  balance: {
    iconBg: "bg-primary/10",
    iconColor: "text-primary",
    gradient: "gradient-balance",
  },
  savings: {
    iconBg: "bg-amber-500/10",
    iconColor: "text-amber-600 dark:text-amber-400",
    gradient: "gradient-savings",
  },
};

const trendConfig = {
  up: { icon: TrendingUp, color: "text-emerald-600 dark:text-emerald-400" },
  down: { icon: TrendingDown, color: "text-rose-600 dark:text-rose-400" },
  neutral: { icon: Minus, color: "text-muted-foreground" },
};

export function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
  trend,
  trendValue,
  variant = "default",
}: SummaryCardProps) {
  const styles = variantStyles[variant];
  const TrendIcon = trend ? trendConfig[trend].icon : null;

  return (
    <Card
      className={cn(
        "group relative gap-0 overflow-hidden border-border/70 bg-card py-0 shadow-soft transition-all duration-200 hover:shadow-lift",
        styles.gradient
      )}
    >
      <CardContent className="p-4 sm:p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold leading-tight text-muted-foreground">
              {label}
            </p>
            <p className="mt-1.5 truncate text-lg font-extrabold tracking-tight text-foreground sm:text-xl">
              {value}
            </p>
            <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
              {trend && TrendIcon && (
                <span
                  className={cn(
                    "inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-semibold",
                    trend === "up" &&
                      "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
                    trend === "down" &&
                      "bg-rose-500/10 text-rose-700 dark:text-rose-400",
                    trend === "neutral" && "bg-muted text-muted-foreground"
                  )}
                >
                  <TrendIcon className="size-3" />
                  {trendValue ?? ""}
                </span>
              )}
              <span className="text-xs text-muted-foreground">{helper}</span>
            </div>
          </div>
          <div
            className={cn(
              "flex size-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105",
              styles.iconBg
            )}
          >
            <Icon className={cn("size-5", styles.iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
