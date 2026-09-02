import { CircleDollarSign, ListChecks, PiggyBank, TriangleAlert } from "lucide-react";

import { BudgetDeleteButton } from "@/components/dashboard/budget-delete-button";
import { BudgetStatusBadge } from "@/components/dashboard/budget-status-badge";
import { CategoryColorDot } from "@/components/dashboard/category-color-dot";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageFab } from "@/components/dashboard/page-fab";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { BudgetFormDialog } from "@/components/forms/budget-form-dialog";
import { BudgetPeriodFilter } from "@/components/forms/budget-period-filter";
import { BudgetTemplateDialog } from "@/components/forms/budget-template-dialog";
import { PageHeader } from "@/components/layout/page-header";
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
import { getBudgetsByPeriod } from "@/lib/queries/budgets";
import { formatCurrencyIDR } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type BudgetsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

const progressBarColor = {
  aman: "bg-emerald-500",
  "hampir habis": "bg-amber-500",
  "melewati budget": "bg-rose-500",
} as const;

export default async function BudgetsPage({ searchParams }: BudgetsPageProps) {
  const params = (await searchParams) ?? {};
  const now = new Date();
  const month = Number(getSingleParam(params, "month") ?? now.getMonth() + 1);
  const year = Number(getSingleParam(params, "year") ?? now.getFullYear());

  const result = await getBudgetsByPeriod({ month, year })
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({
      data: null,
      error: error instanceof Error ? error.message : "Gagal memuat data budget.",
    }));

  const header = (
    <PageHeader
      eyebrow="Anggaran Bulanan"
      title="Budgets"
      description="Tetapkan budget bulanan per kategori expense dan pantau realisasinya dari transaksi pengeluaran."
    />
  );

  if (result.error || !result.data) {
    return (
      <section className="space-y-6">
        {header}
        <ErrorState description={result.error ?? "Gagal memuat data budget."} />
      </section>
    );
  }

  const {
    budgets,
    expenseCategories,
    templates,
    totalBudget,
    totalRealized,
    totalRemaining,
    atRiskCount,
    selectedMonth,
    selectedYear,
  } = result.data;

  return (
    <section className="space-y-6">
      {header}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Total budget"
          value={formatCurrencyIDR(totalBudget)}
          helper="Akumulasi budget periode aktif"
          icon={CircleDollarSign}
          variant="default"
        />
        <SummaryCard
          label="Realisasi"
          value={formatCurrencyIDR(totalRealized)}
          helper="Expense tercatat periode ini"
          icon={ListChecks}
          variant="expense"
        />
        <SummaryCard
          label="Sisa budget"
          value={formatCurrencyIDR(totalRemaining)}
          helper="Sisa setelah dikurangi realisasi"
          icon={PiggyBank}
          variant={totalRemaining >= 0 ? "balance" : "expense"}
        />
        <SummaryCard
          label="Perlu perhatian"
          value={`${atRiskCount}`}
          helper="Budget hampir habis / terlewati"
          icon={TriangleAlert}
          variant={atRiskCount > 0 ? "expense" : "default"}
        />
      </div>

      <DataTableCard
        title="Budget Aktif Periode Berjalan"
        description="Default menampilkan budget bulan berjalan, tetapi Anda bisa pindah periode kapan saja."
      >
        <BudgetPeriodFilter month={selectedMonth} year={selectedYear} />

        {budgets.length === 0 ? (
          <EmptyState
            title="Belum ada budget di periode ini"
            description="Tambahkan budget per kategori expense untuk mulai memantau pemakaian bulanan."
          />
        ) : (
          <>
            {/* Tampilan mobile: card list */}
            <ul className="grid gap-3 md:hidden">
              {budgets.map((budget) => {
                const progress = Math.min(budget.percentageUsed, 100);
                return (
                  <li
                    key={budget.id}
                    className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5">
                        <CategoryColorDot color={budget.categoryColor} />
                        <div>
                          <p className="text-sm font-bold text-foreground">
                            {budget.categoryName}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            Periode {selectedMonth}/{selectedYear}
                          </p>
                        </div>
                      </div>
                      <BudgetStatusBadge status={budget.status} />
                    </div>

                    <div className="mt-3 space-y-1.5">
                      <div className="h-2 overflow-hidden rounded-full bg-muted">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-500",
                            progressBarColor[budget.status]
                          )}
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">
                          {formatCurrencyIDR(budget.realized)} terpakai
                        </span>
                        <span className="font-semibold text-foreground">
                          {budget.percentageUsed.toFixed(0)}% dari{" "}
                          {formatCurrencyIDR(budget.amount)}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between gap-2 border-t border-border/50 pt-3">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Sisa budget</p>
                        <p
                          className={cn(
                            "text-sm font-extrabold tabular-nums",
                            budget.remaining < 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                          )}
                        >
                          {formatCurrencyIDR(budget.remaining)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <BudgetFormDialog
                          budget={budget}
                          expenseCategories={expenseCategories}
                          selectedMonth={selectedMonth}
                          selectedYear={selectedYear}
                        />
                        <BudgetDeleteButton budgetId={budget.id} />
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>

            {/* Tampilan desktop: tabel */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Kategori
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Budget
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Realisasi
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Sisa
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Progress
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-9 py-2 text-right text-xs font-semibold text-muted-foreground">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {budgets.map((budget) => {
                    const progress = Math.min(budget.percentageUsed, 100);

                    return (
                      <TableRow
                        key={budget.id}
                        className="group border-border/40 transition-colors hover:bg-muted/30"
                      >
                        <TableCell className="py-2.5">
                          <div className="inline-flex items-center gap-2">
                            <CategoryColorDot color={budget.categoryColor} />
                            <div>
                              <p className="text-xs font-bold text-foreground">
                                {budget.categoryName}
                              </p>
                              <p className="text-[11px] text-muted-foreground">
                                {selectedMonth}/{selectedYear}
                              </p>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5 text-xs font-semibold tabular-nums text-foreground">
                          {formatCurrencyIDR(budget.amount)}
                        </TableCell>
                        <TableCell className="py-2.5 text-xs tabular-nums text-muted-foreground">
                          {formatCurrencyIDR(budget.realized)}
                        </TableCell>
                        <TableCell
                          className={cn(
                            "py-2.5 text-xs font-semibold tabular-nums",
                            budget.remaining < 0
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground",
                          )}
                        >
                          {formatCurrencyIDR(budget.remaining)}
                        </TableCell>
                        <TableCell className="min-w-[180px] py-2.5">
                          <div className="space-y-1">
                            <div className="h-2 overflow-hidden rounded-full bg-muted">
                              <div
                                className={cn(
                                  "h-full rounded-full transition-all duration-500",
                                  progressBarColor[budget.status]
                                )}
                                style={{ width: `${progress}%` }}
                              />
                            </div>
                            <p className="text-[11px] text-muted-foreground">
                              {budget.percentageUsed.toFixed(1)}% terpakai
                            </p>
                          </div>
                        </TableCell>
                        <TableCell className="py-2.5">
                          <BudgetStatusBadge status={budget.status} />
                        </TableCell>
                        <TableCell className="py-2.5 text-right">
                          <div className="flex justify-end gap-1">
                            <BudgetFormDialog
                              budget={budget}
                              expenseCategories={expenseCategories}
                              selectedMonth={selectedMonth}
                              selectedYear={selectedYear}
                            />
                            <BudgetDeleteButton budgetId={budget.id} />
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </DataTableCard>

      <PageFab>
        <BudgetTemplateDialog
          templates={templates}
          expenseCategories={expenseCategories}
        />
        <BudgetFormDialog
          expenseCategories={expenseCategories}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </PageFab>
    </section>
  );
}
