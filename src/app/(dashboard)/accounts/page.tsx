import { Landmark, PiggyBank, Smartphone, Wallet, Coins } from "lucide-react";

import { AccountDeleteButton } from "@/components/dashboard/account-delete-button";
import { AccountTypeBadge } from "@/components/dashboard/account-type-badge";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageFab } from "@/components/dashboard/page-fab";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { AccountFormDialog } from "@/components/forms/account-form-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { ErrorState } from "@/components/ui/error-state";
import { EmptyState } from "@/components/ui/empty-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getAccountsWithBalances } from "@/lib/queries/accounts";
import { formatCurrencyIDR } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

const totalByTypeIcons = {
  cash: Wallet,
  bank: Landmark,
  ewallet: Smartphone,
  savings: PiggyBank,
} as const;

const accountIconByType: Record<string, typeof Wallet> = {
  cash: Wallet,
  bank: Landmark,
  ewallet: Smartphone,
  savings: PiggyBank,
  crypto: Coins,
};

const accountIconTone: Record<string, string> = {
  cash: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  bank: "bg-sky-500/10 text-sky-600 dark:text-sky-400",
  ewallet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  savings: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  crypto: "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

export default async function AccountsPage() {
  const result = await getAccountsWithBalances()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({
      data: null,
      error:
        error instanceof Error ? error.message : "Gagal memuat data akun dari Supabase.",
    }));

  const header = (
    <PageHeader
      eyebrow="Manajemen Keuangan"
      title="Akun"
      description="Kelola semua sumber uang Anda dan lihat saldo aktual tiap akun secara dinamis."
    />
  );

  if (result.error || !result.data) {
    return (
      <section className="space-y-6">
        {header}
        <ErrorState description={result.error ?? "Gagal memuat data akun."} />
      </section>
    );
  }

  const { accounts, totalBalance } = result.data;
  const accountCounts = {
    cash: accounts.filter((account) => account.type === "cash").length,
    bank: accounts.filter((account) => account.type === "bank").length,
    others: accounts.filter(
      (account) => account.type !== "cash" && account.type !== "bank",
    ).length,
  };

  const summaryCards = [
    {
      label: "Total saldo semua akun",
      value: formatCurrencyIDR(totalBalance),
      helper: "Saldo awal + transaksi",
      icon: Wallet,
      variant: "balance" as const,
    },
    {
      label: "Cash",
      value: `${accountCounts.cash} Akun`,
      helper: "Uang tunai atau petty cash",
      icon: totalByTypeIcons.cash,
      variant: "default" as const,
    },
    {
      label: "Bank",
      value: `${accountCounts.bank} Akun`,
      helper: "Rekening utama dan tabungan",
      icon: totalByTypeIcons.bank,
      variant: "default" as const,
    },
    {
      label: "Lainnya / Digital",
      value: `${accountCounts.others} Akun`,
      helper: "E-Wallet, Savings, dll.",
      icon: PiggyBank,
      variant: "savings" as const,
    },
  ];

  return (
    <section className="space-y-6">
      {header}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard
            key={card.label}
            label={card.label}
            value={card.value}
            helper={card.helper}
            icon={card.icon}
            variant={card.variant}
          />
        ))}
      </div>

      <DataTableCard
        title="Daftar Akun"
        description="Saldo aktual = saldo awal + income - expense + transfer masuk - transfer keluar."
      >
        {accounts.length === 0 ? (
          <EmptyState
            title="Belum ada akun keuangan"
            description="Tambahkan akun pertama Anda untuk mulai mencatat saldo dan transaksi."
          />
        ) : (
          <>
            {/* Tampilan mobile: card grid */}
            <ul className="grid gap-3 sm:grid-cols-2 md:hidden">
              {accounts.map((account) => {
                const Icon = accountIconByType[account.type] ?? Wallet;
                const tone =
                  accountIconTone[account.type] ??
                  "bg-slate-500/10 text-slate-600 dark:text-slate-400";
                return (
                  <li
                    key={account.id}
                    className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={cn(
                            "flex size-10 shrink-0 items-center justify-center rounded-xl",
                            tone
                          )}
                        >
                          <Icon className="size-5" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-bold text-foreground">
                            {account.name}
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {account.isActive ? "Aktif" : "Nonaktif"} •{" "}
                            {account.transactionCount} transaksi
                          </p>
                        </div>
                      </div>
                      <AccountTypeBadge type={account.type} />
                    </div>
                    <div className="mt-3 flex items-end justify-between gap-2">
                      <div>
                        <p className="text-[11px] text-muted-foreground">Saldo aktual</p>
                        <p className="text-lg font-extrabold tracking-tight tabular-nums text-foreground">
                          {formatCurrencyIDR(account.currentBalance)}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <AccountFormDialog account={account} />
                        <AccountDeleteButton
                          accountId={account.id}
                          disabled={account.transactionCount > 0}
                        />
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
                      Akun
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Tipe
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Saldo Awal
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Saldo Aktual
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Transaksi
                    </TableHead>
                    <TableHead className="h-9 py-2 text-right text-xs font-semibold text-muted-foreground">
                      Aksi
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {accounts.map((account) => (
                    <TableRow
                      key={account.id}
                      className="group border-border/40 transition-colors hover:bg-muted/30"
                    >
                      <TableCell className="py-2.5">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {account.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            {account.isActive ? "Aktif" : "Nonaktif"}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <AccountTypeBadge type={account.type} />
                      </TableCell>
                      <TableCell className="py-2.5 text-xs tabular-nums text-muted-foreground">
                        {formatCurrencyIDR(account.initialBalance)}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs font-bold tabular-nums text-foreground">
                        {formatCurrencyIDR(account.currentBalance)}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs text-muted-foreground">
                        {account.transactionCount} transaksi
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
                        <div className="flex justify-end gap-1">
                          <AccountFormDialog account={account} />
                          <AccountDeleteButton
                            accountId={account.id}
                            disabled={account.transactionCount > 0}
                          />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </DataTableCard>

      <PageFab>
        <AccountFormDialog />
      </PageFab>
    </section>
  );
}
