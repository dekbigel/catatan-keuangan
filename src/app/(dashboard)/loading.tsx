import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <section className="space-y-5 pb-24">
      {/* PageHeader skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between pb-5">
        <div className="max-w-2xl space-y-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-6 w-64 sm:w-80 rounded-lg" />
          <Skeleton className="h-4 w-72 sm:w-96 rounded-lg" />
        </div>
      </div>

      {/* Summary cards skeleton */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="border-border/60 bg-card">
            <CardContent className="p-3.5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-2">
                  <Skeleton className="h-3 w-24 rounded-full" />
                  <Skeleton className="h-5 w-20 rounded-lg" />
                  <Skeleton className="h-3 w-32 rounded-full" />
                </div>
                <Skeleton className="size-8 shrink-0 rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data table card skeleton */}
      <Card className="overflow-hidden border-border/60 bg-card">
        <div className="flex flex-col gap-2 pb-3 sm:flex-row sm:items-center sm:justify-between px-4 pt-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-3 w-56 rounded-full" />
          </div>
          <Skeleton className="h-7 w-28 rounded-full" />
        </div>
        <div className="p-0 px-4 pb-4 space-y-3">
          <Skeleton className="h-8 w-full rounded-lg" />
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      </Card>
    </section>
  );
}
