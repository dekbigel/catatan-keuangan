import { ArrowRight, ArrowUpDown, Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";

import { DataTableCard } from "@/components/dashboard/data-table-card";
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

function renderAccountLabel(
  transaction: Awaited<ReturnType<typeof getTransactions>>["transactions"][number],
) {
  if (transaction.type === "transfer") {
    return `${transaction.fromAccountName ?? "Unknown"} → ${transaction.toAccountName ?? "Unknown"}`;
  }

  return transaction.accountName ?? "-";
}

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
      <section className="space-y-5">
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
    <section className="space-y-5 pb-24">
      {header}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total transaksi"
          value={`${transactions.length}`}
          helper="Semua transaksi user aktif"
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
          helper="Perpindahan saldo antar akun"
          icon={ArrowUpDown}
          variant="default"
        />
      </div>

      <DataTableCard
        title="Daftar Transaksi"
        description="Tabel transaksi menampilkan tanggal, tipe, akun/transfer, kategori, deskripsi, dan nominal."
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
                    Akun / Transfer
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Kategori
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Deskripsi
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground text-right">
                    Nominal
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground text-right">
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
                    <TableCell className="py-2 text-[11px] text-muted-foreground whitespace-nowrap">
                      {formatDateID(transaction.transactionDate)}
                    </TableCell>
                    <TableCell className="py-2">
                      <TransactionTypeBadge type={transaction.type} />
                    </TableCell>
                    <TableCell className="py-2 max-w-[220px]">
                      <span className="line-clamp-2 text-[11px] text-foreground">
                        {renderAccountLabel(transaction)}
                      </span>
                    </TableCell>
                    <TableCell className="py-2 text-[11px] text-muted-foreground">
                      {transaction.categoryName ?? "-"}
                    </TableCell>
                    <TableCell className="py-2 max-w-[240px]">
                      <span className="line-clamp-2 text-[11px] text-muted-foreground">
                        {transaction.description || "-"}
                      </span>
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
                    <TableCell className="py-2 text-right">
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
        )}

        <PaginationControls
          page={page}
          totalPages={totalPages}
          totalCount={totalCount}
          basePath="/transactions"
          searchParams={paginationQuery}
        />
      </DataTableCard>

      <div className="fixed bottom-6 right-6 z-50">
        <TransactionFormDialog
          accounts={accounts}
          incomeCategories={incomeCategories}
          expenseCategories={expenseCategories}
        />
      </div>
    </section>
  );
}
