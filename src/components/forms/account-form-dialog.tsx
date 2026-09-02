"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, SquarePen } from "lucide-react";
import { z } from "zod";

import {
  createAccountAction,
  updateAccountAction,
} from "@/app/(dashboard)/accounts/actions";
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
  accountSchema,
  accountTypes,
  type AccountInput,
} from "@/lib/validations/accounts";
import type { AccountSummary } from "@/lib/queries/accounts";

const typeLabels: Record<(typeof accountTypes)[number], string> = {
  cash: "Cash",
  bank: "Bank",
  ewallet: "E-Wallet",
  savings: "Savings",
  crypto: "Crypto",
};

type AccountFormDialogProps = {
  account?: AccountSummary;
};

export function AccountFormDialog({ account }: AccountFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);
  const [displayBalance, setDisplayBalance] = useState("");
  const [isCustomType, setIsCustomType] = useState(false);
  const [customTypeName, setCustomTypeName] = useState("");

  const defaultValues = useMemo<AccountInput>(
    () => ({
      name: account?.name ?? "",
      type: account?.type ?? "cash",
      initialBalance: account?.initialBalance ?? 0,
    }),
    [account],
  );

  const form = useForm<z.input<typeof accountSchema>, unknown, AccountInput>({
    resolver: zodResolver(accountSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      setMessage(null);
      const val = account?.initialBalance ?? 0;
      setDisplayBalance(val > 0 ? formatNumber(val) : "");
      form.reset(defaultValues);

      const accType = account?.type ?? "cash";
      if (accType && !(accountTypes as readonly string[]).includes(accType)) {
        setIsCustomType(true);
        setCustomTypeName(accType);
      } else {
        setIsCustomType(false);
        setCustomTypeName("");
      }
    }
  }, [open, account, defaultValues, form]);

  function formatNumber(num: number): string {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  }

  function handleBalanceChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value.replace(/\D/g, "");
    const num = raw ? parseInt(raw, 10) : 0;
    setDisplayBalance(raw ? formatNumber(num) : "");
    form.setValue("initialBalance", num, { shouldValidate: true });
  }

  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });

  const isEdit = Boolean(account);

  const onSubmit = (values: AccountInput) => {
    setPending(true);
    setMessage(null);

    startTransition(async () => {
      const result = isEdit
        ? await updateAccountAction(account!.id, values)
        : await createAccountAction(values);

      if (result.status === "error") {
        setMessage({
          tone: "error",
          text: result.message ?? "Gagal menyimpan akun.",
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
              <span className="hidden sm:inline">Tambah Akun</span>
              <span className="sm:hidden">Akun</span>
            </Button>
          )
        }
      />
      <DialogContent className="max-w-md rounded-2xl p-5">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-sm">{isEdit ? "Edit akun" : "Tambah akun"}</DialogTitle>
          <DialogDescription className="text-xs">
            Isi nama akun, pilih tipe, lalu tentukan saldo awalnya.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="account-name" className="text-xs">Nama akun</FieldLabel>
            <FieldContent>
              <Input
                id="account-name"
                placeholder="Contoh: BCA Utama"
                className="h-10 rounded-xl text-sm placeholder:text-xs"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <FieldError errors={[form.formState.errors.name]} className="text-xs" />
              ) : null}
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.type}>
            <FieldLabel className="text-xs">Tipe akun</FieldLabel>
            <FieldContent className="space-y-2">
              <Select
                value={isCustomType ? "custom" : selectedType}
                onValueChange={(value) => {
                  if (value === "custom") {
                    setIsCustomType(true);
                    form.setValue("type", customTypeName.trim(), {
                      shouldValidate: Boolean(customTypeName.trim()),
                    });
                    form.clearErrors("type");
                  } else {
                    setIsCustomType(false);
                    form.setValue("type", value ?? "cash", {
                      shouldValidate: Boolean(value),
                    });
                  }
                }}
              >
                <SelectTrigger className="h-10 w-full rounded-xl text-sm">
                  <SelectValue placeholder="Pilih tipe akun">
                    {isCustomType
                      ? "Tipe Akun Kostum"
                      : selectedType && selectedType in typeLabels
                        ? typeLabels[selectedType as keyof typeof typeLabels]
                        : selectedType || "Pilih tipe akun"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {accountTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-xs">
                      {typeLabels[type]}
                    </SelectItem>
                  ))}
                  <SelectItem value="custom" className="text-xs font-semibold text-sky-600 dark:text-sky-400">
                    + Tambah
                  </SelectItem>
                </SelectContent>
              </Select>

              {isCustomType && (
                <Input
                  placeholder="Masukkan nama"
                  className="h-10 rounded-xl text-sm placeholder:text-xs"
                  value={customTypeName}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCustomTypeName(val);
                    form.setValue("type", val, {
                      shouldValidate: Boolean(val.trim()),
                    });
                    if (!val.trim()) {
                      form.clearErrors("type");
                    }
                  }}
                />
              )}

              {form.formState.errors.type ? (
                <FieldError errors={[form.formState.errors.type]} className="text-xs" />
              ) : null}
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.initialBalance}>
            <FieldLabel htmlFor="initial-balance" className="text-xs">Saldo awal</FieldLabel>
            <FieldContent>
              <div className="flex gap-2">
                <Input
                  id="initial-balance"
                  type="text"
                  inputMode="numeric"
                  placeholder="Contoh: 1.000.000"
                  className="h-10 rounded-xl text-sm placeholder:text-xs flex-1"
                  value={displayBalance}
                  onChange={handleBalanceChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="h-10 rounded-xl text-sm px-2.5 shrink-0"
                  onClick={() => {
                    const raw = displayBalance.replace(/\./g, "");
                    const num = raw ? parseInt(raw, 10) * 1000 : 0;
                    setDisplayBalance(num > 0 ? formatNumber(num) : "");
                    form.setValue("initialBalance", num, { shouldValidate: true });
                  }}
                >
                  000
                </Button>
              </div>
              {form.formState.errors.initialBalance ? (
                <FieldError errors={[form.formState.errors.initialBalance]} className="text-xs" />
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
              {pending ? "Menyimpan..." : isEdit ? "Simpan perubahan" : "Buat akun"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

