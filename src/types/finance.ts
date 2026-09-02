import type { AccountInput } from "@/lib/validations/accounts";
import type { CategoryInput } from "@/lib/validations/categories";
import type { BudgetInput } from "@/lib/validations/budgets";
import type { SavingsGoalInput } from "@/lib/validations/savings-goals";
import type { TransactionInput } from "@/lib/validations/transactions";

export type MutationState = {
  status: "idle" | "success" | "error";
  message: string | null;
};

export type AccountFormValues = AccountInput;
export type CategoryFormValues = CategoryInput;
export type BudgetFormValues = BudgetInput;
export type SavingsGoalFormValues = SavingsGoalInput;
export type TransactionFormValues = TransactionInput;
