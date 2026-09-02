"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowRightLeft,
  ChartColumnBig,
  FolderKanban,
  LayoutDashboard,
  PiggyBank,
  WalletCards,
  ChevronRight,
} from "lucide-react";

import { PageBreadcrumb } from "@/components/layout/page-breadcrumb";
import { MobileNav } from "@/components/layout/mobile-nav";
import { UserMenu } from "@/components/layout/user-menu";
import { cn } from "@/lib/utils";

type DashboardShellProps = {
  userEmail?: string | null;
  children: ReactNode;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/transactions", label: "Transaksi", icon: ArrowRightLeft },
  { href: "/accounts", label: "Akun", icon: WalletCards },
  { href: "/categories", label: "Kategori", icon: FolderKanban },
  { href: "/budgets", label: "Anggaran", icon: ChartColumnBig },
  { href: "/savings-goals", label: "Tabungan", icon: PiggyBank },
];

export function DashboardShell({
  userEmail,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();

  const isActiveRoute = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const navContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-14 shrink-0 items-center border-b border-border/60 px-4">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
        >
          <div className="flex size-7 shrink-0 items-center justify-center rounded-md bg-primary/10 p-1 shadow-sm">
            <img src="/favicon.svg" alt="Catatan Keuangan" className="size-full" />
          </div>
          <span className="text-sm">Catatan Keuangan</span>
        </Link>
      </div>

      <div className="flex-1 overflow-y-auto py-2 px-2">
        <nav className="space-y-0.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group flex items-center gap-2 rounded-md px-2 py-1.5 text-xs font-medium transition-all duration-200",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-primary/5 hover:text-primary"
                )}
              >
                <div
                  className={cn(
                    "flex size-6 shrink-0 items-center justify-center rounded transition-colors duration-200",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "bg-muted text-muted-foreground group-hover:bg-primary/10 group-hover:text-primary"
                  )}
                >
                  <Icon className="size-3" />
                </div>
                <span className="flex-1 text-xs">{item.label}</span>
                {isActive && (
                  <ChevronRight className="size-3 text-primary/60" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto border-t border-border/60 p-3">
        <UserMenu userEmail={userEmail} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      <aside className="hidden w-[240px] shrink-0 border-r border-border/60 bg-card lg:block">
        {navContent}
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-4 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60 sm:px-6">
          <div className="lg:hidden">
            <MobileNav navContent={navContent} />
          </div>

          <div className="flex flex-1 items-center justify-between">
            <PageBreadcrumb pathname={pathname} />
          </div>
        </header>

        <main className="flex-1 p-4 sm:p-5 lg:p-6">
          <div className="mx-auto w-full max-w-7xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
