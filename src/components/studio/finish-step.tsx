"use client";

import { ArrowLeft } from "lucide-react";
import type { RefObject } from "react";

import { StripPreview } from "@/components/studio/strip-preview";
import { Button } from "@/components/ui/button";
import { useStudioStore } from "@/lib/studio-store";
import type { StripRenderSettings } from "@/lib/render-strip";

interface FinishStepProps {
  headingRef: RefObject<HTMLHeadingElement | null>;
  onBackToBooth: () => void;
}

export const FinishStep = ({ headingRef, onBackToBooth }: FinishStepProps) => {
  const photos = useStudioStore((state) => state.photos);
  const layoutId = useStudioStore((state) => state.layoutId);
  const themeId = useStudioStore((state) => state.themeId);
  const filterId = useStudioStore((state) => state.filterId);
  const title = useStudioStore((state) => state.title);
  const dateISO = useStudioStore((state) => state.dateISO);
  const settings: StripRenderSettings = {
    layoutId,
    themeId,
    filterId,
    title,
    dateISO,
  };

  return (
    <section className="animate-step-in grid grid-cols-1 items-start gap-8 pb-8 lg:grid-cols-12">
      <div className="min-w-0 lg:col-span-7">
        <StripPreview
          photos={photos}
          settings={settings}
          className="animate-strip-eject mx-auto max-w-[420px]"
        />
      </div>
      <div className="min-w-0 lg:col-span-5">
        <p className="type-micro text-brick">03 · Finish</p>
        <h1 ref={headingRef} tabIndex={-1} className="type-h2 mt-2">
          Keep the strip
        </h1>
        <div className="panel mt-5 p-5 sm:p-7">
          <p className="font-display text-2xl font-semibold">
            Developed on this device.
          </p>
          <p className="type-small mt-2 text-ink-soft">
            Nothing was uploaded. The finishing tools will be added next.
          </p>
          <Button variant="secondary" className="mt-6" onClick={onBackToBooth}>
            <ArrowLeft aria-hidden="true" />
            Back to booth
          </Button>
        </div>
      </div>
    </section>
  );
};
