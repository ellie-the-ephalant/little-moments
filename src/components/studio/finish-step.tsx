"use client";

import { ArrowDown, ArrowLeft, RotateCcw } from "lucide-react";
import { useState, type RefObject } from "react";

import { ExportPanel } from "@/components/studio/export-panel";
import { FilterPicker } from "@/components/studio/filter-picker";
import { SessionFields } from "@/components/studio/session-fields";
import { StripPreview } from "@/components/studio/strip-preview";
import { ThemePicker } from "@/components/studio/theme-picker";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { useStudioStore } from "@/lib/studio-store";
import type { StripRenderSettings } from "@/lib/render-strip";

interface FinishStepProps {
  headingRef: RefObject<HTMLHeadingElement | null>;
  stripRevision: string;
  savedStripRevision: string | null;
  onBackToBooth: () => void;
  onStartOver: () => void;
  onStripSaved: (revision: string) => void;
}

export const FinishStep = ({
  headingRef,
  stripRevision,
  savedStripRevision,
  onBackToBooth,
  onStartOver,
  onStripSaved,
}: FinishStepProps) => {
  const [isStartOverOpen, setIsStartOverOpen] = useState(false);
  const photos = useStudioStore((state) => state.photos);
  const layoutId = useStudioStore((state) => state.layoutId);
  const themeId = useStudioStore((state) => state.themeId);
  const filterId = useStudioStore((state) => state.filterId);
  const title = useStudioStore((state) => state.title);
  const dateISO = useStudioStore((state) => state.dateISO);
  const setTheme = useStudioStore((state) => state.setTheme);
  const setFilter = useStudioStore((state) => state.setFilter);
  const settings: StripRenderSettings = {
    layoutId,
    themeId,
    filterId,
    title,
    dateISO,
  };

  return (
    <section className="animate-step-in grid grid-cols-1 items-start gap-7 pb-32 lg:grid-cols-12 lg:gap-8 lg:pb-10">
      <div className="min-w-0 lg:sticky lg:top-6 lg:col-span-7">
        <div
          tabIndex={0}
          aria-label="Scrollable photo strip preview"
          className="max-h-[60svh] overflow-y-auto overscroll-contain rounded-panel bg-paper-deep p-2 lg:max-h-[calc(100svh-6rem)]"
        >
          <StripPreview
            photos={photos}
            settings={settings}
            className="animate-strip-eject mx-auto max-w-[420px]"
          />
        </div>
        <p className="mt-2 flex items-center justify-center gap-2 text-center text-xs text-ink-soft">
          <ArrowDown aria-hidden="true" className="size-3.5" />
          Scroll to see the full strip
        </p>
      </div>

      <div className="min-w-0 lg:col-span-5">
        <p className="type-micro text-brick">03 · Finish</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="type-h2 mt-2 focus:outline-none"
        >
          Keep the strip
        </h1>

        <div className="panel mt-5 space-y-5 p-4 sm:p-6">
          <ThemePicker value={themeId} onChange={setTheme} />
          <div className="perforation" aria-hidden="true" />
          <FilterPicker value={filterId} onChange={setFilter} />
          <div className="perforation" aria-hidden="true" />
          <section aria-labelledby="finish-details-heading">
            <h2 id="finish-details-heading" className="type-h3 mb-4">
              Details
            </h2>
            <SessionFields />
          </section>
          <div className="perforation" aria-hidden="true" />
          <ExportPanel
            photos={photos}
            settings={settings}
            stripRevision={stripRevision}
            savedStripRevision={savedStripRevision}
            onStripSaved={onStripSaved}
          />

          <p className="border-t border-dashed border-rule pt-4 text-sm leading-6 text-ink-soft">
            <span className="block font-semibold text-ink">
              Developed on this device.
            </span>
            Nothing was uploaded.
          </p>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <Button variant="secondary" onClick={onBackToBooth}>
              <ArrowLeft aria-hidden="true" />
              Back to booth
            </Button>
            <Button variant="danger" onClick={() => setIsStartOverOpen(true)}>
              <RotateCcw aria-hidden="true" />
              Start over
            </Button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={isStartOverOpen}
        onOpenChange={setIsStartOverOpen}
        title="Start over?"
        description="This clears every photo in the strip. Your saved gallery stays as it is."
        cancelLabel="Keep editing"
        confirmLabel="Start over"
        onConfirm={onStartOver}
      />
    </section>
  );
};
