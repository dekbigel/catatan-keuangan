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
        "group relative overflow-hidden border-border/60 bg-card transition-all duration-200 hover:shadow-sm",
        styles.gradient
      )}
    >
      <CardContent className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-muted-foreground leading-tight">
              {label}
            </p>
            <p className="mt-1 text-base font-bold tracking-tight text-foreground">
              {value}
            </p>
            <div className="mt-1 flex items-center gap-1">
              {trend && TrendIcon && (
                <TrendIcon
                  className={cn("size-3", trendConfig[trend].color)}
                />
              )}
              {trendValue && (
                <span
                  className={cn(
                    "text-[11px] font-medium",
                    trendConfig[trend ?? "neutral"].color
                  )}
                >
                  {trendValue}
                </span>
              )}
              <span className="text-[11px] text-muted-foreground">
                {helper}
              </span>
            </div>
          </div>
          <div
            className={cn(
              "flex size-8 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105",
              styles.iconBg
            )}
          >
            <Icon className={cn("size-4", styles.iconColor)} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
