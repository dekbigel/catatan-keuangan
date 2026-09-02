import { FolderPlus } from "lucide-react";

import { CategoryColorDot } from "@/components/dashboard/category-color-dot";
import { CategoryDeleteButton } from "@/components/dashboard/category-delete-button";
import { CategoryTypeBadge } from "@/components/dashboard/category-type-badge";
import { DataTableCard } from "@/components/dashboard/data-table-card";
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
      <section className="space-y-5">
        {header}
        <ErrorState description={result.error ?? "Gagal memuat data kategori."} />
      </section>
    );
  }

  const { incomeCategories, expenseCategories } = result.data;
  const totalCategories = incomeCategories.length + expenseCategories.length;

  return (
    <section className="space-y-5 pb-24">
      {header}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Total kategori"
          value={`${totalCategories}`}
          helper="Jumlah semua kategori yang sudah Anda buat"
          icon={FolderPlus}
          variant="default"
        />
        <SummaryCard
          label="Kategori pemasukan"
          value={`${incomeCategories.length}`}
          helper="Digunakan untuk transaksi income"
          icon={FolderPlus}
          variant="income"
        />
        <SummaryCard
          label="Kategori pengeluaran"
          value={`${expenseCategories.length}`}
          helper="Digunakan untuk transaksi expense dan budget"
          icon={FolderPlus}
          variant="expense"
        />
      </div>

      <DataTableCard
        title="Kategori Pemasukan"
        description="Kelompok kategori untuk income per user"
      >
        {incomeCategories.length === 0 ? (
          <EmptyState
            title="Belum ada kategori income"
            description="Tambahkan kategori pemasukan seperti Gaji, Bonus, atau Freelance."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/60">
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Nama
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Tipe
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Visual
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Transaksi
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground text-right">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {incomeCategories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="group border-border/40 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-2">
                      <div>
                        <p className="font-semibold text-[11px] text-foreground">
                          {category.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {category.icon || "Tanpa icon"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <CategoryTypeBadge type={category.type} />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="inline-flex items-center gap-2">
                        <CategoryColorDot color={category.color} />
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {category.color}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-[11px] text-muted-foreground">
                      {category.usageCount} transaksi
                    </TableCell>
                    <TableCell className="py-2 text-right">
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
        )}
      </DataTableCard>

      <DataTableCard
        title="Kategori Pengeluaran"
        description="Kelompok kategori untuk expense per user"
      >
        {expenseCategories.length === 0 ? (
          <EmptyState
            title="Belum ada kategori expense"
            description="Tambahkan kategori pengeluaran seperti Makan, Transport, atau Tagihan."
          />
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent border-border/60">
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Nama
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Tipe
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Visual
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground">
                    Transaksi
                  </TableHead>
                  <TableHead className="h-8 py-2 text-[11px] font-semibold text-muted-foreground text-right">
                    Aksi
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {expenseCategories.map((category) => (
                  <TableRow
                    key={category.id}
                    className="group border-border/40 transition-colors hover:bg-muted/30"
                  >
                    <TableCell className="py-2">
                      <div>
                        <p className="font-semibold text-[11px] text-foreground">
                          {category.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {category.icon || "Tanpa icon"}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell className="py-2">
                      <CategoryTypeBadge type={category.type} />
                    </TableCell>
                    <TableCell className="py-2">
                      <div className="inline-flex items-center gap-2">
                        <CategoryColorDot color={category.color} />
                        <span className="text-[11px] text-muted-foreground font-mono">
                          {category.color}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="py-2 text-[11px] text-muted-foreground">
                      {category.usageCount} transaksi
                    </TableCell>
                    <TableCell className="py-2 text-right">
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
        )}
      </DataTableCard>

      <div className="fixed bottom-6 right-6 z-50">
        <CategoryFormDialog />
      </div>
    </section>
  );
}
