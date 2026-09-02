"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, SquarePen } from "lucide-react";
import { z } from "zod";

import {
  createSavingsGoalAction,
  updateSavingsGoalAction,
} from "@/app/(dashboard)/savings-goals/actions";
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
import type { SavingsGoalSummary } from "@/lib/queries/savings-goals";
import {
  savingsGoalSchema,
  savingsGoalStatuses,
  type SavingsGoalInput,
} from "@/lib/validations/savings-goals";

type SavingsGoalFormDialogProps = {
  goal?: SavingsGoalSummary;
};

const statusLabels: Record<(typeof savingsGoalStatuses)[number], string> = {
  active: "Active",
  completed: "Completed",
  cancelled: "Cancelled",
};

export function SavingsGoalFormDialog({
  goal,
}: SavingsGoalFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  const [displayTargetAmount, setDisplayTargetAmount] = useState(() => {
    const val = goal?.targetAmount ?? 0;
    return val > 0 ? val.toLocaleString("id-ID").replace(/,/g, ".") : "";
  });
  const [displayCurrentAmount, setDisplayCurrentAmount] = useState(() => {
    const val = goal?.currentAmount ?? 0;
    return val > 0 ? val.toLocaleString("id-ID").replace(/,/g, ".") : "";
  });

  const defaultValues = useMemo<SavingsGoalInput>(
    () => ({
      name: goal?.name ?? "",
      targetAmount: goal?.targetAmount ?? 0,
      currentAmount: goal?.currentAmount ?? 0,
      targetDate: goal?.targetDate ?? "",
      status: goal?.status ?? "active",
    }),
    [goal],
  );

  const form = useForm<
    z.input<typeof savingsGoalSchema>,
    unknown,
    SavingsGoalInput
  >({
    resolver: zodResolver(savingsGoalSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      setMessage(null);
      form.reset(defaultValues);
      const target = goal?.targetAmount ?? 0;
      const current = goal?.currentAmount ?? 0;
      setDisplayTargetAmount(
        target > 0 ? target.toLocaleString("id-ID").replace(/,/g, ".") : "",
      );
      setDisplayCurrentAmount(
        current > 0 ? current.toLocaleString("id-ID").replace(/,/g, ".") : "",
      );
    }
  }, [open, goal, defaultValues, form]);

  const selectedStatus = useWatch({
    control: form.control,
    name: "status",
  });

  const isEdit = Boolean(goal);

  const onSubmit = (values: SavingsGoalInput) => {
    setPending(true);
    setMessage(null);

    startTransition(async () => {
      const result = isEdit
        ? await updateSavingsGoalAction(goal!.id, values)
        : await createSavingsGoalAction(values);

      if (result.status === "error") {
        setMessage({
          tone: "error",
          text: result.message ?? "Gagal menyimpan target tabungan.",
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
              <span className="hidden sm:inline">Tambah Target</span>
              <span className="sm:hidden">Target</span>
            </Button>
          )
        }
      />
      <DialogContent className="max-w-md rounded-2xl p-5">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-sm">
            {isEdit ? "Edit target tabungan" : "Tambah target tabungan"}
          </DialogTitle>
          <DialogDescription className="text-xs">
            Untuk MVP, progress disimpan langsung pada nominal terkumpul agar update target tetap cepat dan sederhana.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="goal-name" className="text-xs">Nama target</FieldLabel>
            <FieldContent>
              <Input
                id="goal-name"
                className="h-10 rounded-xl text-sm placeholder:text-xs"
                placeholder="Contoh: Dana darurat, Liburan Jepang"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <FieldError errors={[form.formState.errors.name]} className="text-xs" />
              ) : null}
            </FieldContent>
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.targetAmount}>
              <FieldLabel htmlFor="target-amount" className="text-xs">Target nominal</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input
                    id="target-amount"
                    type="text"
                    inputMode="numeric"
                    className="h-10 rounded-xl text-sm flex-1"
                    placeholder="0"
                    value={displayTargetAmount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      const formatted = raw
                        ? Number(raw).toLocaleString("id-ID").replace(/,/g, ".")
                        : "";
                      setDisplayTargetAmount(formatted);
                      const numeric = formatted.replace(/\./g, "");
                      form.setValue("targetAmount", numeric ? Number(numeric) : 0, {
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
                      const raw = displayTargetAmount.replace(/\./g, "");
                      const num = raw ? Number(raw) * 1000 : 0;
                      const formatted = num
                        ? num.toLocaleString("id-ID").replace(/,/g, ".")
                        : "";
                      setDisplayTargetAmount(formatted);
                      form.setValue("targetAmount", num, { shouldValidate: true });
                    }}
                  >
                    000
                  </Button>
                </div>
                {form.formState.errors.targetAmount ? (
                  <FieldError errors={[form.formState.errors.targetAmount]} className="text-xs" />
                ) : null}
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.currentAmount}>
              <FieldLabel htmlFor="current-amount" className="text-xs">Nominal terkumpul</FieldLabel>
              <FieldContent>
                <div className="flex gap-2">
                  <Input
                    id="current-amount"
                    type="text"
                    inputMode="numeric"
                    className="h-10 rounded-xl text-sm flex-1"
                    placeholder="0"
                    value={displayCurrentAmount}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/\D/g, "");
                      const formatted = raw
                        ? Number(raw).toLocaleString("id-ID").replace(/,/g, ".")
                        : "";
                      setDisplayCurrentAmount(formatted);
                      const numeric = formatted.replace(/\./g, "");
                      form.setValue("currentAmount", numeric ? Number(numeric) : 0, {
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
                      const raw = displayCurrentAmount.replace(/\./g, "");
                      const num = raw ? Number(raw) * 1000 : 0;
                      const formatted = num
                        ? num.toLocaleString("id-ID").replace(/,/g, ".")
                        : "";
                      setDisplayCurrentAmount(formatted);
                      form.setValue("currentAmount", num, { shouldValidate: true });
                    }}
                  >
                    000
                  </Button>
                </div>
                {form.formState.errors.currentAmount ? (
                  <FieldError errors={[form.formState.errors.currentAmount]} className="text-xs" />
                ) : null}
              </FieldContent>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field data-invalid={!!form.formState.errors.targetDate}>
              <FieldLabel htmlFor="target-date" className="text-xs">Target date</FieldLabel>
              <FieldContent>
                <Input
                  id="target-date"
                  type="date"
                  className="h-10 rounded-xl text-sm"
                  {...form.register("targetDate")}
                />
                {form.formState.errors.targetDate ? (
                  <FieldError errors={[form.formState.errors.targetDate]} className="text-xs" />
                ) : null}
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.status}>
              <FieldLabel className="text-xs">Status</FieldLabel>
              <FieldContent>
                <Select
                  value={selectedStatus ?? "active"}
                  onValueChange={(value) =>
                    form.setValue(
                      "status",
                      (value ?? "active") as SavingsGoalInput["status"],
                      { shouldValidate: true },
                    )
                  }
                >
                  <SelectTrigger className="h-10 w-full rounded-xl text-sm">
                    <SelectValue placeholder="Pilih status">
                      {statusLabels[selectedStatus]}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {savingsGoalStatuses.map((status) => (
                      <SelectItem key={status} value={status} className="text-xs">
                        {statusLabels[status]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.status ? (
                  <FieldError errors={[form.formState.errors.status]} className="text-xs" />
                ) : null}
              </FieldContent>
            </Field>
          </div>

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
                  : "Buat target"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
