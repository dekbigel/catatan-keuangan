import Link from "next/link";
import {
  ArrowRight,
  ArrowDownLeft,
  ArrowUpRight,
  ArrowRightLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Sparkles,
  TriangleAlert,
  CalendarClock,
} from "lucide-react";

import { DashboardExpensePieChart } from "@/components/charts/dashboard-expense-pie-chart";
import { DashboardMonthlyComparisonChart } from "@/components/charts/dashboard-monthly-comparison-chart";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageFab } from "@/components/dashboard/page-fab";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { TransactionFormDialog } from "@/components/forms/transaction-form-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import { getDashboardData } from "@/lib/queries/dashboard";
import { formatCurrencyIDR, formatDateID } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const transactionTone = {
  income: {
    icon: ArrowUpRight,
    amountClass: "text-emerald-600 dark:text-emerald-400",
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
    prefix: "+",
  },
  expense: {
    icon: ArrowDownLeft,
    amountClass: "text-rose-600 dark:text-rose-400",
    iconBg: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
    prefix: "-",
  },
  transfer: {
    icon: ArrowRightLeft,
    amountClass: "text-blue-600 dark:text-blue-400",
    iconBg: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    prefix: "",
  },
} as const;

const insightTone = {
  default: {
    icon: Sparkles,
    iconBg: "bg-primary/10 text-primary",
  },
  positive: {
    icon: TrendingUp,
    iconBg: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  },
  warning: {
    icon: TriangleAlert,
    iconBg: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  },
} as const;

export default async function DashboardPage() {
  const result = await getDashboardData()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({
      data: null,
      error: error instanceof Error ? error.message : "Gagal memuat dashboard.",
    }));

  const header = (
    <PageHeader
      eyebrow="Ringkasan"
      title="Dashboard"
      description="Pantau arus kas, distribusi pengeluaran, dan kesehatan finansial Anda."
    />
  );

  if (result.error || !result.data) {
    return (
      <div className="space-y-6">
        {header}
        <ErrorState description={result.error ?? "Gagal memuat dashboard."} />
      </div>
    );
  }

  const {
    summary,
    charts,
    recentTransactions,
    insights,
    accounts,
    incomeCategories,
    expenseCategories,
  } = result.data;

  const remainingPositive = summary.remainingThisMonth >= 0;

  return (
    <div className="space-y-6">
      {header}

      {/* Hero: Total Saldo */}
      <Card className="relative gap-0 overflow-hidden border-none py-0 text-primary-foreground shadow-lift">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 via-primary to-teal-700 dark:from-emerald-700 dark:via-emerald-800 dark:to-teal-900" />
        <div className="absolute -right-16 -top-24 size-64 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute -bottom-24 -left-10 size-56 rounded-full bg-black/10 blur-3xl" />
        <CardContent className="relative p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="min-w-0">
              <div className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-[11px] font-semibold backdrop-blur-sm">
                <Wallet className="size-3.5" />
                Total Saldo Seluruh Akun
              </div>
              <p className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">
                {formatCurrencyIDR(summary.totalBalance)}
              </p>
              <p className="mt-1.5 text-xs text-white/75">
                Akumulasi dari {accounts.length} akun aktif Anda
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
              <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/80">
                  <ArrowUpRight className="size-3.5" />
                  Pemasukan
                </div>
                <p className="mt-1 text-sm font-bold sm:text-base">
                  {formatCurrencyIDR(summary.incomeThisMonth)}
                </p>
              </div>
              <div className="rounded-2xl bg-white/12 px-4 py-3 backdrop-blur-sm">
                <div className="flex items-center gap-1.5 text-[11px] font-medium text-white/80">
                  <ArrowDownLeft className="size-3.5" />
                  Pengeluaran
                </div>
                <p className="mt-1 text-sm font-bold sm:text-base">
                  {formatCurrencyIDR(summary.expenseThisMonth)}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Ringkasan sekunder */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Pemasukan Bulan Ini"
          value={formatCurrencyIDR(summary.incomeThisMonth)}
          helper="vs bulan lalu"
          icon={TrendingUp}
          variant="income"
          trend="up"
        />
        <SummaryCard
          label="Pengeluaran Bulan Ini"
          value={formatCurrencyIDR(summary.expenseThisMonth)}
          helper="vs bulan lalu"
          icon={TrendingDown}
          variant="expense"
          trend="down"
        />
        <SummaryCard
          label="Sisa Arus Kas"
          value={formatCurrencyIDR(summary.remainingThisMonth)}
          helper="Pemasukan - Pengeluaran"
          icon={Wallet}
          variant={remainingPositive ? "balance" : "expense"}
          trend={remainingPositive ? "up" : "down"}
        />
        <SummaryCard
          label="Target Tabungan"
          value={`${summary.activeSavingsGoals}`}
          helper="Goal yang sedang aktif"
          icon={PiggyBank}
          variant="savings"
          trend="neutral"
        />
      </div>

      {/* Grafik + Insight */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <Card className="gap-0 border-border/70 bg-card py-0 shadow-soft">
          <CardHeader className="border-b border-border/60 px-5 py-4">
            <CardTitle className="text-sm font-bold tracking-tight sm:text-base">
              Perbandingan Bulanan
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Pemasukan vs pengeluaran 6 bulan terakhir
            </p>
          </CardHeader>
          <CardContent className="px-3 py-4 sm:px-5">
            <DashboardMonthlyComparisonChart data={charts.monthlyComparison} />
          </CardContent>
        </Card>

        <Card className="gap-0 border-border/70 bg-card py-0 shadow-soft">
          <CardHeader className="border-b border-border/60 px-5 py-4">
            <CardTitle className="text-sm font-bold tracking-tight sm:text-base">
              Insight Keuangan
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Sorotan otomatis dari data Anda
            </p>
          </CardHeader>
          <CardContent className="space-y-3 px-5 py-4">
            {insights.map((insight) => {
              const tone = insightTone[insight.tone];
              const Icon = tone.icon;
              return (
                <div
                  key={insight.title}
                  className="flex gap-3 rounded-2xl border border-border/60 bg-muted/30 p-3.5"
                >
                  <div
                    className={cn(
                      "flex size-9 shrink-0 items-center justify-center rounded-xl",
                      tone.iconBg
                    )}
                  >
                    <Icon className="size-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-semibold text-foreground">
                      {insight.title}
                    </p>
                    <p className="mt-0.5 truncate text-sm font-bold text-foreground">
                      {insight.value}
                    </p>
                    <p className="mt-0.5 text-[11px] leading-relaxed text-muted-foreground">
                      {insight.helper}
                    </p>
                  </div>
                </div>
              );
            })}
            <Link
              href="/savings-goals"
              className="group flex items-center justify-between rounded-2xl border border-primary/20 bg-accent/60 p-3.5 text-xs font-semibold text-accent-foreground transition-colors hover:bg-accent"
            >
              <span className="flex items-center gap-2">
                <CalendarClock className="size-4" />
                Lihat semua target tabungan
              </span>
              <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </CardContent>
        </Card>
      </div>

      {/* Transaksi terbaru + distribusi pengeluaran */}
      <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
        <DataTableCard
          title="Transaksi Terbaru"
          description="Aktivitas finansial terakhir Anda"
          action={
            <Link
              href="/transactions"
              className="inline-flex h-8 items-center gap-1.5 rounded-xl border border-border/70 bg-background px-3 text-xs font-semibold text-foreground transition-colors hover:border-primary/30 hover:text-primary"
            >
              Lihat Semua
              <ArrowRight className="size-3.5" />
            </Link>
          }
        >
          {recentTransactions.length === 0 ? (
            <EmptyState
              title="Belum ada transaksi"
              description="Mulai catat transaksi pertamamu dengan tombol di kanan bawah."
            />
          ) : (
            <ul className="divide-y divide-border/50">
              {recentTransactions.map((transaction) => {
                const tone = transactionTone[transaction.type];
                const Icon = tone.icon;
                return (
                  <li
                    key={transaction.id}
                    className="flex items-center gap-3 py-3 transition-colors first:pt-0 last:pb-0"
                  >
                    <div
                      className={cn(
                        "flex size-10 shrink-0 items-center justify-center rounded-xl",
                        tone.iconBg
                      )}
                    >
                      <Icon className="size-4.5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-foreground">
                        {transaction.description ||
                          transaction.categoryLabel ||
                          transaction.accountLabel}
                      </p>
                      <p className="mt-0.5 truncate text-xs text-muted-foreground">
                        {transaction.accountLabel}
                        {transaction.categoryLabel
                          ? ` • ${transaction.categoryLabel}`
                          : ""}{" "}
                        • {formatDateID(transaction.transactionDate)}
                      </p>
                    </div>
                    <p
                      className={cn(
                        "shrink-0 text-sm font-bold tabular-nums",
                        tone.amountClass
                      )}
                    >
                      {tone.prefix}
                      {formatCurrencyIDR(transaction.amount)}
                    </p>
                  </li>
                );
              })}
            </ul>
          )}
        </DataTableCard>

        <Card className="gap-0 border-border/70 bg-card py-0 shadow-soft">
          <CardHeader className="border-b border-border/60 px-5 py-4">
            <CardTitle className="text-sm font-bold tracking-tight sm:text-base">
              Distribusi Pengeluaran
            </CardTitle>
            <p className="mt-0.5 text-xs text-muted-foreground">
              Berdasarkan kategori bulan ini
            </p>
          </CardHeader>
          <CardContent className="px-5 py-4">
            {charts.expenseByCategory.length > 0 ? (
              <DashboardExpensePieChart data={charts.expenseByCategory} />
            ) : (
              <EmptyState
                title="Tidak ada pengeluaran"
                description="Catat pengeluaran untuk melihat distribusi."
              />
            )}
          </CardContent>
        </Card>
      </div>

      <PageFab>
        <TransactionFormDialog
          accounts={accounts}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
        />
      </PageFab>
    </div>
  );
}
