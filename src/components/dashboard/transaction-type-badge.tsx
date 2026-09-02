import { getTransactionTypeMeta, type TransactionType } from "@/lib/utils/finance";
import { cn } from "@/lib/utils";

export function TransactionTypeBadge({
  type,
}: {
  type: TransactionType;
}) {
  const item = getTransactionTypeMeta(type);
  const Icon = item.icon;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        type === "income" &&
        "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
        type === "expense" &&
        "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
        type === "transfer" &&
        "bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400"
      )}
    >
      <Icon className="size-3" />
      {item.label}
    </span>
  );
}
