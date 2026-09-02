import { CalendarClock, Flag, PiggyBank, TrendingUp } from "lucide-react";

import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageFab } from "@/components/dashboard/page-fab";
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

type Goal = Awaited<ReturnType<typeof getSavingsGoals>>["goals"][number];

const goalProgressColor = {
  active: "bg-emerald-500",
  completed: "bg-sky-500",
  cancelled: "bg-muted-foreground/40",
} as const;

function GoalProgressBar({ goal }: { goal: Goal }) {
  return (
    <div className="space-y-1">
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div
          className={cn(
            "h-full rounded-full transition-all duration-500",
            goalProgressColor[goal.status]
          )}
          style={{ width: `${Math.min(goal.progressPercentage, 100)}%` }}
        />
      </div>
      <p className="text-[11px] text-muted-foreground">
        {goal.progressPercentage.toFixed(1)}% tercapai
      </p>
    </div>
  );
}

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
      <section className="space-y-6">
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
    <section className="space-y-6">
      {header}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        <SummaryCard
          label="Target aktif"
          value={`${activeCount}`}
          helper="Target yang masih berjalan"
          icon={Flag}
          variant="default"
        />
        <SummaryCard
          label="Nominal target"
          value={formatCurrencyIDR(totalTargetAmount)}
          helper="Total seluruh target"
          icon={PiggyBank}
          variant="savings"
        />
        <SummaryCard
          label="Nominal terkumpul"
          value={formatCurrencyIDR(totalCurrentAmount)}
          helper="Progress yang sudah tercatat"
          icon={TrendingUp}
          variant="income"
        />
        <SummaryCard
          label="Selesai / dibatalkan"
          value={`${completedCount + cancelledCount}`}
          helper="Completed + cancelled"
          icon={CalendarClock}
          variant="default"
        />
      </div>

      {totalTargetAmount > 0 && (
        <div className="rounded-2xl border border-border/70 bg-card p-5 shadow-soft">
          <div className="mb-2.5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Progress Keseluruhan
              </h3>
              <p className="mt-0.5 text-xs text-muted-foreground">
                Akumulasi semua target tabungan
              </p>
            </div>
            <span className="rounded-full bg-accent px-3 py-1 text-sm font-extrabold text-accent-foreground">
              {overallProgress.toFixed(1)}%
            </span>
          </div>
          <div className="h-2.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">
              {formatCurrencyIDR(totalCurrentAmount)} terkumpul
            </span>
            <span>dari {formatCurrencyIDR(totalTargetAmount)}</span>
          </div>
        </div>
      )}

      <DataTableCard
        title="Daftar Target Tabungan"
        description="Progress disimpan langsung pada nominal terkumpul dan bisa diupdate kapan saja."
      >
        {goals.length === 0 ? (
          <EmptyState
            title="Belum ada target tabungan"
            description="Tambahkan target pertama Anda untuk mulai memantau progress menabung."
          />
        ) : (
          <>
            {/* Tampilan mobile: card list */}
            <ul className="grid gap-3 md:hidden">
              {goals.map((goal) => (
                <li
                  key={goal.id}
                  className="rounded-2xl border border-border/70 bg-card p-4 shadow-soft"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-foreground">
                        {goal.name}
                      </p>
                      <p className="mt-0.5 text-[11px] text-muted-foreground">
                        Sisa {formatCurrencyIDR(goal.remainingAmount)}
                      </p>
                    </div>
                    <SavingsGoalStatusBadge status={goal.status} />
                  </div>

                  <div className="mt-3">
                    <GoalProgressBar goal={goal} />
                  </div>

                  <div className="mt-3 flex items-center justify-between gap-2 text-xs">
                    <div>
                      <p className="text-[11px] text-muted-foreground">Terkumpul</p>
                      <p className="font-bold tabular-nums text-foreground">
                        {formatCurrencyIDR(goal.currentAmount)}
                        <span className="ml-1 font-normal text-muted-foreground">
                          / {formatCurrencyIDR(goal.targetAmount)}
                        </span>
                      </p>
                    </div>
                    {goal.targetDate ? (
                      <div className="text-right">
                        <p className="text-[11px] text-muted-foreground">Deadline</p>
                        <p
                          className={cn(
                            "font-semibold",
                            goal.isOverdue
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-foreground"
                          )}
                        >
                          {formatDateID(goal.targetDate)}
                        </p>
                      </div>
                    ) : null}
                  </div>

                  <div className="mt-3 flex items-center justify-end gap-1 border-t border-border/50 pt-3">
                    <SavingsProgressDialog goal={goal} />
                    <SavingsGoalFormDialog goal={goal} />
                    <SavingsGoalDeleteButton goalId={goal.id} />
                  </div>
                </li>
              ))}
            </ul>

            {/* Tampilan desktop: tabel */}
            <div className="hidden overflow-x-auto md:block">
              <Table>
                <TableHeader>
                  <TableRow className="border-border/60 hover:bg-transparent">
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Target
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Status
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Target Nominal
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Terkumpul
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Progress
                    </TableHead>
                    <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
                      Deadline
                    </TableHead>
                    <TableHead className="h-9 py-2 text-right text-xs font-semibold text-muted-foreground">
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
                      <TableCell className="py-2.5">
                        <div>
                          <p className="text-xs font-bold text-foreground">
                            {goal.name}
                          </p>
                          <p className="mt-0.5 text-[11px] text-muted-foreground">
                            Sisa {formatCurrencyIDR(goal.remainingAmount)}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell className="py-2.5">
                        <SavingsGoalStatusBadge status={goal.status} />
                      </TableCell>
                      <TableCell className="py-2.5 text-xs font-semibold tabular-nums text-foreground">
                        {formatCurrencyIDR(goal.targetAmount)}
                      </TableCell>
                      <TableCell className="py-2.5 text-xs tabular-nums text-muted-foreground">
                        {formatCurrencyIDR(goal.currentAmount)}
                      </TableCell>
                      <TableCell className="min-w-[180px] py-2.5">
                        <GoalProgressBar goal={goal} />
                      </TableCell>
                      <TableCell className="py-2.5">
                        {goal.targetDate ? (
                          <div>
                            <p
                              className={cn(
                                "text-xs",
                                goal.isOverdue
                                  ? "font-semibold text-rose-600 dark:text-rose-400"
                                  : "text-foreground",
                              )}
                            >
                              {formatDateID(goal.targetDate)}
                            </p>
                            <p className="mt-0.5 text-[11px] text-muted-foreground">
                              {goal.isOverdue ? "Terlambat" : "Masih sesuai rencana"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="py-2.5 text-right">
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
          </>
        )}
      </DataTableCard>

      <PageFab>
        <SavingsGoalFormDialog />
      </PageFab>
    </section>
  );
}
