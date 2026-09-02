import Link from "next/link";
import { ChevronRight, House } from "lucide-react";

type PageBreadcrumbProps = {
  pathname: string;
};

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  accounts: "Akun",
  categories: "Kategori",
  transactions: "Transaksi",
  budgets: "Anggaran",
  "savings-goals": "Tabungan",
};

export function PageBreadcrumb({ pathname }: PageBreadcrumbProps) {
  const segments = pathname.split("/").filter(Boolean);

  const items = segments.map((segment, index) => {
    const href = `/${segments.slice(0, index + 1).join("/")}`;

    return {
      href,
      label: routeLabels[segment] ?? segment,
      isCurrent: index === segments.length - 1,
    };
  });

  return (
    <nav
      aria-label="Breadcrumb"
      className="flex flex-wrap items-center gap-1 text-[11px] text-muted-foreground"
    >
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1.5 rounded-md px-1.5 py-0.5 transition hover:bg-primary/5 hover:text-primary"
      >
        <House className="size-3" />
        Home
      </Link>

      {items.map((item) => (
        <span key={item.href} className="inline-flex items-center gap-1">
          <ChevronRight className="size-3 text-border" />
          {item.isCurrent ? (
            <span className="font-medium text-foreground">{item.label}</span>
          ) : (
            <Link
              href={item.href}
              className="rounded-md px-1.5 py-0.5 transition hover:bg-primary/5 hover:text-primary"
            >
              {item.label}
            </Link>
          )}
        </span>
      ))}
    </nav>
  );
}
