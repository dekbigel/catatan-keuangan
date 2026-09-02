import { Badge } from "@/components/ui/badge";
import {
  getSavingsGoalStatusMeta,
  type SavingsGoalStatus,
} from "@/lib/utils/finance";

export function SavingsGoalStatusBadge({
  status,
}: {
  status: SavingsGoalStatus;
}) {
  const item = getSavingsGoalStatusMeta(status);
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
