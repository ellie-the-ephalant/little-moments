"use client";

import { Copy, Download, Printer, Share2 } from "lucide-react";
import { useCallback, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { PrintSheet } from "@/components/studio/print-sheet";
import { Button } from "@/components/ui/button";
import { useMounted } from "@/hooks/use-mounted";
import { usePreparedExport } from "@/hooks/use-prepared-export";
import { cn } from "@/lib/cn";
import { downloadBlob, saveGalleryStrip } from "@/lib/export-actions";
import {
  GalleryQuotaError,
  GalleryUnavailableError,
} from "@/lib/gallery-store";
import {
  getExportDimensions,
  isHighResolutionAvailable,
} from "@/lib/export-scale";
import { getStripGeometry } from "@/lib/strip-geometry";
import { toast } from "@/lib/toast-store";
import type { StripRenderSettings } from "@/lib/render-strip";
import type { Photo } from "@/lib/types";
import { effectiveTitle } from "@/lib/utils";

const HIGH_UNAVAILABLE_COPY =
  "High isn't available on this device. Standard is the largest size here.";
const EXPORT_FAILURE_COPY =
  "The strip couldn't be exported at this size. Try Standard.";
const GALLERY_UNAVAILABLE_COPY =
  "This browser won't let us keep a gallery. Private browsing often does this. You can still download your strip.";
const GALLERY_QUOTA_COPY =
  "This browser is out of storage for the gallery. Delete a few saved strips and try again.";
const SHARE_UNAVAILABLE_COPY =
  "Sharing files isn't available in this browser. Download the PNG instead.";
const COPY_UNAVAILABLE_COPY =
  "Copying isn't available here. Download the PNG instead.";

interface ExportPanelProps {
  photos: Photo[];
  settings: StripRenderSettings;
  stripRevision: string;
  savedStripRevision: string | null;
  onStripSaved: (revision: string) => void;
}

export const ExportPanel = ({
  photos,
  settings,
  stripRevision,
  savedStripRevision,
  onStripSaved,
}: ExportPanelProps) => {
  const [resolution, setResolution] = useState<1 | 2>(1);
  const [isSaving, setIsSaving] = useState(false);
  const [isPrinting, setIsPrinting] = useState(false);
  const [printBlob, setPrintBlob] = useState<Blob | null>(null);
  const savingRef = useRef(false);
  const isMounted = useMounted();
  const geometry = getStripGeometry(settings.layoutId);
  const standardDimensions = getExportDimensions(geometry, 1);
  const requestedHighDimensions = getExportDimensions(geometry, 2);
  const highResolutionAvailable = isHighResolutionAvailable(geometry);
  const requestedResolution = highResolutionAvailable ? resolution : 1;
  const exportState = usePreparedExport({
    photos,
    settings,
    scale: requestedResolution,
  });
  const isSaved = savedStripRevision === stripRevision;
  const highFellBack =
    highResolutionAvailable &&
    resolution === 2 &&
    exportState.status === "ready" &&
    exportState.prepared.scale < 1.25;
  const highAvailable = highResolutionAvailable && !highFellBack;
  const highDimensions = highFellBack
    ? exportState.prepared
    : requestedHighDimensions;
  const displayedResolution = highAvailable ? resolution : 1;
  const prepared = exportState.status === "ready" ? exportState.prepared : null;
  const actionsDisabled = !prepared || isSaving || isPrinting;
  const isClipboardSupported =
    isMounted &&
    typeof window !== "undefined" &&
    typeof window.ClipboardItem !== "undefined" &&
    window.ClipboardItem.supports?.("image/png") !== false;
  const portalRoot =
    isMounted && typeof document !== "undefined" ? document.body : null;

  const download = () => {
    if (!prepared) return;
    downloadBlob(prepared.blob, prepared.filename);
  };

  const share = () => {
    if (!prepared) return;
    const shareData: ShareData = {
      files: [prepared.file],
      title: effectiveTitle(settings.title),
    };
    try {
      if (
        typeof navigator.share !== "function" ||
        (typeof navigator.canShare === "function" &&
          !navigator.canShare(shareData))
      ) {
        toast(SHARE_UNAVAILABLE_COPY, "error");
        return;
      }
      void navigator.share(shareData).catch((error: unknown) => {
        if (
          typeof error === "object" &&
          error !== null &&
          "name" in error &&
          error.name === "AbortError"
        ) {
          return;
        }
        toast(SHARE_UNAVAILABLE_COPY, "error");
      });
    } catch {
      toast(SHARE_UNAVAILABLE_COPY, "error");
    }
  };

  const copy = () => {
    if (!prepared) return;
    try {
      const item = new window.ClipboardItem({ "image/png": prepared.blob });
      void navigator.clipboard.write([item]).then(
        () => toast("Image copied to the clipboard."),
        () => toast(COPY_UNAVAILABLE_COPY, "error"),
      );
    } catch {
      toast(COPY_UNAVAILABLE_COPY, "error");
    }
  };

  const save = async () => {
    if (!prepared || savingRef.current) return;
    savingRef.current = true;
    setIsSaving(true);
    try {
      await saveGalleryStrip(photos, settings);
      onStripSaved(stripRevision);
      toast("Saved to your gallery.");
    } catch (error) {
      if (error instanceof GalleryQuotaError) {
        toast(GALLERY_QUOTA_COPY, "error");
      } else if (error instanceof GalleryUnavailableError) {
        toast(GALLERY_UNAVAILABLE_COPY, "error");
      } else {
        toast(EXPORT_FAILURE_COPY, "error");
      }
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  };

  const print = () => {
    if (!prepared || isPrinting) return;
    setPrintBlob(prepared.blob);
    setIsPrinting(true);
  };

  const handlePrintComplete = useCallback(() => {
    setPrintBlob(null);
    setIsPrinting(false);
  }, []);
  const handlePrintError = useCallback(() => {
    toast("The strip couldn't be prepared for printing.", "error");
    setPrintBlob(null);
    setIsPrinting(false);
  }, []);

  const saveButton = (
    <Button
      variant="secondary"
      className="w-full"
      disabled={actionsDisabled || isSaved}
      onClick={() => void save()}
    >
      {isSaving ? "Saving…" : isSaved ? "Saved" : "Save to gallery"}
    </Button>
  );

  const downloadButton = (
    <Button className="w-full" disabled={actionsDisabled} onClick={download}>
      <Download aria-hidden="true" />
      Download PNG
    </Button>
  );

  return (
    <>
      <fieldset className="min-w-0">
        <legend className="mb-3 text-sm font-semibold text-ink">
          Resolution
        </legend>
        <div className="grid gap-2 sm:grid-cols-2">
          <label className="flex min-h-11 cursor-pointer items-center gap-3 rounded-control border border-rule bg-paper px-3 py-2.5 text-sm has-[:checked]:border-brick has-[:checked]:bg-cream has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brick">
            <input
              type="radio"
              name="finish-resolution"
              value="1"
              checked={displayedResolution === 1}
              onChange={() => setResolution(1)}
              className="accent-brick"
            />
            <span className="font-semibold">
              Standard · {standardDimensions.width} ×{" "}
              {standardDimensions.height} px
            </span>
          </label>
          <label
            className={cn(
              "flex min-h-11 items-center gap-3 rounded-control border border-rule bg-paper px-3 py-2.5 text-sm has-[:checked]:border-brick has-[:checked]:bg-cream has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brick",
              highAvailable
                ? "cursor-pointer"
                : "cursor-not-allowed opacity-60",
            )}
          >
            <input
              type="radio"
              name="finish-resolution"
              value="2"
              checked={displayedResolution === 2}
              disabled={!highAvailable}
              aria-describedby={
                highAvailable ? undefined : "high-resolution-note"
              }
              onChange={() => setResolution(2)}
              className="accent-brick"
            />
            <span className="font-semibold">
              High · {highDimensions.width} × {highDimensions.height} px
            </span>
          </label>
        </div>
        {!highAvailable ? (
          <p
            id="high-resolution-note"
            className="type-small mt-2 text-ink-soft"
            role="status"
          >
            {HIGH_UNAVAILABLE_COPY}
          </p>
        ) : null}
      </fieldset>

      {exportState.status === "preparing" ? (
        <p className="type-small mt-4 text-ink-soft" role="status">
          Preparing your PNG…
        </p>
      ) : null}
      {exportState.status === "ready" ? (
        <p className="type-small mt-4 text-ink-soft" role="status">
          PNG ready · {exportState.prepared.width} ×{" "}
          {exportState.prepared.height} px
        </p>
      ) : null}
      {exportState.status === "error" ? (
        <div className="mt-4 flex flex-wrap items-center gap-3" role="alert">
          <p className="type-small text-brick">{EXPORT_FAILURE_COPY}</p>
          {resolution === 2 ? (
            <Button variant="secondary" onClick={() => setResolution(1)}>
              Try Standard
            </Button>
          ) : null}
        </div>
      ) : null}

      <div className="mt-5 grid grid-cols-2 gap-x-5 gap-y-3">
        <div className="hidden lg:block">{downloadButton}</div>
        <Button variant="secondary" disabled={actionsDisabled} onClick={share}>
          <Share2 aria-hidden="true" />
          Share
        </Button>
        <Button variant="secondary" disabled={actionsDisabled} onClick={print}>
          <Printer aria-hidden="true" />
          Print / Save PDF
        </Button>
        {isClipboardSupported ? (
          <Button variant="secondary" disabled={actionsDisabled} onClick={copy}>
            <Copy aria-hidden="true" />
            Copy image
          </Button>
        ) : null}
        <div className="hidden lg:block">{saveButton}</div>
      </div>

      {portalRoot
        ? createPortal(
            <div className="fixed inset-x-0 bottom-0 z-40 flex gap-3 border-t border-rule bg-paper px-4 pt-3 pb-[calc(env(safe-area-inset-bottom)+0.75rem)] shadow-[0_-12px_24px_-18px_rgb(33_26_22_/_0.4)] lg:hidden">
              <Button
                className="flex-1"
                disabled={actionsDisabled}
                onClick={download}
              >
                <Download aria-hidden="true" />
                Download PNG
              </Button>
              <Button
                variant="secondary"
                className="flex-1"
                disabled={actionsDisabled || isSaved}
                onClick={() => void save()}
              >
                {isSaving ? "Saving…" : isSaved ? "Saved" : "Save to gallery"}
              </Button>
            </div>,
            portalRoot,
          )
        : null}

      {printBlob ? (
        <PrintSheet
          blob={printBlob}
          onComplete={handlePrintComplete}
          onError={handlePrintError}
        />
      ) : null}
    </>
  );
};
