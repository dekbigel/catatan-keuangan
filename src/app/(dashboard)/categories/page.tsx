import { ArrowDownCircle, ArrowUpCircle, FolderPlus } from "lucide-react";

import { CategoryColorDot } from "@/components/dashboard/category-color-dot";
import { CategoryDeleteButton } from "@/components/dashboard/category-delete-button";
import { CategoryTypeBadge } from "@/components/dashboard/category-type-badge";
import { DataTableCard } from "@/components/dashboard/data-table-card";
import { PageFab } from "@/components/dashboard/page-fab";
import { SummaryCard } from "@/components/dashboard/summary-card";
import { CategoryFormDialog } from "@/components/forms/category-form-dialog";
import { PageHeader } from "@/components/layout/page-header";
import { EmptyState } from "@/components/ui/empty-state";
import { ErrorState } from "@/components/ui/error-state";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getCategoriesGrouped } from "@/lib/queries/categories";

type Category = Awaited<
  ReturnType<typeof getCategoriesGrouped>
>["incomeCategories"][number];

function CategoryMobileList({ categories }: { categories: Category[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2 md:hidden">
      {categories.map((category) => (
        <li
          key={category.id}
          className="flex items-center gap-3 rounded-2xl border border-border/70 bg-card p-4 shadow-soft"
        >
          <div
            className="flex size-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: category.color }}
          >
            {category.name.charAt(0).toUpperCase()}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-bold text-foreground">
              {category.name}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {category.usageCount} transaksi • {category.icon || "Tanpa icon"}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <CategoryFormDialog category={category} />
            <CategoryDeleteButton
              categoryId={category.id}
              disabled={category.usageCount > 0}
            />
          </div>
        </li>
      ))}
    </ul>
  );
}

function CategoryTable({ categories }: { categories: Category[] }) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <Table>
        <TableHeader>
          <TableRow className="border-border/60 hover:bg-transparent">
            <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
              Nama
            </TableHead>
            <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
              Tipe
            </TableHead>
            <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
              Visual
            </TableHead>
            <TableHead className="h-9 py-2 text-xs font-semibold text-muted-foreground">
              Transaksi
            </TableHead>
            <TableHead className="h-9 py-2 text-right text-xs font-semibold text-muted-foreground">
              Aksi
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {categories.map((category) => (
            <TableRow
              key={category.id}
              className="group border-border/40 transition-colors hover:bg-muted/30"
            >
              <TableCell className="py-2.5">
                <div>
                  <p className="text-xs font-bold text-foreground">
                    {category.name}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {category.icon || "Tanpa icon"}
                  </p>
                </div>
              </TableCell>
              <TableCell className="py-2.5">
                <CategoryTypeBadge type={category.type} />
              </TableCell>
              <TableCell className="py-2.5">
                <div className="inline-flex items-center gap-2">
                  <CategoryColorDot color={category.color} />
                  <span className="font-mono text-[11px] text-muted-foreground">
                    {category.color}
                  </span>
                </div>
              </TableCell>
              <TableCell className="py-2.5 text-xs text-muted-foreground">
                {category.usageCount} transaksi
              </TableCell>
              <TableCell className="py-2.5 text-right">
                <div className="flex justify-end gap-1">
                  <CategoryFormDialog category={category} />
                  <CategoryDeleteButton
                    categoryId={category.id}
                    disabled={category.usageCount > 0}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default async function CategoriesPage() {
  const result = await getCategoriesGrouped()
    .then((data) => ({ data, error: null as string | null }))
    .catch((error) => ({
      data: null,
      error:
        error instanceof Error
          ? error.message
          : "Gagal memuat data kategori dari Supabase.",
    }));

  const header = (
    <PageHeader
      eyebrow="Klasifikasi Transaksi"
      title="Kategori"
      description="Pisahkan kategori pemasukan dan pengeluaran agar transaksi, budget, dan dashboard tetap konsisten."
    />
  );

  if (result.error || !result.data) {
    return (
      <section className="space-y-6">
        {header}
        <ErrorState description={result.error ?? "Gagal memuat data kategori."} />
      </section>
    );
  }

  const { incomeCategories, expenseCategories } = result.data;
  const totalCategories = incomeCategories.length + expenseCategories.length;

  return (
    <section className="space-y-6">
      {header}

      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-3">
        <SummaryCard
          label="Total kategori"
          value={`${totalCategories}`}
          helper="Semua kategori yang Anda buat"
          icon={FolderPlus}
          variant="default"
        />
        <SummaryCard
          label="Kategori pemasukan"
          value={`${incomeCategories.length}`}
          helper="Digunakan untuk income"
          icon={ArrowUpCircle}
          variant="income"
        />
        <SummaryCard
          label="Kategori pengeluaran"
          value={`${expenseCategories.length}`}
          helper="Digunakan untuk expense & budget"
          icon={ArrowDownCircle}
          variant="expense"
        />
      </div>

      <DataTableCard
        title="Kategori Pemasukan"
        description="Kelompok kategori untuk income per user."
      >
        {incomeCategories.length === 0 ? (
          <EmptyState
            title="Belum ada kategori income"
            description="Tambahkan kategori pemasukan seperti Gaji, Bonus, atau Freelance."
          />
        ) : (
          <>
            <CategoryMobileList categories={incomeCategories} />
            <CategoryTable categories={incomeCategories} />
          </>
        )}
      </DataTableCard>

      <DataTableCard
        title="Kategori Pengeluaran"
        description="Kelompok kategori untuk expense per user."
      >
        {expenseCategories.length === 0 ? (
          <EmptyState
            title="Belum ada kategori expense"
            description="Tambahkan kategori pengeluaran seperti Makan, Transport, atau Tagihan."
          />
        ) : (
          <>
            <CategoryMobileList categories={expenseCategories} />
            <CategoryTable categories={expenseCategories} />
          </>
        )}
      </DataTableCard>

      <PageFab>
        <CategoryFormDialog />
      </PageFab>
    </section>
  );
}
