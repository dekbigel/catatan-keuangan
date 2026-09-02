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
  Plus,
} from "lucide-react";

import { UserMenu } from "@/components/layout/user-menu";
import { ThemeToggle } from "@/components/layout/theme-toggle";
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

// Urutan untuk bottom nav mobile (5 slot + FAB di tengah)
const mobileNavItems = [
  navItems[0], // Dashboard
  navItems[1], // Transaksi
  navItems[2], // Akun
  navItems[4], // Anggaran
  navItems[5], // Tabungan
];

function BrandMark({ compact = false }: { compact?: boolean }) {
  return (
    <Link
      href="/dashboard"
      className="flex items-center gap-2.5 font-bold tracking-tight text-foreground transition-opacity hover:opacity-80"
    >
      <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 text-primary-foreground shadow-soft">
        <img src="/favicon.svg" alt="Catatan Keuangan" className="size-5" />
      </div>
      {!compact && (
        <div className="leading-tight">
          <span className="block text-sm font-extrabold">Catatan Keuangan</span>
          <span className="block text-[11px] font-medium text-muted-foreground">
            Kelola uang, capai target
          </span>
        </div>
      )}
    </Link>
  );
}

export function DashboardShell({
  userEmail,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();

  const isActiveRoute = (href: string) =>
    pathname === href || (href !== "/dashboard" && pathname.startsWith(href));

  const sidebarContent = (
    <div className="flex h-full flex-col">
      <div className="flex h-20 shrink-0 items-center px-5">
        <BrandMark />
      </div>

      <div className="flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/70">
          Menu Utama
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isActiveRoute(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "group relative flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  isActive
                    ? "bg-accent text-accent-foreground shadow-soft"
                    : "text-sidebar-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <span
                  className={cn(
                    "absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-primary transition-all duration-200",
                    isActive ? "opacity-100 scale-y-100" : "opacity-0 scale-y-0"
                  )}
                />
                <div
                  className={cn(
                    "flex size-8 shrink-0 items-center justify-center rounded-lg transition-all duration-200",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-soft"
                      : "bg-muted text-muted-foreground group-hover:bg-accent group-hover:text-accent-foreground"
                  )}
                >
                  <Icon className="size-4" />
                </div>
                <span className="flex-1">{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="mt-auto space-y-2 border-t border-sidebar-border p-3">
        <UserMenu userEmail={userEmail} />
      </div>
    </div>
  );

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Sidebar desktop */}
      <aside className="hidden w-[264px] shrink-0 border-r border-sidebar-border bg-sidebar lg:block">
        <div className="sticky top-0 h-screen">{sidebarContent}</div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="safe-top sticky top-0 z-30 flex h-16 shrink-0 items-center gap-3 border-b border-border/60 bg-background/80 px-4 backdrop-blur-xl supports-[backdrop-filter]:bg-background/70 sm:px-6">
          <div className="lg:hidden">
            <BrandMark compact />
          </div>
          <div className="hidden lg:block">
            <p className="text-sm font-semibold text-foreground">
              {navItems.find((item) => isActiveRoute(item.href))?.label ?? "Dashboard"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric",
              })}
            </p>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <ThemeToggle />
            <div className="lg:hidden">
              <UserMenu userEmail={userEmail} variant="avatar" />
            </div>
          </div>
        </header>

        {/* Konten utama - padding bawah ekstra untuk bottom nav mobile */}
        <main className="flex-1 p-4 pb-28 sm:p-6 sm:pb-28 lg:p-8 lg:pb-8">
          <div className="mx-auto w-full max-w-6xl">{children}</div>
        </main>
      </div>

      {/* Bottom navigation mobile */}
      <nav
        aria-label="Navigasi utama"
        className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-border/60 bg-background/85 backdrop-blur-xl supports-[backdrop-filter]:bg-background/75 lg:hidden"
      >
        <div className="mx-auto flex max-w-md items-stretch justify-between px-2">
          {mobileNavItems.slice(0, 2).map((item) => (
            <MobileNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActiveRoute(item.href)}
            />
          ))}
          {/* Slot tengah untuk FAB global */}
          <div className="w-14 shrink-0" aria-hidden />
          {mobileNavItems.slice(2).map((item) => (
            <MobileNavItem
              key={item.href}
              href={item.href}
              label={item.label}
              icon={item.icon}
              active={isActiveRoute(item.href)}
            />
          ))}
        </div>
      </nav>
    </div>
  );
}

function MobileNavItem({
  href,
  label,
  icon: Icon,
  active,
}: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex min-w-14 flex-1 flex-col items-center justify-center gap-1 py-2 text-[10px] font-medium transition-colors",
        active ? "text-primary" : "text-muted-foreground hover:text-foreground"
      )}
    >
      <span
        className={cn(
          "flex size-9 items-center justify-center rounded-full transition-all duration-200",
          active && "bg-accent"
        )}
      >
        <Icon className={cn("size-5", active && "stroke-[2.2]")} />
      </span>
      <span className="leading-none">{label}</span>
    </Link>
  );
}

/** FAB hijau yang ditempatkan di tengah bottom nav (dipanggil dari halaman) */
export function MobileFabSlot({ children }: { children: ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-50 mx-auto flex max-w-md justify-center lg:hidden">
      <div className="pointer-events-auto -translate-y-5">{children}</div>
    </div>
  );
}

export { Plus as FabPlusIcon };
