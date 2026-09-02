import {
  AlertTriangle,
  ArrowDownCircle,
  ArrowDownLeft,
  ArrowRightLeft,
  ArrowUpCircle,
  ArrowUpRight,
  CheckCircle2,
  Clock3,
  Coins,
  CreditCard,
  Landmark,
  Layers,
  PiggyBank,
  Receipt,
  Slash,
  Smartphone,
  TrendingUp,
  Wallet,
  type LucideIcon,
} from "lucide-react";

export type AccountType =
  | "cash"
  | "bank"
  | "ewallet"
  | "savings"
  | "crypto"
  | (string & {});
export type CategoryType = "income" | "expense";
export type TransactionType = "income" | "expense" | "transfer";
export type BudgetStatus = "aman" | "hampir habis" | "melewati budget";
export type SavingsGoalStatus = "active" | "completed" | "cancelled";

export function getAccountTypeMeta(type: string) {
  const config: Record<
    string,
    { label: string; icon: LucideIcon; className: string }
  > = {
    cash: {
      label: "Cash",
      icon: Wallet,
      className:
        "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    },
    bank: {
      label: "Bank",
      icon: Landmark,
      className:
        "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
    },
    ewallet: {
      label: "E-Wallet",
      icon: Smartphone,
      className:
        "bg-violet-500/10 text-violet-700 dark:bg-violet-500/15 dark:text-violet-400",
    },
    savings: {
      label: "Savings",
      icon: PiggyBank,
      className:
        "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
    crypto: {
      label: "Crypto",
      icon: Coins,
      className:
        "bg-purple-500/10 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400",
    },
  };

  if (config[type]) {
    return config[type];
  }

  const formattedLabel = type
    ? type.charAt(0).toUpperCase() + type.slice(1)
    : "Lainnya";

  return {
    label: formattedLabel,
    icon: Layers,
    className:
      "bg-slate-500/10 text-slate-700 dark:bg-slate-500/15 dark:text-slate-400",
  };
}

export function getCategoryTypeMeta(type: CategoryType) {
  return type === "income"
    ? {
      label: "Income",
      icon: ArrowUpCircle,
      className:
        "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    }
    : {
      label: "Expense",
      icon: ArrowDownCircle,
      className:
        "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    };
}

export function getTransactionTypeMeta(type: TransactionType) {
  const config: Record<
    TransactionType,
    { label: string; icon: LucideIcon; className: string }
  > = {
    income: {
      label: "Income",
      icon: ArrowUpRight,
      className:
        "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
    expense: {
      label: "Expense",
      icon: ArrowDownLeft,
      className:
        "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    },
    transfer: {
      label: "Transfer",
      icon: ArrowRightLeft,
      className:
        "bg-blue-500/10 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400",
    },
  };

  return config[type];
}

export function getBudgetStatusMeta(status: BudgetStatus) {
  const config: Record<
    BudgetStatus,
    { label: string; icon: LucideIcon; className: string }
  > = {
    aman: {
      label: "Aman",
      icon: CheckCircle2,
      className:
        "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
    "hampir habis": {
      label: "Hampir habis",
      icon: TrendingUp,
      className:
        "bg-amber-500/10 text-amber-700 dark:bg-amber-500/15 dark:text-amber-400",
    },
    "melewati budget": {
      label: "Melewati budget",
      icon: AlertTriangle,
      className:
        "bg-rose-500/10 text-rose-700 dark:bg-rose-500/15 dark:text-rose-400",
    },
  };

  return config[status];
}

export function getSavingsGoalStatusMeta(status: SavingsGoalStatus) {
  const config: Record<
    SavingsGoalStatus,
    { label: string; icon: LucideIcon; className: string }
  > = {
    active: {
      label: "Active",
      icon: Clock3,
      className:
        "bg-emerald-500/10 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400",
    },
    completed: {
      label: "Completed",
      icon: CheckCircle2,
      className:
        "bg-sky-500/10 text-sky-700 dark:bg-sky-500/15 dark:text-sky-400",
    },
    cancelled: {
      label: "Cancelled",
      icon: Slash,
      className:
        "bg-muted text-muted-foreground dark:bg-muted/50",
    },
  };

  return config[status];
}
