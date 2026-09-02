import type { ReactNode } from "react";
import Link from "next/link";
import {
  BarChart3,
  PiggyBank,
  Wallet,
  TrendingUp,
  Shield,
  Zap,
} from "lucide-react";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: AuthShellProps) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Panel kiri - branding (desktop) */}
      <div className="relative hidden w-1/2 flex-col justify-between overflow-hidden border-r border-border/60 p-10 lg:flex xl:p-14">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-primary to-teal-700 dark:from-emerald-800 dark:via-emerald-900 dark:to-teal-950" />
        <div className="absolute -left-20 top-1/4 size-80 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -right-10 bottom-1/4 size-64 rounded-full bg-black/10 blur-3xl" />

        <div className="relative z-10">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-bold tracking-tight text-white transition-opacity hover:opacity-85"
          >
            <div className="flex size-9 items-center justify-center rounded-xl bg-white/15 shadow-soft backdrop-blur-sm">
              <img src="/favicon.svg" alt="Catatan Keuangan" className="size-5" />
            </div>
            <span className="text-base font-extrabold">Catatan Keuangan</span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md">
          <div className="mb-2 flex items-center gap-2">
            <div className="h-px w-6 bg-white/60" />
            <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/80">
              {eyebrow}
            </p>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight text-white xl:text-3xl">
            {title}
          </h1>
          <p className="mt-3 text-sm leading-relaxed text-white/75">
            {description}
          </p>

          <div className="mt-10 space-y-5">
            {[
              {
                icon: Wallet,
                title: "Saldo lintas akun",
                description: "Pantau uang tunai, bank, e-wallet, dan tabungan.",
              },
              {
                icon: BarChart3,
                title: "Insight bulanan",
                description: "Ritme pemasukan dan pengeluaran jelas terlihat.",
              },
              {
                icon: PiggyBank,
                title: "Target tabungan",
                description: "Atur sasaran finansial dan cek progresnya.",
              },
            ].map((item) => {
              const Icon = item.icon;
              return (
                <div key={item.title} className="flex gap-3.5">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-white/15 shadow-soft backdrop-blur-sm">
                    <Icon className="size-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">
                      {item.title}
                    </h3>
                    <p className="mt-0.5 text-xs leading-relaxed text-white/70">
                      {item.description}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="relative z-10 flex items-center gap-5">
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/70">
            <Shield className="size-3.5" />
            <span>Supabase Auth</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/70">
            <Zap className="size-3.5" />
            <span>Next.js</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/70">
            <TrendingUp className="size-3.5" />
            <span>Real-time</span>
          </div>
        </div>
      </div>

      {/* Panel kanan - form */}
      <div className="flex w-full items-center justify-center p-5 sm:p-8 lg:w-1/2">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Link
              href="/"
              className="flex items-center justify-center gap-2.5 font-bold tracking-tight text-foreground"
            >
              <div className="flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-emerald-600 shadow-soft">
                <img src="/favicon.svg" alt="Catatan Keuangan" className="size-5" />
              </div>
              <span className="text-base font-extrabold">Catatan Keuangan</span>
            </Link>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
