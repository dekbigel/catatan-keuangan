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
            <Button variant="ghost" size="sm" className="text-xs">
              <SquarePen className="size-3.5" />
              Edit
            </Button>
          ) : (
            <Button className="h-12 gap-2 rounded-full px-5 text-sm font-bold shadow-lift">
              <Plus className="size-5" />
              <span className="hidden sm:inline">Tambah Kategori</span>
              <span className="sm:hidden">Kategori</span>
            </Button>
          )
        }
      />
      <DialogContent className="max-w-md rounded-2xl p-5">
        <DialogHeader className="gap-1.5">
          <DialogTitle className="text-sm">{isEdit ? "Edit kategori" : "Tambah kategori"}</DialogTitle>
          <DialogDescription className="text-xs">
            Pisahkan kategori income dan expense agar transaksi serta budget lebih rapi.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-3" noValidate>
          <Field data-invalid={!!form.formState.errors.name}>
            <FieldLabel htmlFor="category-name" className="text-xs">Nama kategori</FieldLabel>
            <FieldContent>
              <Input
                id="category-name"
                placeholder="Contoh: Gaji, Makan, Transport"
                className="h-10 rounded-xl text-sm placeholder:text-xs"
                {...form.register("name")}
              />
              {form.formState.errors.name ? (
                <FieldError errors={[form.formState.errors.name]} className="text-xs" />
              ) : null}
            </FieldContent>
          </Field>

          <Field data-invalid={!!form.formState.errors.type}>
            <FieldLabel className="text-xs">Tipe kategori</FieldLabel>
            <FieldContent>
              <Select
                value={selectedType}
                onValueChange={(value) =>
                  form.setValue("type", value as CategoryInput["type"], {
                    shouldValidate: true,
                  })
                }
              >
                <SelectTrigger className="h-10 w-full rounded-xl text-sm">
                  <SelectValue placeholder="Pilih tipe kategori">
                    {selectedType ? typeLabels[selectedType as keyof typeof typeLabels] : "Pilih tipe kategori"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {categoryTypes.map((type) => (
                    <SelectItem key={type} value={type} className="text-xs">
                      {typeLabels[type]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.type ? (
                <FieldError errors={[form.formState.errors.type]} className="text-xs" />
              ) : null}
            </FieldContent>
          </Field>

          <div className="grid gap-3 sm:grid-cols-[120px_1fr]">
            <Field data-invalid={!!form.formState.errors.color}>
              <FieldLabel htmlFor="category-color" className="text-xs">Warna</FieldLabel>
              <FieldContent>
                <Input
                  id="category-color"
                  type="color"
                  className="h-8 rounded-lg p-1"
                  {...form.register("color")}
                />
                {form.formState.errors.color ? (
                  <FieldError errors={[form.formState.errors.color]} className="text-xs" />
                ) : null}
              </FieldContent>
            </Field>

            <Field data-invalid={!!form.formState.errors.icon}>
              <FieldLabel htmlFor="category-icon" className="text-xs">Icon (opsional)</FieldLabel>
              <FieldContent>
                <Input
                  id="category-icon"
                  placeholder="Contoh: wallet, food, car"
                  className="h-10 rounded-xl text-sm placeholder:text-xs"
                  {...form.register("icon")}
                />
                {form.formState.errors.icon ? (
                  <FieldError errors={[form.formState.errors.icon]} className="text-xs" />
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
                  : "Buat kategori"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
