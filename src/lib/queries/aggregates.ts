import type { AccountType, TransactionType } from "@/lib/utils/finance";

export type BalanceAccountRow = {
  id: string;
  name: string;
  type: AccountType;
  initial_balance: number;
  is_active: boolean;
  created_at: string;
};

export type BalanceTransactionRow = {
  id: string;
  type: TransactionType;
  account_id: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  amount: number;
  transaction_date?: string;
  created_at?: string;
};

export type AccountBalanceSummary = {
  id: string;
  name: string;
  type: AccountType;
  initialBalance: number;
  currentBalance: number;
  transactionCount: number;
  isActive: boolean;
  createdAt: string;
};

export type MonthlyAggregationPoint = {
  label: string;
  monthKey: string;
  income: number;
  expense: number;
  net: number;
};

export function sumTransactionAmountsByType<
  TTransaction extends { amount: number; type: TransactionType },
>(transactions: TTransaction[], type: Exclude<TransactionType, "transfer">) {
  return transactions.reduce((total, transaction) => {
    if (transaction.type !== type) {
      return total;
    }

    return total + Number(transaction.amount);
  }, 0);
}

export function calculateAccountBalances(
  accounts: BalanceAccountRow[],
  transactions: BalanceTransactionRow[],
) {
  const accountMap = new Map<string, AccountBalanceSummary>(
    accounts.map((account) => [
      account.id,
      {
        id: account.id,
        name: account.name,
        type: account.type,
        initialBalance: Number(account.initial_balance),
        currentBalance: Number(account.initial_balance),
        transactionCount: 0,
        isActive: account.is_active,
        createdAt: account.created_at,
      },
    ]),
  );

  for (const transaction of transactions) {
    const amount = Number(transaction.amount);

    if (transaction.type === "income" && transaction.account_id) {
      const account = accountMap.get(transaction.account_id);

      if (account) {
        account.currentBalance += amount;
        account.transactionCount += 1;
      }
    }

    if (transaction.type === "expense" && transaction.account_id) {
      const account = accountMap.get(transaction.account_id);

      if (account) {
        account.currentBalance -= amount;
        account.transactionCount += 1;
      }
    }

    if (transaction.type === "transfer") {
      if (transaction.from_account_id) {
        const fromAccount = accountMap.get(transaction.from_account_id);

        if (fromAccount) {
          fromAccount.currentBalance -= amount;
          fromAccount.transactionCount += 1;
        }
      }

      if (transaction.to_account_id) {
        const toAccount = accountMap.get(transaction.to_account_id);

        if (toAccount) {
          toAccount.currentBalance += amount;
          toAccount.transactionCount += 1;
        }
      }
    }
  }

  const summaries = Array.from(accountMap.values());

  return {
    accounts: summaries,
    totalBalance: summaries.reduce(
      (total, account) => total + account.currentBalance,
      0,
    ),
  };
}

export function buildMonthlyAggregation(
  transactions: Array<{ type: TransactionType; amount: number; transaction_date: string }>,
  months: Array<{ label: string; monthKey: string }>,
) {
  const monthlyMap = new Map<string, MonthlyAggregationPoint>(
    months.map((month) => [
      month.monthKey,
      {
        label: month.label,
        monthKey: month.monthKey,
        income: 0,
        expense: 0,
        net: 0,
      },
    ]),
  );

  for (const transaction of transactions) {
    const monthKey = transaction.transaction_date.slice(0, 7);
    const point = monthlyMap.get(monthKey);

    if (!point) {
      continue;
    }

    const amount = Number(transaction.amount);

    if (transaction.type === "income") {
      point.income += amount;
      point.net += amount;
    }

    if (transaction.type === "expense") {
      point.expense += amount;
      point.net -= amount;
    }
  }

  return Array.from(monthlyMap.values());
}
