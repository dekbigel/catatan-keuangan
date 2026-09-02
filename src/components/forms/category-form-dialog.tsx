"use client";

import { startTransition, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Plus, SquarePen } from "lucide-react";
import { z } from "zod";

import {
  createCategoryAction,
  updateCategoryAction,
} from "@/app/(dashboard)/categories/actions";
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
  categorySchema,
  categoryTypes,
  type CategoryInput,
} from "@/lib/validations/categories";
import type { CategorySummary } from "@/lib/queries/categories";

const typeLabels: Record<(typeof categoryTypes)[number], string> = {
  income: "Income",
  expense: "Expense",
};

type CategoryFormDialogProps = {
  category?: CategorySummary;
  defaultType?: CategoryInput["type"];
};

export function CategoryFormDialog({
  category,
  defaultType = "expense",
}: CategoryFormDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{
    tone: "success" | "error";
    text: string;
  } | null>(null);

  const defaultValues = useMemo<CategoryInput>(
    () => ({
      name: category?.name ?? "",
      type: category?.type ?? defaultType,
      color: category?.color ?? (defaultType === "income" ? "#10B981" : "#F43F5E"),
      icon: category?.icon ?? "",
    }),
    [category, defaultType],
  );

  const form = useForm<z.input<typeof categorySchema>, unknown, CategoryInput>({
    resolver: zodResolver(categorySchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      setMessage(null);
      form.reset(defaultValues);
    }
  }, [open, defaultValues, form]);

  const selectedType = useWatch({
    control: form.control,
    name: "type",
  });

  const isEdit = Boolean(category);

  const onSubmit = (values: CategoryInput) => {
    setPending(true);
    setMessage(null);

    startTransition(async () => {
      const result = isEdit
        ? await updateCategoryAction(category!.id, values)
        : await createCategoryAction(values);

      if (result.status === "error") {
        setMessage({
          tone: "error",
          text: result.message ?? "Gagal menyimpan kategori.",
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
              Tambah kategori
            </Button>
          )
        }
      />
      <DialogContent className="max-w-md rounded-xl p-4">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-sm">{isEdit ? "Edit kategori" : "Tambah kategori"}</DialogTitle>
          <DialogDescription className="text-[11px]">
            Pisahkan kategori income dan expense agar transaksi serta budget lebih rapi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="category-name" className="text-[11px]">Nama kategori</FieldLabel>
            <FieldContent>
              <Input
                id="category-name"
                placeholder="Contoh: Gaji, Makan, Transport"
                className="h-8 rounded-lg text-[11px] placeholder:text-[11px]"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <FieldError errors={[form.formState.errors.name]} className="text-[11px]" />
              ) : null}
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.type}>
            <FieldLabel className="text-[11px]">Tipe kategori</FieldLabel>
            <FieldContent>
              <Select
                value={selectedType}
                onValueChange={(value) =>
                  form.setValue("type", value as CategoryInput["type"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="h-8 w-full rounded-lg text-[11px]">
                  <SelectValue placeholder="Pilih tipe kategori">
                    {selectedType ? typeLabels[selectedType as keyof typeof typeLabels] : "Pilih tipe kategori"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categoryTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-[11px]">
                      {typeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.type ? (
                <FieldError errors={[form.formState.errors.type]} className="text-[11px]" />
              ) : null}
            </FieldContent>
          </Field>

          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <Field data-invalid={!!form.formState.errors.color}>
              <FieldLabel htmlFor="category-color" className="text-[11px]">Warna</FieldLabel>
              <FieldContent>
                <Input
                  id="category-color"
                  type="color"
                  className="h-8 rounded-lg p-1"
                  {...form.register("color")}
                />
                {form.formState.errors.color ? (
                  <FieldError errors={[form.formState.errors.color]} className="text-[11px]" />
                ) : null}
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.icon}>
              <FieldLabel htmlFor="category-icon" className="text-[11px]">Icon (opsional)</FieldLabel>
              <FieldContent>
                <Input
                  id="category-icon"
                  placeholder="Contoh: wallet, food, car"
                  className="h-8 rounded-lg text-[11px] placeholder:text-[11px]"
                  {...form.register("icon")}
                />
                {form.formState.errors.icon ? (
                  <FieldError errors={[form.formState.errors.icon]} className="text-[11px]" />
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
                  : "Buat kategori"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
