import { Landmark, PiggyBank, Smartphone, Wallet } from "lucide-react";

import { AccountDeleteButton } from "@/components/dashboard/account-delete-button";
import { AccountTypeBadge } from "@/components/dashboard/account-type-badge";
import { DataTableCard } from "@/components/dashboard/data-table-card";
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

const totalByTypeIcons = {
  cash: Wallet,
  bank: Landmark,
  ewallet: Smartphone,
  savings: PiggyBank,
} as const;

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
      <section className="space-y-5">
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
      helper: "Dihitung dari saldo awal + transaksi",
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
      helper: "E-Wallet, Savings, Investasi, dll.",
      icon: PiggyBank,
      variant: "savings" as const,
    },
  ];

  return (
    <section className="space-y-5">
      {header}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
        description="Saldo aktual menggunakan rumus: saldo awal + income - expense + transfer masuk - transfer keluar."
      >
        {accounts.length === 0 ? (
          <EmptyState
            title="Belum ada akun keuangan"
            description="Tambahkan akun pertama Anda untuk mulai mencatat saldo dan transaksi."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/60">
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Akun
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Tipe
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Saldo Awal
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Saldo Aktual
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Transaksi
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground text-right">
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
                    <TableCell className="py-2">
                      <div>
                        <p className="font-semibold text-[11px] text-foreground">
                          {account.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {account.isActive ? "Aktif" : "Nonaktif"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <AccountTypeBadge type={account.type} />
                    </TableCell>
                    <TableCell className="py-2 text-[11px] text-muted-foreground">
                      {formatCurrencyIDR(account.initialBalance)}
                    </TableCell>
                    <TableCell className="py-2 text-[11px] font-bold text-foreground">
                      {formatCurrencyIDR(account.currentBalance)}
                    </TableCell>
                    <TableCell className="py-2 text-[11px] text-muted-foreground">
                      {account.transactionCount} transaksi
                    </TableCell>
                    <TableCell className="py-2 text-right">
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
        )}
      </DataTableCard>

      <div className="fixed bottom-6 right-6 z-50">
        <AccountFormDialog />
      </div>
    </section>
  );
}
