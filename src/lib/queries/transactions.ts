import { createClient } from "@/lib/supabase/server";

type TransactionRow = {
  id: string;
  type: "income" | "expense" | "transfer";
  account_id: string | null;
  category_id: string | null;
  from_account_id: string | null;
  to_account_id: string | null;
  amount: number;
  description: string | null;
  transaction_date: string;
  created_at: string;
};

type AccountOptionRow = {
  id: string;
  name: string;
  type: "cash" | "bank" | "ewallet" | "savings";
  is_active: boolean;
};

type CategoryOptionRow = {
  id: string;
  name: string;
  type: "income" | "expense";
  color: string | null;
  icon: string | null;
  is_active: boolean;
};

export type TransactionOptionAccount = {
  id: string;
  name: string;
  type: AccountOptionRow["type"];
};

export type TransactionOptionCategory = {
  id: string;
  name: string;
  type: CategoryOptionRow["type"];
  color: string;
  icon: string | null;
};

export type TransactionSummary = {
  id: string;
  type: TransactionRow["type"];
  amount: number;
  description: string | null;
  transactionDate: string;
  createdAt: string;
  accountId: string | null;
  categoryId: string | null;
  fromAccountId: string | null;
  toAccountId: string | null;
  accountName: string | null;
  categoryName: string | null;
  fromAccountName: string | null;
  toAccountName: string | null;
};

export type TransactionFilters = {
  dateFrom?: string;
  dateTo?: string;
  type?: "income" | "expense" | "transfer";
  categoryId?: string;
  accountId?: string;
  q?: string;
  page?: number;
  pageSize?: number;
};

export async function getTransactionFormOptions({
  activeOnly = true,
}: {
  activeOnly?: boolean;
} = {}) {
  const supabase = await createClient();

  const accountsQuery = supabase
    .from("accounts")
    .select("id, name, type, is_active")
    .order("name", { ascending: true });

  const categoriesQuery = supabase
    .from("categories")
    .select("id, name, type, color, icon, is_active")
    .order("name", { ascending: true });

  const [accountsResult, categoriesResult] = await Promise.all([
    activeOnly ? accountsQuery.eq("is_active", true) : accountsQuery,
    activeOnly ? categoriesQuery.eq("is_active", true) : categoriesQuery,
  ]);

  if (accountsResult.error) {
    throw new Error(accountsResult.error.message);
  }

  if (categoriesResult.error) {
    throw new Error(categoriesResult.error.message);
  }

  const accounts = ((accountsResult.data ?? []) as AccountOptionRow[]).map(
    (account) => ({
      id: account.id,
      name: account.name,
      type: account.type,
    }),
  );

  const categories = ((categoriesResult.data ?? []) as CategoryOptionRow[]).map(
    (category) => ({
      id: category.id,
      name: category.name,
      type: category.type,
      color: category.color ?? "#94A3B8",
      icon: category.icon,
    }),
  );

  return {
    accounts,
    incomeCategories: categories.filter((category) => category.type === "income"),
    expenseCategories: categories.filter((category) => category.type === "expense"),
  };
}

export async function getTransactions(filters: TransactionFilters = {}) {
  const supabase = await createClient();
  const page = Math.max(1, filters.page ?? 1);
  const pageSize = Math.max(1, Math.min(filters.pageSize ?? 10, 50));
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let transactionsQuery = supabase
    .from("transactions")
    .select(
      "id, type, account_id, category_id, from_account_id, to_account_id, amount, description, transaction_date, created_at",
      { count: "exact" },
    )
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (filters.dateFrom) {
    transactionsQuery = transactionsQuery.gte("transaction_date", filters.dateFrom);
  }

  if (filters.dateTo) {
    transactionsQuery = transactionsQuery.lte("transaction_date", filters.dateTo);
  }

  if (filters.type) {
    transactionsQuery = transactionsQuery.eq("type", filters.type);
  }

  if (filters.categoryId) {
    transactionsQuery = transactionsQuery.eq("category_id", filters.categoryId);
  }

  if (filters.accountId) {
    transactionsQuery = transactionsQuery.or(
      `account_id.eq.${filters.accountId},from_account_id.eq.${filters.accountId},to_account_id.eq.${filters.accountId}`,
    );
  }

  if (filters.q) {
    transactionsQuery = transactionsQuery.ilike("description", `%${filters.q}%`);
  }

  const [transactionsResult, formOptions, allOptions] = await Promise.all([
    transactionsQuery.range(from, to),
    getTransactionFormOptions(),
    getTransactionFormOptions({ activeOnly: false }),
  ]);

  if (transactionsResult.error) {
    throw new Error(transactionsResult.error.message);
  }

  const accountsMap = new Map(allOptions.accounts.map((account) => [account.id, account]));
  const categoriesMap = new Map(
    [...allOptions.incomeCategories, ...allOptions.expenseCategories].map(
      (category) => [category.id, category],
    ),
  );

  const transactions = ((transactionsResult.data ?? []) as TransactionRow[]).map(
    (transaction) => ({
      id: transaction.id,
      type: transaction.type,
      amount: Number(transaction.amount),
      description: transaction.description,
      transactionDate: transaction.transaction_date,
      createdAt: transaction.created_at,
      accountId: transaction.account_id,
      categoryId: transaction.category_id,
      fromAccountId: transaction.from_account_id,
      toAccountId: transaction.to_account_id,
      accountName: transaction.account_id
        ? accountsMap.get(transaction.account_id)?.name ?? null
        : null,
      categoryName: transaction.category_id
        ? categoriesMap.get(transaction.category_id)?.name ?? null
        : null,
      fromAccountName: transaction.from_account_id
        ? accountsMap.get(transaction.from_account_id)?.name ?? null
        : null,
      toAccountName: transaction.to_account_id
        ? accountsMap.get(transaction.to_account_id)?.name ?? null
        : null,
    }),
  );

  return {
    transactions,
    ...formOptions,
    totalCount: transactionsResult.count ?? 0,
    page,
    pageSize,
    totalPages: Math.max(1, Math.ceil((transactionsResult.count ?? 0) / pageSize)),
    filters: {
      dateFrom: filters.dateFrom ?? "",
      dateTo: filters.dateTo ?? "",
      type: filters.type ?? "",
      categoryId: filters.categoryId ?? "",
      accountId: filters.accountId ?? "",
      q: filters.q ?? "",
    },
  };
}
