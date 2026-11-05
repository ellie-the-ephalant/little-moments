import { Skeleton } from "@/components/ui/skeleton";

export const StudioSkeleton = () => (
  <div
    role="status"
    aria-live="polite"
    className="mx-auto grid min-h-[46rem] grid-cols-1 items-start gap-8 lg:grid-cols-12"
  >
    <span className="sr-only">Loading your studio</span>
    <Skeleton className="aspect-[4/5] w-full lg:col-span-7" />
    <div className="panel space-y-5 p-5 sm:p-7 lg:col-span-5">
      <Skeleton className="h-3 w-24" />
      <Skeleton className="h-10 w-3/4" />
      <Skeleton className="h-20 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-24 w-full" />
      <Skeleton className="h-12 w-full" />
    </div>
  </div>
);
