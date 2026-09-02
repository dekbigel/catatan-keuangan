import { Badge } from "@/components/ui/badge";
import { getAccountTypeMeta, type AccountType } from "@/lib/utils/finance";

export function AccountTypeBadge({ type }: { type: AccountType }) {
  const item = getAccountTypeMeta(type);
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
