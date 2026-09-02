"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, SquarePen } from "lucide-react";
import { z } from "zod";

import {
  createBudgetAction,
  updateBudgetAction,
} from "@/app/(dashboard)/budgets/actions";
import { FormMessage } from "@/components/forms/form-message";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldContent, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  BudgetExpenseCategory,
  BudgetSummary,
} from "@/lib/queries/budgets";
import { budgetSchema, type BudgetInput } from "@/lib/validations/budgets";

type BudgetFormDialogProps = {
  budget?: BudgetSummary;
  expenseCategories: BudgetExpenseCategory[];
  selectedMonth: number;
  selectedYear: number;
};

const monthOptions = [
  { value: 1, label: "Januari" },
  { value: 2, label: "Februari" },
  { value: 3, label: "Maret" },
  { value: 4, label: "April" },
  { value: 5, label: "Mei" },
  { value: 6, label: "Juni" },
  { value: 7, label: "Juli" },
  { value: 8, label: "Agustus" },
  { value: 9, label: "September" },
  { value: 10, label: "Oktober" },
  { value: 11, label: "November" },
  { value: 12, label: "Desember" },
];

export function BudgetFormDialog({
  budget,
  expenseCategories,
  selectedMonth,
  selectedYear,
}: BudgetFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  const [displayAmount, setDisplayAmount] = useState(() => {
    const val = budget?.amount ?? 0;
    return val > 0 ? val.toLocaleString("id-ID").replace(/,/g, ".") : "";
  });

  const defaultValues = useMemo<BudgetInput>(
    () => ({
      categoryId: budget?.categoryId ?? "",
      periodMonth: budget?.periodMonth ?? selectedMonth,
      periodYear: budget?.periodYear ?? selectedYear,
      amount: budget?.amount ?? 0,
    }),
    [budget, selectedMonth, selectedYear],
  );

  const form = useForm<z.input<typeof budgetSchema>, unknown, BudgetInput>({
    resolver: zodResolver(budgetSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      setMessage(null);
      form.reset(defaultValues);
      const val = budget?.amount ?? 0;
      setDisplayAmount(val > 0 ? val.toLocaleString("id-ID").replace(/,/g, ".") : "");
    }
  }, [open, budget, defaultValues, form]);

  const selectedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });
  const selectedPeriodMonth = useWatch({
    control: form.control,
    name: "periodMonth",
  });

  const isEdit = Boolean(budget);

  const onSubmit = (values: BudgetInput) => {
    setPending(true);
    setMessage(null);

    startTransition(async () => {
      const result = isEdit
        ? await updateBudgetAction(budget!.id, values)
        : await createBudgetAction(values);

      if (result.status === "error") {
        setMessage({
          tone: "error",
          text: result.message ?? "Gagal menyimpan budget.",
        });
        setPending(false);
        return;
      }

      setPending(false);
      setOpen(false);
      form.reset(defaultValues);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          isEdit ? (
            <Button variant="ghost" size="sm" className="text-xs">
              <SquarePen className="size-3.5" />
              Edit
            </Button>
          ) : (
            <Button className="h-12 gap-2 rounded-full px-5 text-sm font-bold shadow-lift">
              <Plus className="size-5" />
              <span className="hidden sm:inline">Tambah Budget</span>
              <span className="sm:hidden">Budget</span>
            </Button>
          )
        }
      />
      <DialogContent className="max-w-md rounded-2xl p-5">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-sm">{isEdit ? "Edit budget" : "Tambah budget"}</DialogTitle>
          <DialogDescription className="text-xs">
            Budget hanya berlaku untuk kategori expense dan unik per kategori pada satu periode.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <Field data-invalid={!!form.formState.errors.categoryId}>
            <FieldLabel className="text-xs">Kategori expense</FieldLabel>
            <FieldContent>
              <Select
                value={selectedCategoryId ?? ""}
                onValueChange={(value) =>
                  form.setValue("categoryId", value ?? "", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="h-10 w-full rounded-xl text-sm">
                  <SelectValue placeholder="Pilih kategori expense">
                    {expenseCategories.find((c) => c.id === selectedCategoryId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-xs">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId ? (
                <FieldError errors={[form.formState.errors.categoryId]} className="text-xs" />
              ) : null}
            </FieldContent>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.periodMonth}>
              <FieldLabel className="text-xs">Bulan</FieldLabel>
              <FieldContent>
                <Select
                  value={selectedPeriodMonth ? String(selectedPeriodMonth) : ""}
                  onValueChange={(value) =>
                    form.setValue("periodMonth", Number(value ?? selectedMonth), {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="h-10 w-full rounded-xl text-sm">
                    <SelectValue placeholder="Pilih bulan">
                      {monthOptions.find((m) => m.value === selectedPeriodMonth)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month.value} value={String(month.value)} className="text-xs">
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.periodMonth ? (
                  <FieldError errors={[form.formState.errors.periodMonth]} className="text-xs" />
                ) : null}
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.periodYear}>
              <FieldLabel htmlFor="budget-year" className="text-xs">Tahun</FieldLabel>
              <FieldContent>
                <Input
                  id="budget-year"
                  type="number"
                  min="2000"
                  max="2100"
                  className="h-10 rounded-xl text-sm"
                  {...form.register("periodYear", { valueAsNumber: true })}
                />
                {form.formState.errors.periodYear ? (
                  <FieldError errors={[form.formState.errors.periodYear]} className="text-xs" />
                ) : null}
              </FieldContent>
            </Field>
          </div>

          <Field data-invalid={!!form.formState.errors.amount}>
            <FieldLabel htmlFor="budget-amount" className="text-xs">Nominal budget</FieldLabel>
            <FieldContent>
              <div className="flex gap-2">
                <Input
                  id="budget-amount"
                  type="text"
                  inputMode="numeric"
                  className="h-10 rounded-xl text-sm flex-1"
                  placeholder="0"
                  value={displayAmount}
                  onChange={(e) => {
                    const raw = e.target.value.replace(/\D/g, "");
                    const formatted = raw
                      ? Number(raw).toLocaleString("id-ID").replace(/,/g, ".")
                      : "";
                    setDisplayAmount(formatted);
                    const numeric = formatted.replace(/\./g, "");
                    form.setValue("amount", numeric ? Number(numeric) : 0, {
                      shouldValidate: true,
                    });
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-xl text-sm px-2.5"
                  onClick={() => {
                    const raw = displayAmount.replace(/\./g, "");
                    const num = raw ? Number(raw) * 1000 : 0;
                    const formatted = num
                      ? num.toLocaleString("id-ID").replace(/,/g, ".")
                      : "";
                    setDisplayAmount(formatted);
                    form.setValue("amount", num, { shouldValidate: true });
                  }}
                >
                  000
                </Button>
              </div>
              {form.formState.errors.amount ? (
                <FieldError errors={[form.formState.errors.amount]} className="text-xs" />
              ) : null}
            </FieldContent>
          </Field>

          {message ? <FormMessage tone={message.tone} message={message.text} /> : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg text-xs h-7"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" className="rounded-lg text-xs h-7" disabled={pending}>
              {pending
                ? "Menyimpan..."
                : isEdit
                  ? "Simpan perubahan"
                  : "Buat budget"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
