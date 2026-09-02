import { endOfMonth, format, startOfMonth, subMonths } from "date-fns";
import { id as localeId } from "date-fns/locale";

import { createClient } from "@/lib/supabase/server";
import {
  buildMonthlyAggregation,
  sumTransactionAmountsByType,
} from "@/lib/queries/aggregates";
import { getAccountsWithBalances } from "@/lib/queries/accounts";
import { getBudgetsByPeriod } from "@/lib/queries/budgets";
import { getSavingsGoals } from "@/lib/queries/savings-goals";
import {
  getTransactionFormOptions,
  type TransactionOptionAccount,
  type TransactionOptionCategory,
} from "@/lib/queries/transactions";
import { formatCurrencyIDR, formatDateID } from "@/lib/utils/format";

type DashboardTransactionRow = {
  id: string;
  type: "income" | "expense" | "transfer";
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
  account_id: string | null;
  category_id: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
};

type MonthlyChartPoint = ReturnType<typeof buildMonthlyAggregation>[number];

type PieChartPoint = {
  name: string;
  value: number;
  color: string;
};

type RecentTransaction = {
  id: string;
  type: DashboardTransactionRow["type"];
  amount: number;
  description: string | null;
  transactionDate: string;
  accountLabel: string;
  categoryLabel: string | null;
};

type DashboardInsight = {
  title: string;
  value: string;
  helper: string;
  tone: "default" | "positive" | "warning";
};

export type DashboardData = {
  summary: {
    totalBalance: number;
    incomeThisMonth: number;
    expenseThisMonth: number;
    remainingThisMonth: number;
    activeSavingsGoals: number;
  };
  charts: {
    monthlyComparison: MonthlyChartPoint[];
    expenseByCategory: PieChartPoint[];
    cashflowTrend: MonthlyChartPoint[];
  };
  recentTransactions: RecentTransaction[];
  insights: DashboardInsight[];
  accounts: TransactionOptionAccount[];
  incomeCategories: TransactionOptionCategory[];
  expenseCategories: TransactionOptionCategory[];
};

export async function getDashboardData(): Promise<DashboardData> {
  const supabase = await createClient();
  const now = new Date();
  const currentMonthStart = startOfMonth(now);
  const currentMonthEnd = endOfMonth(now);
  const previousMonthStart = startOfMonth(subMonths(now, 1));
  const previousMonthEnd = endOfMonth(subMonths(now, 1));
  const oldestChartMonthStart = startOfMonth(subMonths(now, 5));

  const monthKeys = Array.from({ length: 6 }, (_, index) => {
    const date = subMonths(now, 5 - index);

    return {
      monthKey: format(date, "yyyy-MM"),
      label: format(date, "MMM", { locale: localeId }),
    };
  });

  const [
    accountsData,
    budgetsData,
    savingsGoalsData,
    options,
    activeFormOptions,
    recentTransactionsResult,
    chartTransactionsResult,
    currentMonthTransactionsResult,
    previousMonthExpenseResult,
  ] = await Promise.all([
    getAccountsWithBalances(),
    getBudgetsByPeriod({
      month: now.getMonth() + 1,
      year: now.getFullYear(),
    }),
    getSavingsGoals(),
    getTransactionFormOptions({ activeOnly: false }),
    getTransactionFormOptions({ activeOnly: true }),
    supabase
      .from("transactions")
      .select(
        "id, type, amount, description, transaction_date, created_at, account_id, category_id, from_account_id, to_account_id",
      )
      .order("transaction_date", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(8),
    supabase
      .from("transactions")
      .select(
        "id, type, amount, description, transaction_date, created_at, account_id, category_id, from_account_id, to_account_id",
      )
      .gte("transaction_date", format(oldestChartMonthStart, "yyyy-MM-dd"))
      .lte("transaction_date", format(currentMonthEnd, "yyyy-MM-dd"))
      .order("transaction_date", { ascending: false }),
    supabase
      .from("transactions")
      .select(
        "id, type, amount, description, transaction_date, created_at, account_id, category_id, from_account_id, to_account_id",
      )
      .gte("transaction_date", format(currentMonthStart, "yyyy-MM-dd"))
      .lte("transaction_date", format(currentMonthEnd, "yyyy-MM-dd"))
      .order("transaction_date", { ascending: false }),
    supabase
      .from("transactions")
      .select(
        "id, type, amount, description, transaction_date, created_at, account_id, category_id, from_account_id, to_account_id",
      )
      .eq("type", "expense")
      .gte("transaction_date", format(previousMonthStart, "yyyy-MM-dd"))
      .lte("transaction_date", format(previousMonthEnd, "yyyy-MM-dd")),
  ]);

  if (recentTransactionsResult.error) {
    throw new Error(recentTransactionsResult.error.message);
  }

  if (chartTransactionsResult.error) {
    throw new Error(chartTransactionsResult.error.message);
  }

  if (currentMonthTransactionsResult.error) {
    throw new Error(currentMonthTransactionsResult.error.message);
  }

  if (previousMonthExpenseResult.error) {
    throw new Error(previousMonthExpenseResult.error.message);
  }

  const accountsMap = new Map(options.accounts.map((account) => [account.id, account]));
  const categoriesMap = new Map(
    [...options.incomeCategories, ...options.expenseCategories].map((category) => [
      category.id,
      category,
    ]),
  );

  const latestTransactions: RecentTransaction[] = (
    (recentTransactionsResult.data ?? []) as DashboardTransactionRow[]
  ).map((transaction) => {
    let accountLabel = "-";
    if (transaction.type === "transfer") {
      const fromName = transaction.from_account_id
        ? accountsMap.get(transaction.from_account_id)?.name ?? "Unknown"
        : "Unknown";
      const toName = transaction.to_account_id
        ? accountsMap.get(transaction.to_account_id)?.name ?? "Unknown"
        : "Unknown";
      accountLabel = `${fromName} → ${toName}`;
    } else if (transaction.account_id) {
      accountLabel = accountsMap.get(transaction.account_id)?.name ?? "-";
    }

    return {
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      description: transaction.description,
      transactionDate: transaction.transaction_date,
      accountLabel,
      categoryLabel: transaction.category_id
        ? categoriesMap.get(transaction.category_id)?.name ?? null
        : null,
    };
  });

  const chartTransactions = (
    (chartTransactionsResult.data ?? []) as DashboardTransactionRow[]
  ).map((transaction) => ({
    type: transaction.type,
    amount: Number(transaction.amount),
    transaction_date: transaction.transaction_date,
  }));

  const currentMonthTransactions = (
    (currentMonthTransactionsResult.data ?? []) as DashboardTransactionRow[]
  ).map((transaction) => ({
    type: transaction.type,
    amount: Number(transaction.amount),
    category_id: transaction.category_id,
  }));

  const monthlyAggregation = buildMonthlyAggregation(chartTransactions, monthKeys);

  const incomeThisMonth = sumTransactionAmountsByType(
    currentMonthTransactions,
    "income",
  );
  const expenseThisMonth = sumTransactionAmountsByType(
    currentMonthTransactions,
    "expense",
  );

  const previousMonthExpenseTotal = (
    (previousMonthExpenseResult.data ?? []) as DashboardTransactionRow[]
  ).reduce((total, transaction) => total + Number(transaction.amount), 0);

  const expenseByCategoryMap = new Map<string, number>();

  currentMonthTransactions
    .filter((transaction) => transaction.type === "expense" && transaction.category_id)
    .forEach((transaction) => {
      const categoryId = transaction.category_id!;
      const categoryName = categoriesMap.get(categoryId)?.name ?? "Lainnya";
      expenseByCategoryMap.set(
        categoryName,
        (expenseByCategoryMap.get(categoryName) ?? 0) + transaction.amount,
      );
    });

  const colors = [
    "#F43F5E",
    "#FB923C",
    "#FACC15",
    "#4ADE80",
    "#38BDF8",
    "#818CF8",
    "#C084FC",
    "#F472B6",
  ];

  const expenseByCategory: PieChartPoint[] = Array.from(
    expenseByCategoryMap.entries(),
  ).map(([name, value], index) => ({
    name,
    value,
    color: colors[index % colors.length]!,
  }));

  const atRiskBudgets = budgetsData.budgets.filter(
    (budget) => budget.status === "hampir habis" || budget.status === "melewati budget",
  );

  const highlightedBudget = atRiskBudgets.sort(
    (a, b) => b.percentageUsed - a.percentageUsed,
  )[0];

  const nearestSavingsGoal = savingsGoalsData.goals
    .filter((goal) => goal.status === "active" && goal.targetDate)
    .sort((a, b) => {
      if (!a.targetDate) return 1;
      if (!b.targetDate) return -1;
      return new Date(a.targetDate).getTime() - new Date(b.targetDate).getTime();
    })[0];

  const insights: DashboardInsight[] = [
    {
      title: "Perubahan Pengeluaran",
      value: formatCurrencyIDR(expenseThisMonth),
      helper:
        previousMonthExpenseTotal > 0
          ? `Bulan lalu: ${formatCurrencyIDR(previousMonthExpenseTotal)}`
          : "Belum ada pembanding bulan lalu",
      tone: expenseThisMonth > previousMonthExpenseTotal ? "warning" : "positive",
    },
    {
      title: "Budget hampir habis",
      value: highlightedBudget
        ? `${highlightedBudget.categoryName} (${highlightedBudget.percentageUsed.toFixed(1)}%)`
        : "Belum ada yang berisiko",
      helper: highlightedBudget
        ? `${atRiskBudgets.length} budget sedang mendekati atau melewati batas bulan ini.`
        : "Budget dengan status hampir habis atau melewati budget akan muncul di sini.",
      tone: highlightedBudget ? "warning" : "default",
    },
    {
      title: "Deadline tabungan terdekat",
      value: nearestSavingsGoal
        ? `${nearestSavingsGoal.name} - ${formatDateID(
            nearestSavingsGoal.targetDate ?? "",
          )}`
        : "Belum ada deadline aktif",
      helper: nearestSavingsGoal
        ? nearestSavingsGoal.isOverdue
          ? `Target ini sudah melewati deadline dengan sisa ${formatCurrencyIDR(
              nearestSavingsGoal.remainingAmount,
            )}.`
          : `Sisa yang perlu dikumpulkan ${formatCurrencyIDR(
              nearestSavingsGoal.remainingAmount,
            )}.`
        : "Target active dengan tanggal paling dekat akan muncul di sini.",
      tone: nearestSavingsGoal?.isOverdue ? "warning" : "default",
    },
  ];

  return {
    summary: {
      totalBalance: accountsData.totalBalance,
      incomeThisMonth,
      expenseThisMonth,
      remainingThisMonth: incomeThisMonth - expenseThisMonth,
      activeSavingsGoals: savingsGoalsData.activeCount,
    },
    charts: {
      monthlyComparison: monthlyAggregation,
      expenseByCategory,
      cashflowTrend: monthlyAggregation,
    },
    recentTransactions: latestTransactions,
    insights,
    accounts: activeFormOptions.accounts,
    incomeCategories: activeFormOptions.incomeCategories,
    expenseCategories: activeFormOptions.expenseCategories,
  };
}
