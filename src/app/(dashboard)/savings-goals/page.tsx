import { CalendarClock, Flag, PiggyBank, TrendingUp } from "lucide-react";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { SavingsGoalDeleteButton } from "@/components/dashboard/savings-goal-delete-button";
import { SavingsGoalStatusBadge } from "@/components/dashboard/savings-goal-status-badge";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { SavingsGoalFormDialog } from "@/components/forms/savings-goal-form-dialog";
import { SavingsProgressDialog } from "@/components/forms/savings-progress-dialog";
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
import { getSavingsGoals } from "@/lib/queries/savings-goals";
import { formatCurrencyIDR, formatDateID } from "@/lib/utils/format";
import { cn } from "@/lib/utils";

export default async function SavingsGoalsPage() {
  const result = await getSavingsGoals()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Gagal memuat target tabungan.",
    }));

  const header = (
    <PageHeader
      eyebrow="Pelacakan Tabungan"
      title="Target Tabungan"
      description="Kelola target tabungan pribadi, pantau progress, dan cek deadline setiap target secara ringkas."
    />
  );

  if (result.error || !result.data) {
    return (
      <section className="space-y-5">
        {header}
        <ErrorState description={result.error ?? "Gagal memuat target tabungan."} />
      </section>
    );
  }

  const {
    goals,
    activeCount,
    completedCount,
    cancelledCount,
    totalTargetAmount,
    totalCurrentAmount,
  } = result.data;

  const overallProgress =
    totalTargetAmount > 0
      ? Math.min((totalCurrentAmount / totalTargetAmount) * 100, 100)
      : 0;

  return (
    <section className="space-y-5 pb-24">
      {header}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Target aktif"
          value={`${activeCount}`}
          helper="Jumlah target tabungan yang masih berjalan"
          icon={Flag}
          variant="default"
        />
        <SummaryCard
          label="Nominal target"
          value={formatCurrencyIDR(totalTargetAmount)}
          helper="Total seluruh target nominal tabungan"
          icon={PiggyBank}
          variant="savings"
        />
        <SummaryCard
          label="Nominal terkumpul"
          value={formatCurrencyIDR(totalCurrentAmount)}
          helper="Akumulasi progress tabungan yang sudah tercatat"
          icon={TrendingUp}
          variant="income"
        />
        <SummaryCard
          label="Selesai / dibatalkan"
          value={`${completedCount + cancelledCount}`}
          helper="Gabungan target yang completed atau cancelled"
          icon={CalendarClock}
          variant="default"
        />
      </div>

      {totalTargetAmount > 0 && (
        <div className="rounded-lg border border-border/60 bg-card p-4">
          <div className="flex items-center justify-between mb-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground">
                Progress Keseluruhan
              </h3>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Akumulasi semua target tabungan
              </p>
            </div>
            <span className="text-sm font-bold text-primary">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="mt-1.5 flex items-center justify-between text-[11px] text-muted-foreground">
            <span>{formatCurrencyIDR(totalCurrentAmount)} terkumpul</span>
            <span>dari {formatCurrencyIDR(totalTargetAmount)}</span>
          </div>
        </div>
      )}

      <DataTableCard
        title="Daftar Target Tabungan"
        description="Untuk MVP, progress disimpan langsung pada nominal terkumpul dan bisa diupdate kapan saja"
      >
        {goals.length === 0 ? (
          <EmptyState
            title="Belum ada target tabungan"
            description="Tambahkan target pertama Anda untuk mulai memantau progress menabung."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/60">
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Target
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Status
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Target Nominal
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Terkumpul
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Progress
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Deadline
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground text-right">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {goals.map((goal) => (
                  <TableRow
                    key={goal.id}
                    className="group border-border/40 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-2">
                      <div>
                        <p className="font-semibold text-[11px] text-foreground">
                          {goal.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          Sisa {formatCurrencyIDR(goal.remainingAmount)}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <SavingsGoalStatusBadge status={goal.status} />
                    </TableCell>
                    <TableCell className="py-2 text-[11px] font-medium text-foreground">
                      {formatCurrencyIDR(goal.targetAmount)}
                    </TableCell>
                    <TableCell className="py-2 text-[11px] text-muted-foreground">
                      {formatCurrencyIDR(goal.currentAmount)}
                    </TableCell>
                    <TableCell className="py-2 min-w-[180px]">
                      <div className="space-y-1">
                        <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-500",
                              goal.status === "cancelled" && "bg-muted-foreground/40",
                              goal.status === "completed" && "bg-sky-500",
                              goal.status === "active" && "bg-emerald-500",
                            )}
                            style={{ width: `${goal.progressPercentage}%` }}
                          />
                        </div>
                        <p className="text-[11px] text-muted-foreground">
                          {goal.progressPercentage.toFixed(1)}% tercapai
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      {goal.targetDate ? (
                        <div>
                          <p
                            className={cn(
                              "text-[11px]",
                              goal.isOverdue
                                ? "font-medium text-rose-600 dark:text-rose-400"
                                : "text-foreground",
                            )}
                          >
                            {formatDateID(goal.targetDate)}
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            {goal.isOverdue ? "Terlambat" : "Masih sesuai rencana"}
                          </p>
                        </div>
                      ) : (
                        <span className="text-[11px] text-muted-foreground">-</span>
                      )}
                    </TableCell>
                    <TableCell className="py-2 text-right">
                      <div className="flex justify-end gap-1">
                        <SavingsProgressDialog goal={goal} />
                        <SavingsGoalFormDialog goal={goal} />
                        <SavingsGoalDeleteButton goalId={goal.id} />
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
        <SavingsGoalFormDialog />
      </div>
    </section>
  );
}
