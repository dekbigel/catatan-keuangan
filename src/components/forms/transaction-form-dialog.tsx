"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CalendarDays, Landmark, Plus, Repeat, SquarePen } from "lucide-react";
import { z } from "zod";

import {
  createTransactionAction,
  updateTransactionAction,
} from "@/app/(dashboard)/transactions/actions";
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
import {
  transactionSchema,
  type TransactionInput,
} from "@/lib/validations/transactions";
import type {
  TransactionOptionAccount,
  TransactionOptionCategory,
  TransactionSummary,
} from "@/lib/queries/transactions";

type TransactionFormDialogProps = {
  transaction?: TransactionSummary;
  accounts: TransactionOptionAccount[];
  incomeCategories: TransactionOptionCategory[];
  expenseCategories: TransactionOptionCategory[];
};

const typeConfig = {
  income: {
    label: "Income",
    icon: Landmark,
    className:
      "bg-emerald-500/10 text-emerald-700 border-emerald-500/40 dark:text-emerald-400",
  },
  expense: {
    label: "Expense",
    icon: CalendarDays,
    className:
      "bg-rose-500/10 text-rose-700 border-rose-500/40 dark:text-rose-400",
  },
  transfer: {
    label: "Transfer",
    icon: Repeat,
    className:
      "bg-sky-500/10 text-sky-700 border-sky-500/40 dark:text-sky-400",
  },
} as const;

function toDateInputValue(dateValue?: string | null) {
  if (!dateValue) {
    return new Date().toISOString().slice(0, 10);
  }

  return dateValue.slice(0, 10);
}

export function TransactionFormDialog({
  transaction,
  accounts,
  incomeCategories,
  expenseCategories,
}: TransactionFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  const [displayAmount, setDisplayAmount] = useState(() => {
    const val = transaction?.amount ?? 0;
    return val > 0 ? val.toLocaleString("id-ID").replace(/,/g, ".") : "";
  });

  const defaultValues = useMemo<TransactionInput>(
    () => ({
      type: transaction?.type ?? "expense",
      amount: transaction?.amount ?? 0,
      transactionDate: toDateInputValue(transaction?.transactionDate),
      description: transaction?.description ?? "",
      accountId: transaction?.accountId ?? "",
      categoryId: transaction?.categoryId ?? "",
      fromAccountId: transaction?.fromAccountId ?? "",
      toAccountId: transaction?.toAccountId ?? "",
    }),
    [transaction],
  );

  const form = useForm<z.input<typeof transactionSchema>, unknown, TransactionInput>(
    {
      resolver: zodResolver(transactionSchema),
      defaultValues,
    },
  );

  useEffect(() => {
    if (open) {
      setMessage(null);
      form.reset(defaultValues);
      const val = transaction?.amount ?? 0;
      setDisplayAmount(val > 0 ? val.toLocaleString("id-ID").replace(/,/g, ".") : "");
    }
  }, [open, transaction, defaultValues, form]);

  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });
  const selectedAccountId = useWatch({
    control: form.control,
    name: "accountId",
  });
  const selectedCategoryId = useWatch({
    control: form.control,
    name: "categoryId",
  });
  const selectedFromAccountId = useWatch({
    control: form.control,
    name: "fromAccountId",
  });
  const selectedToAccountId = useWatch({
    control: form.control,
    name: "toAccountId",
  });

  const activeCategories =
    selectedType === "income"
      ? incomeCategories
      : selectedType === "expense"
        ? expenseCategories
        : [];

  const isEdit = Boolean(transaction);

  const onSubmit = (values: TransactionInput) => {
    setPending(true);
    setMessage(null);

    startTransition(async () => {
      const result = isEdit
        ? await updateTransactionAction(transaction!.id, values)
        : await createTransactionAction(values);

      if (result.status === "error") {
        setMessage({
          tone: "error",
          text: result.message ?? "Gagal menyimpan transaksi.",
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
            <Button className="h-12 gap-2 rounded-full px-5 text-sm font-bold shadow-lift hover:shadow-lift">
              <Plus className="size-5" />
              <span className="hidden sm:inline">Tambah Transaksi</span>
              <span className="sm:hidden">Transaksi</span>
            </Button>
          )
        }
      />
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto rounded-2xl p-5">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-sm">
            {isEdit ? "Edit transaksi" : "Tambah transaksi"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Form akan berubah sesuai tipe transaksi: income, expense, atau transfer.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <div className="grid gap-2 sm:grid-cols-3">
            {Object.entries(typeConfig).map(([value, config]) => {
              const Icon = config.icon;
              const active = selectedType === value;

              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    form.setValue("type", value as TransactionInput["type"], {
                      shouldValidate: true,
                    });

                    if (value === "transfer") {
                      form.setValue("accountId", "");
                      form.setValue("categoryId", "");
                    } else {
                      form.setValue("fromAccountId", "");
                      form.setValue("toAccountId", "");
                    }
                  }}
                  className={`rounded-xl border px-3 py-2.5 text-left transition ${active
                    ? config.className
                    : "border-border bg-card text-foreground hover:border-border/80"
                    }`}
                >
                  <Icon className="size-4" />
                  <p className="mt-2 text-xs font-semibold">{config.label}</p>
                  <p className="mt-0.5 text-[11px] opacity-80">
                    {value === "transfer"
                      ? "Pindahkan saldo antar akun."
                      : value === "income"
                        ? "Catat pemasukan ke akun."
                        : "Catat pengeluaran dari akun."}
                  </p>
                </button>
              );
            })}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.amount}>
              <FieldLabel htmlFor="transaction-amount" className="text-xs">Nominal</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input
                    id="transaction-amount"
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

            <Field data-invalid={!!form.formState.errors.transactionDate}>
              <FieldLabel htmlFor="transaction-date" className="text-xs">Tanggal</FieldLabel>
              <FieldContent>
                <Input
                  id="transaction-date"
                  type="date"
                  className="h-10 rounded-xl text-sm"
                  {...form.register("transactionDate")}
                />
                {form.formState.errors.transactionDate ? (
                  <FieldError errors={[form.formState.errors.transactionDate]} className="text-xs" />
                ) : null}
              </FieldContent>
            </Field>
          </div>

          {selectedType === "transfer" ? (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field data-invalid={!!form.formState.errors.fromAccountId}>
                <FieldLabel className="text-xs">Akun asal</FieldLabel>
                <FieldContent>
                  <Select
                    value={selectedFromAccountId ?? ""}
                    onValueChange={(value) =>
                      form.setValue("fromAccountId", value ?? "", {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-xl text-sm">
                      <SelectValue placeholder="Pilih akun asal">
                        {accounts.find((a) => a.id === selectedFromAccountId)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id} className="text-xs">
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.fromAccountId ? (
                    <FieldError errors={[form.formState.errors.fromAccountId]} className="text-xs" />
                  ) : null}
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.toAccountId}>
                <FieldLabel className="text-xs">Akun tujuan</FieldLabel>
                <FieldContent>
                  <Select
                    value={selectedToAccountId ?? ""}
                    onValueChange={(value) =>
                      form.setValue("toAccountId", value ?? "", {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-xl text-sm">
                      <SelectValue placeholder="Pilih akun tujuan">
                        {accounts.find((a) => a.id === selectedToAccountId)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id} className="text-xs">
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.toAccountId ? (
                    <FieldError errors={[form.formState.errors.toAccountId]} className="text-xs" />
                  ) : null}
                </FieldContent>
              </Field>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              <Field data-invalid={!!form.formState.errors.accountId}>
                <FieldLabel className="text-xs">Akun</FieldLabel>
                <FieldContent>
                  <Select
                    value={selectedAccountId ?? ""}
                    onValueChange={(value) =>
                      form.setValue("accountId", value ?? "", {
                        shouldValidate: true,
                      })
                    }
                  >
                    <SelectTrigger className="h-10 w-full rounded-xl text-sm">
                      <SelectValue placeholder="Pilih akun">
                        {accounts.find((a) => a.id === selectedAccountId)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id} className="text-xs">
                          {account.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {form.formState.errors.accountId ? (
                    <FieldError errors={[form.formState.errors.accountId]} className="text-xs" />
                  ) : null}
                </FieldContent>
              </Field>

              <Field data-invalid={!!form.formState.errors.categoryId}>
                <FieldLabel className="text-xs">Kategori</FieldLabel>
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
                      <SelectValue
                        placeholder={
                          selectedType === "income"
                            ? "Pilih kategori income"
                            : "Pilih kategori expense"
                        }
                      >
                        {activeCategories.find((c) => c.id === selectedCategoryId)?.name}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      {activeCategories.map((category) => (
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
            </div>
          )}

          <Field data-invalid={!!form.formState.errors.description}>
            <FieldLabel htmlFor="transaction-description" className="text-xs">Deskripsi</FieldLabel>
            <FieldContent>
              <Input
                id="transaction-description"
                className="h-10 rounded-xl text-sm placeholder:text-xs"
                placeholder="Contoh: Gaji bulan April, makan siang, transfer tabungan"
                {...form.register("description")}
              />
              {form.formState.errors.description ? (
                <FieldError errors={[form.formState.errors.description]} className="text-xs" />
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
                  : "Buat transaksi"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
