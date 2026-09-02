"use client";

import Link from "next/link";
import { Calendar, Filter, RotateCcw } from "lucide-react";

import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type BudgetPeriodFilterProps = {
  month: number;
  year: number;
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

export function BudgetPeriodFilter({
  month,
  year,
}: BudgetPeriodFilterProps) {
  const monthLabel = monthOptions.find((m) => m.value === month)?.label ?? String(month);

  return (
    <div className="space-y-2 pb-3">
      {/* <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1 rounded-md border border-border bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <Calendar className="size-3" />
          {monthLabel} {year}
        </span>
      </div> */}

      <form
        action="/budgets"
        className="rounded-xl border border-border/60 bg-card p-3"
      >
        <div className="grid gap-2.5 sm:grid-cols-[1fr_160px_auto]">
          <div>
            <label className="mb-1 block text-[11px] font-medium text-foreground">
              Bulan
            </label>
            <Select name="month" defaultValue={String(month)}>
              <SelectTrigger className="h-8 w-full rounded-lg bg-background text-[11px]">
                <SelectValue placeholder="Pilih bulan">
                  {monthLabel}
                </SelectValue>
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((item) => (
                  <SelectItem key={item.value} value={String(item.value)} className="text-[11px]">
                    {item.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="mb-1 block text-[11px] font-medium text-foreground">
              Tahun
            </label>
            <Input
              type="number"
              name="year"
              min="2000"
              max="2100"
              defaultValue={year}
              className="h-8 rounded-lg bg-background text-[11px]"
            />
          </div>

          <div className="flex items-end gap-2">
            <Button type="submit" size="sm" className="h-7 rounded-lg text-[11px]">
              <Filter className="size-3 mr-1" />
              Terapkan
            </Button>
            <Link
              href="/budgets"
              className={buttonVariants({
                variant: "outline",
                size: "sm",
                className: "h-7 rounded-lg text-[11px] gap-1",
              })}
            >
              <RotateCcw className="size-3" />
              Reset
            </Link>
          </div>
        </div>
      </form>
    </div>
  );
}
