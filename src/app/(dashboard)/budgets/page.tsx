import { CircleDollarSign, ListChecks, PiggyBank, TriangleAlert } from "lucide-react";

import { BudgetDeleteButton } from "@/components/dashboard/budget-delete-button";
import { BudgetStatusBadge } from "@/components/dashboard/budget-status-badge";
import { CategoryColorDot } from "@/components/dashboard/category-color-dot";
import { DataTableCard } from "@/components/dashboard/data-table-card";
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
      <section className="space-y-5">
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
    <section className="space-y-5 pb-24">
      {header}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total budget"
          value={formatCurrencyIDR(totalBudget)}
          helper="Akumulasi semua budget pada periode aktif"
          icon={CircleDollarSign}
          variant="default"
        />
        <SummaryCard
          label="Realisasi"
          value={formatCurrencyIDR(totalRealized)}
          helper="Total expense yang sudah tercatat pada periode ini"
          icon={ListChecks}
          variant="expense"
        />
        <SummaryCard
          label="Sisa budget"
          value={formatCurrencyIDR(totalRemaining)}
          helper="Sisa gabungan seluruh budget setelah dikurangi realisasi"
          icon={PiggyBank}
          variant={totalRemaining >= 0 ? "default" : "expense"}
        />
        <SummaryCard
          label="Perlu perhatian"
          value={`${atRiskCount}`}
          helper="Budget yang hampir habis atau sudah terlewati"
          icon={TriangleAlert}
          variant={atRiskCount > 0 ? "expense" : "default"}
        />
      </div>

      <DataTableCard
        title="Budget Aktif Periode Berjalan"
        description="Default menampilkan budget bulan berjalan, tetapi Anda bisa pindah periode kapan saja"
      >
        <BudgetPeriodFilter month={selectedMonth} year={selectedYear} />

        {budgets.length === 0 ? (
          <EmptyState
            title="Belum ada budget di periode ini"
            description="Tambahkan budget per kategori expense untuk mulai memantau pemakaian bulanan."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/60">
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Kategori
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Budget
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Realisasi
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Sisa
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Progress
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground text-right">
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
                      <TableCell className="py-2">
                        <div className="inline-flex items-center gap-2">
                          <CategoryColorDot color={budget.categoryColor} />
                          <div>
                            <p className="font-semibold text-[11px] text-foreground">
                              {budget.categoryName}
                            </p>
                            <p className="text-[11px] text-muted-foreground">
                              {selectedMonth}/{selectedYear}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2 text-[11px] font-medium text-foreground">
                        {formatCurrencyIDR(budget.amount)}
                      </TableCell>
                      <TableCell className="py-2 text-[11px] text-muted-foreground">
                        {formatCurrencyIDR(budget.realized)}
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-2 text-[11px] font-medium",
                          budget.remaining < 0
                            ? "text-rose-600 dark:text-rose-400"
                            : "text-foreground",
                        )}
                      >
                        {formatCurrencyIDR(budget.remaining)}
                      </TableCell>
                      <TableCell className="py-2 min-w-[180px]">
                        <div className="space-y-1">
                          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                            <div
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                budget.status === "aman" && "bg-emerald-500",
                                budget.status === "hampir habis" &&
                                "bg-amber-500",
                                budget.status === "melewati budget" &&
                                "bg-rose-500",
                              )}
                              style={{ width: `${progress}%` }}
                            />
                          </div>
                          <p className="text-[11px] text-muted-foreground">
                            {budget.percentageUsed.toFixed(1)}% terpakai
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <BudgetStatusBadge status={budget.status} />
                      </TableCell>
                      <TableCell className="py-2 text-right">
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
        )}
      </DataTableCard>

      <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2">
        <BudgetTemplateDialog
          templates={templates}
          expenseCategories={expenseCategories}
        />
        <BudgetFormDialog
          expenseCategories={expenseCategories}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
        />
      </div>
    </section>
  );
}
