"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

import { EmptyStripTeaser } from "@/components/gallery/empty-strip-teaser";
import { StripCard } from "@/components/gallery/strip-card";
import { Skeleton } from "@/components/ui/skeleton";
import { listStrips } from "@/lib/gallery-store";
import type { StripRecord } from "@/lib/types";

export const RecentMoments = () => {
  const [records, setRecords] = useState<StripRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    void listStrips()
      .then(({ records: saved }) => {
        if (isMounted) setRecords(saved.slice(0, 6));
      })
      .catch(() => {
        if (isMounted) setRecords([]);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <section className="site-container py-16 sm:py-20">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="type-micro text-brick">05 · From this device</p>
          <h2 className="type-h2 mt-2">From this device</h2>
        </div>
        {!isLoading && records.length ? (
          <Link
            href="/gallery"
            className="text-sm font-semibold text-ink underline decoration-rule underline-offset-4 transition-colors hover:text-brick hover:decoration-brick"
          >
            Open the gallery
          </Link>
        ) : null}
      </div>

      <div className="min-h-[28rem]">
        {isLoading ? (
          <div
            aria-busy="true"
            role="status"
            className="flex gap-4 overflow-hidden"
          >
            <span className="sr-only">Loading recent strips</span>
            {Array.from({ length: 4 }, (_, index) => (
              <Skeleton
                key={`recent-skeleton-${index + 1}`}
                className="aspect-[4/5] h-64 w-44 shrink-0"
              />
            ))}
          </div>
        ) : records.length ? (
          <ul className="flex snap-x snap-mandatory gap-4 overflow-x-auto py-2">
            {records.map((record) => (
              <li key={record.id} className="w-40 shrink-0 snap-start sm:w-48">
                <StripCard record={record} href="/gallery" />
              </li>
            ))}
          </ul>
        ) : (
          <EmptyStripTeaser isCompact />
        )}
      </div>
    </section>
  );
};
