import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type DataTableCardProps = {
  title: string;
  description?: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
};

export function DataTableCard({
  title,
  description,
  action,
  children,
  className,
}: DataTableCardProps) {
  return (
    <Card
      className={cn(
        "gap-0 overflow-hidden border-border/70 bg-card py-0 shadow-soft",
        className
      )}
    >
      <CardHeader className="flex flex-col gap-3 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle className="text-sm font-bold tracking-tight text-foreground sm:text-base">
            {title}
          </CardTitle>
          {description ? (
            <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
              {description}
            </p>
          ) : null}
        </div>
        {action ? <div className="shrink-0">{action}</div> : null}
      </CardHeader>
      <CardContent className="px-5 py-4">{children}</CardContent>
    </Card>
  );
}
