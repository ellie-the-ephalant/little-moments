"use client";

import Image from "next/image";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Dialog } from "@/components/ui/dialog";
import { filters } from "@/lib/filters";
import { layouts } from "@/lib/layouts";
import { themes } from "@/lib/themes";
import { toast } from "@/lib/toast-store";
import type { StripRecord } from "@/lib/types";
import { filenameForStrip, formatDateLabel, toLocalISO } from "@/lib/utils";
import { useObjectUrl } from "@/hooks/use-object-url";

interface StripDetailProps {
  record: StripRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onDelete: (id: string) => Promise<boolean>;
}

const unsupportedShareMessage =
  "Sharing files isn't available in this browser. Download the JPEG instead.";

export const StripDetail = ({
  record,
  isOpen,
  onClose,
  onDelete,
}: StripDetailProps) => {
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const imageUrl = useObjectUrl(record?.image);

  if (!record) return null;

  const dateISO = toLocalISO(new Date(record.createdAt));
  const dateLabel = formatDateLabel(dateISO);
  const filename = filenameForStrip(record.title, dateISO, "jpg");

  const download = () => {
    if (!imageUrl) return;
    const anchor = document.createElement("a");
    anchor.href = imageUrl;
    anchor.download = filename;
    anchor.click();
  };

  const share = async () => {
    if (typeof navigator.share !== "function" || typeof File === "undefined") {
      toast(unsupportedShareMessage, "error");
      return;
    }
    try {
      const file = new File([record.image], filename, {
        type: record.mimeType,
      });
      if (navigator.canShare && !navigator.canShare({ files: [file] })) {
        toast(unsupportedShareMessage, "error");
        return;
      }
      await navigator.share({ files: [file], title: record.title });
    } catch (error) {
      if (
        typeof error === "object" &&
        error !== null &&
        "name" in error &&
        error.name === "AbortError"
      ) {
        return;
      }
      toast(unsupportedShareMessage, "error");
    }
  };

  return (
    <>
      <Dialog
        open={isOpen}
        onClose={onClose}
        title={record.title}
        description={`${layouts[record.layoutId].label} · ${dateLabel}`}
        className="w-[min(92vw,54rem)]"
        footer={
          <>
            <Button variant="danger" onClick={() => setIsDeleteOpen(true)}>
              Delete
            </Button>
            <Button variant="secondary" onClick={() => void share()}>
              Share
            </Button>
            <Button onClick={download} disabled={!imageUrl}>
              Download JPEG
            </Button>
          </>
        }
      >
        <div className="grid gap-5 sm:grid-cols-[minmax(0,1fr)_12rem]">
          <div
            className="grid min-h-48 place-items-center rounded-control border border-rule p-3"
            style={{ backgroundColor: themes[record.themeId].bg }}
          >
            {imageUrl ? (
              <Image
                src={imageUrl}
                alt={`Photo strip titled ${record.title}`}
                width={record.width}
                height={record.height}
                unoptimized
                className="mx-auto h-auto max-h-[55dvh] w-auto max-w-full object-contain"
              />
            ) : null}
          </div>
          <div className="grid content-start gap-4">
            <dl className="grid gap-4 text-sm">
              <div>
                <dt className="type-micro text-ink-soft">Date</dt>
                <dd className="mt-1 font-semibold text-ink">{dateLabel}</dd>
              </div>
              <div>
                <dt className="type-micro text-ink-soft">Layout</dt>
                <dd className="mt-1 font-semibold text-ink">
                  {layouts[record.layoutId].label}
                </dd>
              </div>
              <div>
                <dt className="type-micro text-ink-soft">Paper</dt>
                <dd className="mt-1 font-semibold text-ink">
                  {themes[record.themeId].label}
                </dd>
              </div>
              <div>
                <dt className="type-micro text-ink-soft">Tone</dt>
                <dd className="mt-1 font-semibold text-ink">
                  {filters[record.filterId].label}
                </dd>
              </div>
            </dl>
            <p className="text-xs leading-5 text-ink-soft">
              Stored only in this browser.
            </p>
          </div>
        </div>
      </Dialog>
      <ConfirmDialog
        open={isDeleteOpen}
        onOpenChange={setIsDeleteOpen}
        title="Delete this strip?"
        description="This strip will be removed from this browser."
        confirmLabel="Delete strip"
        onConfirm={() => {
          void onDelete(record.id).then((wasDeleted) => {
            if (wasDeleted) onClose();
          });
        }}
      />
    </>
  );
};
