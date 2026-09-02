import Link from "next/link";
import {
  ArrowRightLeft,
  Landmark,
  ChartPie,
  PiggyBank,
  TrendingUp,
  Wallet,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { DashboardExpensePieChart } from "@/components/charts/dashboard-expense-pie-chart";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { TransactionTypeBadge } from "@/components/dashboard/transaction-type-badge";
import { TransactionFormDialog } from "@/components/forms/transaction-form-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { buttonVariants } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/queries/dashboard";
import { formatCurrencyIDR, formatDateID } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

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
      <div className="space-y-5 pb-16">
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

  const summaryCards = [
    {
      label: "Total Saldo",
      value: formatCurrencyIDR(summary.totalBalance),
      helper: "Akumulasi seluruh akun",
      icon: Wallet,
      variant: "balance" as const,
      trend: "neutral" as const,
    },
    {
      label: "Pemasukan Bulan Ini",
      value: formatCurrencyIDR(summary.incomeThisMonth),
      helper: "vs bulan lalu",
      icon: TrendingUp,
      variant: "income" as const,
      trend: "up" as const,
      trendValue: "+12%",
    },
    {
      label: "Pengeluaran Bulan Ini",
      value: formatCurrencyIDR(summary.expenseThisMonth),
      helper: "vs bulan lalu",
      icon: ChartPie,
      variant: "expense" as const,
      trend: "down" as const,
      trendValue: "-8%",
    },
    {
      label: "Sisa Arus Kas",
      value: formatCurrencyIDR(summary.remainingThisMonth),
      helper: "Pemasukan - Pengeluaran",
      icon: Landmark,
      variant: "default" as const,
      trend: summary.remainingThisMonth >= 0 ? ("up" as const) : ("down" as const),
    },
    {
      label: "Target Tabungan",
      value: `${summary.activeSavingsGoals}`,
      helper: "Goal aktif",
      icon: PiggyBank,
      variant: "savings" as const,
      trend: "neutral" as const,
    },
  ];

  return (
    <div className="space-y-5 pb-16">
      {header}

      {/* Row 1: Total Saldo - Full Width */}
      <SummaryCard
        label={summaryCards[0].label}
        value={summaryCards[0].value}
        helper={summaryCards[0].helper}
        icon={summaryCards[0].icon}
        variant={summaryCards[0].variant}
        trend={summaryCards[0].trend}
      />

      {/* Row 2: Pemasukan & Pengeluaran */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label={summaryCards[1].label}
          value={summaryCards[1].value}
          helper={summaryCards[1].helper}
          icon={summaryCards[1].icon}
          variant={summaryCards[1].variant}
          trend={summaryCards[1].trend}
          trendValue={summaryCards[1].trendValue}
        />
        <SummaryCard
          label={summaryCards[2].label}
          value={summaryCards[2].value}
          helper={summaryCards[2].helper}
          icon={summaryCards[2].icon}
          variant={summaryCards[2].variant}
          trend={summaryCards[2].trend}
          trendValue={summaryCards[2].trendValue}
        />
      </div>

      {/* Row 3: Sisa Arus Kas & Target Tabungan */}
      <div className="grid grid-cols-2 gap-3">
        <SummaryCard
          label={summaryCards[3].label}
          value={summaryCards[3].value}
          helper={summaryCards[3].helper}
          icon={summaryCards[3].icon}
          variant={summaryCards[3].variant}
          trend={summaryCards[3].trend}
        />
        <SummaryCard
          label={summaryCards[4].label}
          value={summaryCards[4].value}
          helper={summaryCards[4].helper}
          icon={summaryCards[4].icon}
          variant={summaryCards[4].variant}
          trend={summaryCards[4].trend}
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <DataTableCard
          title="Transaksi Terbaru"
          description="5 transaksi terakhir yang tercatat"
          action={
            <Link
              href="/transactions"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "h-7 gap-1 rounded-md px-2.5 text-[11px]"
              )}
            >
              Lihat Semua
              <ArrowRightLeft className="size-3" />
            </Link>
          }
        >
          {recentTransactions.length === 0 ? (
            <div className="py-6">
              <EmptyState
                title="Belum ada transaksi"
                description="Mulai catat transaksi pertamamu."
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent border-border/60">
                    <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                      Tanggal
                    </TableHead>
                    <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                      Tipe
                    </TableHead>
                    <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                      Akun
                    </TableHead>
                    <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                      Kategori
                    </TableHead>
                    <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground text-right">
                      Nominal
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentTransactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="group border-border/40 transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="py-2 text-[11px] text-muted-foreground whitespace-nowrap">
                        {formatDateID(transaction.transactionDate)}
                      </TableCell>
                      <TableCell className="py-2">
                        <TransactionTypeBadge type={transaction.type} />
                      </TableCell>
                      <TableCell className="py-2 text-[11px] max-w-[150px] truncate font-medium text-foreground">
                        {transaction.accountLabel}
                      </TableCell>
                      <TableCell className="py-2 text-[11px] max-w-[120px] truncate text-muted-foreground">
                        {transaction.categoryLabel ?? "-"}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-2 text-[11px] font-semibold text-right whitespace-nowrap",
                          transaction.type === "income" &&
                          "text-emerald-600 dark:text-emerald-400",
                          transaction.type === "expense" &&
                          "text-rose-600 dark:text-rose-400",
                          transaction.type === "transfer" &&
                          "text-blue-600 dark:text-blue-400",
                        )}
                      >
                        <span className="flex items-center justify-end gap-1">
                          {transaction.type === "income" && (
                            <ArrowUpRight className="size-3 opacity-60" />
                          )}
                          {transaction.type === "expense" && (
                            <ArrowDownRight className="size-3 opacity-60" />
                          )}
                          {formatCurrencyIDR(transaction.amount)}
                        </span>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </DataTableCard>

        <Card className="border-border/60 bg-card h-full">
          <CardHeader className="p-6 pb-2">
            <CardTitle className="text-sm font-semibold tracking-tight">
              Distribusi Pengeluaran
            </CardTitle>
            <p className="mt-0.5 text-[11px] text-muted-foreground">
              Berdasarkan kategori
            </p>
          </CardHeader>
          <CardContent className="px-6">
            {charts.expenseByCategory.length > 0 ? (
              <DashboardExpensePieChart data={charts.expenseByCategory} />
            ) : (
              <div className="py-5">
                <EmptyState
                  title="Tidak ada pengeluaran"
                  description="Catat pengeluaran untuk melihat distribusi."
                />
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="fixed bottom-6 right-6 z-50">
        <TransactionFormDialog
          accounts={accounts}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
        />
      </div>
    </div>
  );
}
