import { Badge } from "@/components/ui/badge";
import { getBudgetStatusMeta, type BudgetStatus } from "@/lib/utils/finance";

export function BudgetStatusBadge({ status }: { status: BudgetStatus }) {
  const item = getBudgetStatusMeta(status);
  const Icon = item.icon;

  return (
    <Badge
      className={item.className}
      render={
        <span className="inline-flex items-center gap-1 rounded-full px-2">
          <Icon className="size-3" />
          {item.label}
        </span>
      }
    />
  );
}
