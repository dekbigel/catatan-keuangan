import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <section className="space-y-6">
      {/* PageHeader skeleton */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl space-y-3">
          <Skeleton className="h-3 w-24 rounded-full" />
          <Skeleton className="h-7 w-64 rounded-xl sm:w-80" />
          <Skeleton className="h-4 w-72 rounded-lg sm:w-96" />
        </div>
      </div>

      {/* Hero skeleton */}
      <Card className="gap-0 overflow-hidden border-border/70 bg-card py-0 shadow-soft">
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-3">
              <Skeleton className="h-6 w-44 rounded-full" />
              <Skeleton className="h-10 w-56 rounded-xl" />
              <Skeleton className="h-3.5 w-40 rounded-lg" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Skeleton className="h-16 w-36 rounded-2xl" />
              <Skeleton className="h-16 w-36 rounded-2xl" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Summary cards skeleton */}
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card
            key={i}
            className="gap-0 border-border/70 bg-card py-0 shadow-soft"
          >
            <CardContent className="p-4 sm:p-5">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1 space-y-2.5">
                  <Skeleton className="h-3 w-24 rounded-full" />
                  <Skeleton className="h-6 w-20 rounded-lg" />
                  <Skeleton className="h-3 w-32 rounded-full" />
                </div>
                <Skeleton className="size-10 shrink-0 rounded-xl" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Content skeleton */}
      <Card className="gap-0 overflow-hidden border-border/70 bg-card py-0 shadow-soft">
        <div className="flex flex-col gap-2 border-b border-border/60 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-4 w-32 rounded-lg" />
            <Skeleton className="h-3 w-56 rounded-full" />
          </div>
          <Skeleton className="h-8 w-28 rounded-xl" />
        </div>
        <div className="space-y-3 px-5 py-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="size-10 shrink-0 rounded-xl" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3.5 w-2/5 rounded-lg" />
                <Skeleton className="h-3 w-3/5 rounded-full" />
              </div>
              <Skeleton className="h-4 w-20 rounded-lg" />
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
