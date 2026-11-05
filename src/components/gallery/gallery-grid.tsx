"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useEffect, useState } from "react";

import { EmptyStripTeaser } from "@/components/gallery/empty-strip-teaser";
import { StripCard } from "@/components/gallery/strip-card";
import { StripDetail } from "@/components/gallery/strip-detail";
import { Button, buttonStyles } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/lib/toast-store";
import {
  clearStrips,
  deleteStrip,
  GalleryQuotaError,
  isGalleryAvailable,
  listStrips,
} from "@/lib/gallery-store";
import type { StripRecord } from "@/lib/types";

type GalleryStatus = "loading" | "ready" | "unavailable" | "quota";
type GalleryNotice = "unavailable" | "quota";

const noticeCopy: Record<GalleryNotice, string> = {
  unavailable:
    "This browser won't let us keep a gallery. Private browsing often does this. You can still download your strip.",
  quota:
    "This browser is out of storage for the gallery. Delete a few saved strips and try again.",
};

export const GalleryGrid = () => {
  const [status, setStatus] = useState<GalleryStatus>("loading");
  const [records, setRecords] = useState<StripRecord[]>([]);
  const [notice, setNotice] = useState<GalleryNotice | null>(null);
  const [selected, setSelected] = useState<StripRecord | null>(null);
  const [isClearOpen, setIsClearOpen] = useState(false);
  const [isClearing, setIsClearing] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      if (!(await isGalleryAvailable())) {
        if (isMounted) {
          setStatus("unavailable");
          setNotice("unavailable");
        }
        return;
      }

      try {
        const result = await listStrips();
        if (!isMounted) return;
        setRecords(result.records);
        if (result.skipped)
          toast("Some saved strips couldn't be read.", "error");
        setStatus("ready");
      } catch (error) {
        if (!isMounted) return;
        const nextStatus =
          error instanceof GalleryQuotaError ? "quota" : "unavailable";
        setStatus(nextStatus);
        setNotice(nextStatus);
      }
    };

    void load();
    return () => {
      isMounted = false;
    };
  }, []);

  const removeStrip = async (id: string): Promise<boolean> => {
    try {
      await deleteStrip(id);
      setRecords((current) => current.filter((record) => record.id !== id));
      setNotice(null);
      return true;
    } catch (error) {
      setNotice(error instanceof GalleryQuotaError ? "quota" : "unavailable");
      return false;
    }
  };

  const removeAll = async () => {
    setIsClearing(true);
    try {
      await clearStrips();
      setRecords([]);
      setNotice(null);
    } catch (error) {
      setNotice(error instanceof GalleryQuotaError ? "quota" : "unavailable");
    } finally {
      setIsClearing(false);
    }
  };

  return (
    <main id="main" className="site-container py-10 sm:py-14">
      <header className="mb-8 flex flex-col gap-5 border-b border-rule pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="type-micro text-brick">From this device</p>
          <h1 className="type-h2 mt-2">The ones you kept.</h1>
          <p className="type-small mt-2 text-ink-soft">
            Stored only in this browser.
          </p>
        </div>
        <Button
          variant="danger"
          disabled={status !== "ready" || records.length === 0 || isClearing}
          onClick={() => setIsClearOpen(true)}
          className="self-start sm:self-auto"
        >
          Clear all
        </Button>
      </header>

      {notice ? (
        <p
          role="alert"
          aria-live="assertive"
          className="mb-6 rounded-control border border-brick/50 bg-paper px-4 py-3 text-sm leading-6 text-brick"
        >
          {noticeCopy[notice]}
        </p>
      ) : null}

      {status === "loading" ? (
        <div
          role="status"
          aria-live="polite"
          aria-busy="true"
          className="grid min-h-[27rem] grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          <span className="sr-only">Loading saved strips</span>
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={`gallery-skeleton-${index + 1}`}
              className="panel space-y-3 p-2"
            >
              <Skeleton className="aspect-[4/5] w-full" />
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-3 w-1/2" />
            </div>
          ))}
        </div>
      ) : status === "unavailable" || status === "quota" ? (
        <div className="panel max-w-2xl p-6 sm:p-8">
          <p className="type-small text-ink-soft">
            You can still make and download a strip on this device.
          </p>
          <Link
            href="/studio"
            className={buttonStyles({ className: "mt-5 gap-2" })}
          >
            Start a strip
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>
      ) : records.length ? (
        <ul
          aria-label="Saved photo strips"
          className="grid grid-cols-1 items-start gap-5 sm:grid-cols-2 lg:grid-cols-3"
        >
          {records.map((record) => (
            <li key={record.id} className="min-w-0">
              <StripCard record={record} onOpen={() => setSelected(record)} />
            </li>
          ))}
        </ul>
      ) : (
        <EmptyStripTeaser />
      )}

      <StripDetail
        record={selected}
        isOpen={selected !== null}
        onClose={() => setSelected(null)}
        onDelete={removeStrip}
      />
      <ConfirmDialog
        open={isClearOpen}
        onOpenChange={setIsClearOpen}
        title="Clear the gallery?"
        description="All saved strips will be removed from this browser."
        cancelLabel="Keep them"
        confirmLabel="Clear all"
        onConfirm={() => void removeAll()}
      />
    </main>
  );
};
