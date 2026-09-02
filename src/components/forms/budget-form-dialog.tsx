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
            <Button variant="ghost" size="sm" className="text-[11px]">
              <SquarePen className="size-3.5" />
              Edit
            </Button>
          ) : (
            <Button size="sm" className="rounded-full text-[11px] h-7 gap-1">
              <Plus className="size-3.5" />
              Tambah budget
            </Button>
          )
        }
      />
      <DialogContent className="max-w-md rounded-xl p-4">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-sm">{isEdit ? "Edit budget" : "Tambah budget"}</DialogTitle>
          <DialogDescription className="text-[11px]">
            Budget hanya berlaku untuk kategori expense dan unik per kategori pada satu periode.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <Field data-invalid={!!form.formState.errors.categoryId}>
            <FieldLabel className="text-[11px]">Kategori expense</FieldLabel>
            <FieldContent>
              <Select
                value={selectedCategoryId ?? ""}
                onValueChange={(value) =>
                  form.setValue("categoryId", value ?? "", {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="h-8 w-full rounded-lg text-[11px]">
                  <SelectValue placeholder="Pilih kategori expense">
                    {expenseCategories.find((c) => c.id === selectedCategoryId)?.name}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {expenseCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-[11px]">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.categoryId ? (
                <FieldError errors={[form.formState.errors.categoryId]} className="text-[11px]" />
              ) : null}
            </FieldContent>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.periodMonth}>
              <FieldLabel className="text-[11px]">Bulan</FieldLabel>
              <FieldContent>
                <Select
                  value={selectedPeriodMonth ? String(selectedPeriodMonth) : ""}
                  onValueChange={(value) =>
                    form.setValue("periodMonth", Number(value ?? selectedMonth), {
                      shouldValidate: true,
                    })
                  }
                >
                  <SelectTrigger className="h-8 w-full rounded-lg text-[11px]">
                    <SelectValue placeholder="Pilih bulan">
                      {monthOptions.find((m) => m.value === selectedPeriodMonth)?.label}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {monthOptions.map((month) => (
                      <SelectItem key={month.value} value={String(month.value)} className="text-[11px]">
                        {month.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.periodMonth ? (
                  <FieldError errors={[form.formState.errors.periodMonth]} className="text-[11px]" />
                ) : null}
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.periodYear}>
              <FieldLabel htmlFor="budget-year" className="text-[11px]">Tahun</FieldLabel>
              <FieldContent>
                <Input
                  id="budget-year"
                  type="number"
                  min="2000"
                  max="2100"
                  className="h-8 rounded-lg text-[11px]"
                  {...form.register("periodYear", { valueAsNumber: true })}
                />
                {form.formState.errors.periodYear ? (
                  <FieldError errors={[form.formState.errors.periodYear]} className="text-[11px]" />
                ) : null}
              </FieldContent>
            </Field>
          </div>

          <Field data-invalid={!!form.formState.errors.amount}>
            <FieldLabel htmlFor="budget-amount" className="text-[11px]">Nominal budget</FieldLabel>
            <FieldContent>
              <div className="flex gap-2">
                <Input
                  id="budget-amount"
                  type="text"
                  inputMode="numeric"
                  className="h-8 rounded-lg text-[11px] flex-1"
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
                  className="h-8 rounded-lg text-[11px] px-2.5"
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
                <FieldError errors={[form.formState.errors.amount]} className="text-[11px]" />
              ) : null}
            </FieldContent>
          </Field>

          {message ? <FormMessage tone={message.tone} message={message.text} /> : null}

          <div className="flex flex-col gap-2 sm:flex-row sm:justify-end pt-1">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="rounded-lg text-[11px] h-7"
              onClick={() => setOpen(false)}
            >
              Batal
            </Button>
            <Button type="submit" size="sm" className="rounded-lg text-[11px] h-7" disabled={pending}>
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
