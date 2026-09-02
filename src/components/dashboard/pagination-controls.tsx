import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type PaginationControlsProps = {
  page: number;
  totalPages: number;
  totalCount: number;
  basePath: string;
  searchParams: Record<string, string>;
};

function createPageHref(
  basePath: string,
  searchParams: Record<string, string>,
  page: number,
) {
  const params = new URLSearchParams(searchParams);

  if (page <= 1) {
    params.delete("page");
  } else {
    params.set("page", String(page));
  }

  const query = params.toString();

  return query ? `${basePath}?${query}` : basePath;
}

export function PaginationControls({
  page,
  totalPages,
  totalCount,
  basePath,
  searchParams,
}: PaginationControlsProps) {
  return (
    <div className="flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-xs text-muted-foreground">
        Halaman {page} dari {totalPages} | {totalCount} transaksi ditemukan
      </p>
      <div className="flex items-center gap-2">
        <Link
          href={createPageHref(basePath, searchParams, page - 1)}
          aria-disabled={page <= 1}
          tabIndex={page <= 1 ? -1 : undefined}
          className={cn(
            buttonVariants({
              variant: "outline",
              size: "sm",
              className: "h-7 rounded-lg text-[11px]",
            }),
            page <= 1 && "pointer-events-none opacity-50",
          )}
        >
          <ChevronLeft className="size-3.5" />
          Sebelumnya
        </Link>
        <Link
          href={createPageHref(basePath, searchParams, page + 1)}
          aria-disabled={page >= totalPages}
          tabIndex={page >= totalPages ? -1 : undefined}
          className={cn(
            buttonVariants({
              variant: "outline",
              size: "sm",
              className: "h-7 rounded-lg text-[11px]",
            }),
            page >= totalPages && "pointer-events-none opacity-50",
          )}
        >
          Berikutnya
          <ChevronRight className="size-3.5" />
        </Link>
      </div>
    </div>
  );
}
