"use client";

import { useState } from "react";
import Link from "next/link";
import { Calendar, Filter, RotateCcw, Search, SlidersHorizontal, X } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type {
  TransactionOptionAccount,
  TransactionOptionCategory,
} from "@/lib/queries/transactions";

type TransactionFiltersProps = {
  filters: {
    dateFrom: string;
    dateTo: string;
    type: string;
    categoryId: string;
    accountId: string;
    q: string;
  };
  accounts: TransactionOptionAccount[];
  incomeCategories: TransactionOptionCategory[];
  expenseCategories: TransactionOptionCategory[];
};

const typeLabels: Record<string, string> = {
  "": "Semua tipe",
  income: "Income",
  expense: "Expense",
  transfer: "Transfer",
};

export function TransactionFilters({
  filters,
  accounts,
  incomeCategories,
  expenseCategories,
}: TransactionFiltersProps) {
  const [open, setOpen] = useState(false);
  const categories = [...incomeCategories, ...expenseCategories];

  const [type, setType] = useState(filters.type);
  const [accountId, setAccountId] = useState(filters.accountId);
  const [categoryId, setCategoryId] = useState(filters.categoryId);

  const activeCount = [
    filters.q,
    filters.dateFrom,
    filters.dateTo,
    filters.type,
    filters.categoryId,
    filters.accountId,
  ].filter(Boolean).length;

  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const todayStr = `${year}-${month}-${day}`;

  const isTodayActive = filters.dateFrom === todayStr && filters.dateTo === todayStr;

  const getTodayHref = () => {
    const params = new URLSearchParams();
    if (filters.q) params.set("q", filters.q);
    if (filters.type) params.set("type", filters.type);
    if (filters.categoryId) params.set("categoryId", filters.categoryId);
    if (filters.accountId) params.set("accountId", filters.accountId);

    if (!isTodayActive) {
      params.set("dateFrom", todayStr);
      params.set("dateTo", todayStr);
    }

    const str = params.toString();
    return str ? `/transactions?${str}` : "/transactions";
  };

  return (
    <div className="space-y-2 pb-3">
      {/* Toggle bar */}
      <div className="flex items-center gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-xl text-xs"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? (
            <>
              <X className="size-3.5" />
              Sembunyikan Filter
            </>
          ) : (
            <>
              <SlidersHorizontal className="size-3.5" />
              Tampilkan Filter
              {activeCount > 0 && (
                <span className="ml-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[11px] font-medium text-primary-foreground">
                  {activeCount}
                </span>
              )}
            </>
          )}
        </Button>

        <Link
          href={getTodayHref()}
          className={buttonVariants({
            variant: isTodayActive ? "default" : "outline",
            size: "sm",
            className: "h-9 gap-1.5 rounded-xl text-xs",
          })}
        >
          <Calendar className="size-3.5" />
          Hari Ini
        </Link>

        {activeCount > 0 && !open && (
          <div className="flex flex-wrap items-center gap-1">
            {filters.q && (
              <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                <Search className="size-3" />
                {filters.q}
              </span>
            )}
            {filters.type && (
              <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground capitalize">
                {typeLabels[filters.type]}
              </span>
            )}
            {filters.dateFrom && (
              <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                {filters.dateFrom}
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                {filters.dateTo}
              </span>
            )}
            {filters.accountId && (
              <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                {accounts.find((a) => a.id === filters.accountId)?.name ?? "Akun"}
              </span>
            )}
            {filters.categoryId && (
              <span className="inline-flex items-center rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[11px] text-muted-foreground">
                {categories.find((c) => c.id === filters.categoryId)?.name ?? "Kategori"}
              </span>
            )}
            <Link
              href="/transactions"
              className="inline-flex items-center gap-1 rounded-md border border-border px-1.5 py-0.5 text-[11px] text-muted-foreground hover:bg-muted transition-colors"
            >
              <RotateCcw className="size-3" />
              Reset
            </Link>
          </div>
        )}
      </div>

      {/* Filter panel */}
      {open && (
        <form
          action="/transactions"
          className="rounded-xl border border-border/60 bg-card p-3"
        >
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
            {/* Kata kunci */}
            <div className="sm:col-span-2 xl:col-span-2">
              <label className="mb-1 block text-xs font-medium text-foreground">
                Kata kunci
              </label>
              <div className="relative">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-3 -translate-y-1/2 text-muted-foreground" />
                <Input
                  name="q"
                  defaultValue={filters.q}
                  placeholder="Cari deskripsi..."
                  className="h-8 rounded-lg bg-background pl-8 text-xs placeholder:text-xs"
                />
              </div>
            </div>

            {/* Tanggal awal */}
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Tanggal awal
              </label>
              <Input
                type="date"
                name="dateFrom"
                defaultValue={filters.dateFrom}
                className="h-8 rounded-lg bg-background text-xs"
              />
            </div>

            {/* Tanggal akhir */}
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Tanggal akhir
              </label>
              <Input
                type="date"
                name="dateTo"
                defaultValue={filters.dateTo}
                className="h-8 rounded-lg bg-background text-xs"
              />
            </div>

            {/* Tipe */}
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Tipe
              </label>
              <Select value={type} onValueChange={(v) => setType(v ?? "")}>
                <SelectTrigger className="h-8 w-full rounded-lg bg-background text-xs">
                  <SelectValue placeholder="Semua tipe">
                    {typeLabels[type] || "Semua tipe"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-xs">Semua tipe</SelectItem>
                  <SelectItem value="income" className="text-xs">Income</SelectItem>
                  <SelectItem value="expense" className="text-xs">Expense</SelectItem>
                  <SelectItem value="transfer" className="text-xs">Transfer</SelectItem>
                </SelectContent>
              </Select>
              <input type="hidden" name="type" value={type} />
            </div>

            {/* Akun */}
            <div>
              <label className="mb-1 block text-xs font-medium text-foreground">
                Akun
              </label>
              <Select value={accountId} onValueChange={(v) => setAccountId(v ?? "")}>
                <SelectTrigger className="h-8 w-full rounded-lg bg-background text-xs">
                  <SelectValue placeholder="Semua akun">
                    {accountId
                      ? accounts.find((a) => a.id === accountId)?.name || "Semua akun"
                      : "Semua akun"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-xs">Semua akun</SelectItem>
                  {accounts.map((account) => (
                    <SelectItem key={account.id} value={account.id} className="text-xs">
                      {account.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="accountId" value={accountId} />
            </div>

            {/* Kategori */}
            <div className="sm:col-span-2 xl:col-span-2">
              <label className="mb-1 block text-xs font-medium text-foreground">
                Kategori
              </label>
              <Select value={categoryId} onValueChange={(v) => setCategoryId(v ?? "")}>
                <SelectTrigger className="h-8 w-full rounded-lg bg-background text-xs">
                  <SelectValue placeholder="Semua kategori">
                    {categoryId
                      ? categories.find((c) => c.id === categoryId)?.name || "Semua kategori"
                      : "Semua kategori"}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="" className="text-xs">Semua kategori</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id} className="text-xs">
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <input type="hidden" name="categoryId" value={categoryId} />
            </div>

            {/* Tombol aksi */}
            <div className="flex items-end gap-2 sm:col-span-2 xl:col-span-2 xl:justify-end">
              <Button type="submit" size="sm" className="h-9 rounded-xl text-xs">
                <Filter className="size-3 mr-1" />
                Terapkan
              </Button>
              <Link
                href="/transactions"
                className={buttonVariants({
                  variant: "outline",
                  size: "sm",
                  className: "h-9 rounded-xl text-xs gap-1",
                })}
              >
                <RotateCcw className="size-3" />
                Reset
              </Link>
            </div>
          </div>
        </form>
      )}
    </div>
  );
}
