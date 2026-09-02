import { ArrowUpDown, Plus, ArrowRight, ArrowUpRight, ArrowDownLeft, ArrowDownRight, ArrowRightLeft } from "lucide-react";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageFab } from "@/components/dashboard/page-fab";
import { PaginationControls } from "@/components/dashboard/pagination-controls";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { TransactionDeleteButton } from "@/components/dashboard/transaction-delete-button";
import { TransactionTypeBadge } from "@/components/dashboard/transaction-type-badge";
import { TransactionFilters } from "@/components/forms/transaction-filters";
import { TransactionFormDialog } from "@/components/forms/transaction-form-dialog";
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
import { getTransactions } from "@/lib/queries/transactions";
import { formatCurrencyIDR, formatDateID } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

type Transaction = Awaited<
  ReturnType<typeof getTransactions>
>["transactions"][number];

function renderAccountLabel(transaction: Transaction) {
  if (transaction.type === "transfer") {
    return `${transaction.fromAccountName ?? "Unknown"} → ${transaction.toAccountName ?? "Unknown"}`;
  }

  return transaction.accountName ?? "-";
}

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

type TransactionsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function getSingleSearchParam(
  searchParams: Record<string, string | string[] | undefined>,
  key: string,
) {
  const value = searchParams[key];
  return Array.isArray(value) ? value[0] : value;
}

export default async function TransactionsPage({
  searchParams,
}: TransactionsPageProps) {
  const params = (await searchParams) ?? {};
  const filters = {
    dateFrom: getSingleSearchParam(params, "dateFrom") ?? "",
    dateTo: getSingleSearchParam(params, "dateTo") ?? "",
    type: getSingleSearchParam(params, "type") as
      | "income"
      | "expense"
      | "transfer"
      | undefined,
    categoryId: getSingleSearchParam(params, "categoryId") ?? "",
    accountId: getSingleSearchParam(params, "accountId") ?? "",
    q: getSingleSearchParam(params, "q") ?? "",
    page: Number(getSingleSearchParam(params, "page") ?? "1"),
    pageSize: 10,
  };

  const result = await getTransactions(filters)
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Gagal memuat data transaksi dari Supabase.",
    }));

  const header = (
    <PageHeader
      eyebrow="Catatan Arus Kas"
      title="Transaksi"
      description="Catat income, expense, dan transfer antar akun dalam satu alur yang konsisten."
    />
  );

  if (result.error || !result.data) {
    return (
      <section className="space-y-6">
        {header}
        <ErrorState description={result.error ?? "Gagal memuat data transaksi."} />
      </section>
    );
  }

  const { transactions, accounts, incomeCategories, expenseCategories } = result.data;
  const { totalCount, page, totalPages } = result.data;
  const incomeCount = transactions.filter((item) => item.type === "income").length;
  const expenseCount = transactions.filter((item) => item.type === "expense").length;
  const transferCount = transactions.filter((item) => item.type === "transfer").length;
  const paginationQuery = {
    ...(filters.dateFrom ? { dateFrom: filters.dateFrom } : {}),
    ...(filters.dateTo ? { dateTo: filters.dateTo } : {}),
    ...(filters.type ? { type: filters.type } : {}),
    ...(filters.categoryId ? { categoryId: filters.categoryId } : {}),
    ...(filters.accountId ? { accountId: filters.accountId } : {}),
    ...(filters.q ? { q: filters.q } : {}),
  };

  return (
    <section className="space-y-6">
      {header}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Total transaksi"
          value={`${totalCount}`}
          helper="Semua transaksi tercatat"
          icon={ArrowUpDown}
          variant="default"
        />
        <SummaryCard
          label="Income"
          value={`${incomeCount}`}
          helper="Transaksi pemasukan"
          icon={Plus}
          variant="income"
        />
        <SummaryCard
          label="Expense"
          value={`${expenseCount}`}
          helper="Transaksi pengeluaran"
          icon={ArrowRight}
          variant="expense"
        />
        <SummaryCard
          label="Transfer"
          value={`${transferCount}`}
          helper="Perpindahan antar akun"
          icon={ArrowUpDown}
          variant="balance"
        />
      </div>

      <DataTableCard
        title="Daftar Transaksi"
        description="Riwayat lengkap pemasukan, pengeluaran, dan transfer."
      >
        <TransactionFilters
          filters={result.data.filters}
          accounts={accounts}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
        />

        {transactions.length === 0 ? (
          <EmptyState
            title="Belum ada transaksi"
            description="Tambahkan income, expense, atau transfer pertama Anda untuk mulai membangun riwayat cashflow."
          />
        ) : (
          <>
            {/* Tampilan mobile: list card */}
            <ul className="divide-y divide-border/50 md:hidden">
              {transactions.map((transaction) => {
                const tone = transactionTone[transaction.type];
                const Icon = tone.icon;
                return (
                  <li key={transaction.id} className="py-3 first:pt-0">
                    <div className="flex items-start gap-3">
                      <div
                        className={cn(
                          "flex size-10 shrink-0 items-center justify-center rounded-xl",
                          tone.iconBg
                        )}
                      >
                        <Icon className="size-4.5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p className="truncate text-sm font-semibold text-foreground">
                            {transaction.description ||
                              transaction.categoryName ||
                              renderAccountLabel(transaction)}
                          </p>
                          <p
                            className={cn(
                              "shrink-0 text-sm font-bold tabular-nums",
                              tone.amountClass
                            )}
                          >
                            {tone.prefix}
                            {formatCurrencyIDR(transaction.amount)}
                          </p>
                        </div>
                        <p className="mt-0.5 truncate text-xs text-muted-foreground">
                          {renderAccountLabel(transaction)}
                          {transaction.categoryName
                            ? ` • ${transaction.categoryName}`
                            : ""}
                        </p>
                        <div className="mt-2 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <TransactionTypeBadge type={transaction.type} />
                            <span className="text-[11px] text-muted-foreground">
                              {formatDateID(transaction.transactionDate)}
                            </span>
                          </div>
                          <div className="flex shrink-0 items-center gap-1">
                            <TransactionFormDialog
                              transaction={transaction}
                              accounts={accounts}
                              incomeCategories={incomeCategories}
                              expenseCategories={expenseCategories}
                            />
                            <TransactionDeleteButton transactionId={transaction.id} />
                          </div>
                        </div>
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
                      Tanggal
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Tipe
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Akun / Transfer
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Kategori
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Deskripsi
                    </TableHead>
                    <TableHead className="h-9 py-2 text-right text-xs font-semibold text-muted-foreground">
                      Nominal
                    </TableHead>
                    <TableHead className="h-9 py-2 text-right text-xs font-semibold text-muted-foreground">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow
                      key={transaction.id}
                      className="group border-border/40 transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="py-2.5 text-xs whitespace-nowrap text-muted-foreground">
                        {formatDateID(transaction.transactionDate)}
                      </TableCell>
                      <TableCell className="py-2.5">
                        <TransactionTypeBadge type={transaction.type} />
                      </TableCell>
                      <TableCell className="max-w-[220px] py-2.5">
                        <span className="line-clamp-2 text-xs text-foreground">
                          {renderAccountLabel(transaction)}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground">
                        {transaction.categoryName ?? "-"}
                      </TableCell>
                      <TableCell className="max-w-[240px] py-2.5">
                        <span className="line-clamp-2 text-xs text-muted-foreground">
                          {transaction.description || "-"}
                        </span>
                      </TableCell>
                      <TableCell
                        className={cn(
                          "py-2.5 text-right text-xs font-bold whitespace-nowrap tabular-nums",
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
                            <ArrowUpRight className="size-3.5 opacity-60" />
                          )}
                          {transaction.type === "expense" && (
                            <ArrowDownRight className="size-3.5 opacity-60" />
                          )}
                          {formatCurrencyIDR(transaction.amount)}
                        </span>
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          <TransactionFormDialog
                            transaction={transaction}
                            accounts={accounts}
                            incomeCategories={incomeCategories}
                            expenseCategories={expenseCategories}
                          />
                          <TransactionDeleteButton transactionId={transaction.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}

        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          basePath="/transactions"
          searchParams={paginationQuery}
        />
      </DataTableCard>

      <PageFab>
        <TransactionFormDialog
          accounts={accounts}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
        />
      </PageFab>
    </section>
  );
}
