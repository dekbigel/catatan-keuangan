import { Badge } from "@/components/ui/badge";
import { getCategoryTypeMeta, type CategoryType } from "@/lib/utils/finance";
export function CategoryTypeBadge({ type }: { type: CategoryType }) {
  const item = getCategoryTypeMeta(type);
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
