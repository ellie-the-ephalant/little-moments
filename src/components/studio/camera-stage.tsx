"use client";

import { Camera } from "lucide-react";

import { CountdownOverlay } from "@/components/studio/countdown-overlay";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { filters } from "@/lib/filters";
import type { FilterId, StudioStep } from "@/lib/types";
import type { UseCameraResult } from "@/hooks/use-camera";

interface CameraStageProps {
  camera: UseCameraResult;
  step: Exclude<StudioStep, "finish">;
  mirror: boolean;
  filterId: FilterId;
  countdown: number | "Smile" | null;
  isCapturing: boolean;
  flash: boolean;
  onTurnOnCamera: () => void;
}

export const CameraStage = ({
  camera,
  step,
  mirror,
  filterId,
  countdown,
  isCapturing,
  flash,
  onTurnOnCamera,
}: CameraStageProps) => {
  const { facing, status, stream, videoRef } = camera;
  const isLive = status === "ready" && stream !== null;
  const isMirrored = mirror && facing === "user";

  return (
    <figure
      className={cn(
        "mx-auto w-full max-w-[560px]",
        step === "setup" && "lg:sticky lg:top-6",
      )}
    >
      <div className="relative mx-auto aspect-[4/5] w-full overflow-hidden rounded-panel border border-rule bg-paper-deep shadow-panel max-lg:w-[min(100%,calc(52svh*0.8))]">
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          aria-label="Live camera preview"
          aria-hidden={!isLive}
          className={cn(
            "absolute inset-0 size-full object-cover transition-opacity duration-200",
            isLive ? "opacity-100" : "opacity-0",
            isMirrored && "scale-x-[-1]",
          )}
          style={{ filter: filters[filterId].css }}
        />
        {!isLive ? (
          <div className="absolute inset-0 grid place-items-center overflow-hidden bg-paper-deep px-6 py-10 text-center">
            <span
              aria-hidden="true"
              className="absolute inset-5 border border-rule/80"
            />
            <span
              aria-hidden="true"
              className="absolute top-5 left-5 size-7 border-t-2 border-l-2 border-brick"
            />
            <span
              aria-hidden="true"
              className="absolute top-5 right-5 size-7 border-t-2 border-r-2 border-brick"
            />
            <span
              aria-hidden="true"
              className="absolute right-5 bottom-5 size-7 border-r-2 border-b-2 border-brick"
            />
            <span
              aria-hidden="true"
              className="absolute bottom-5 left-5 size-7 border-b-2 border-l-2 border-brick"
            />
            <div className="relative z-[1] flex max-w-[17rem] flex-col items-center">
              <span className="mb-5 grid size-16 place-items-center rounded-full border border-rule bg-cream text-brick shadow-panel">
                <Camera aria-hidden="true" className="size-7" />
              </span>
              <p className="type-micro text-brick">A moment, in frame</p>
              <p className="mt-2 font-display text-3xl leading-tight font-semibold">
                Camera is off
              </p>
              <p className="type-small mt-2 text-ink-soft">
                Your photos stay on this device.
              </p>
              {step === "setup" && status !== "requesting" ? (
                <Button className="mt-6" onClick={onTurnOnCamera}>
                  Turn on camera
                </Button>
              ) : null}
            </div>
          </div>
        ) : null}
        {status === "requesting" ? (
          <div
            role="status"
            aria-live="polite"
            className="absolute inset-x-0 bottom-0 z-[2] bg-ink/80 px-4 py-3 text-center text-sm font-semibold text-cream"
          >
            Connecting to your camera
          </div>
        ) : null}
        {isLive && countdown !== null ? (
          <CountdownOverlay value={countdown} />
        ) : null}
        {isLive && flash && isCapturing ? (
          <span
            aria-hidden="true"
            className="animate-booth-flash absolute inset-0 z-20"
          />
        ) : null}
        <span
          aria-hidden="true"
          className="absolute top-4 right-4 z-[3] rounded-full border border-cream/70 bg-ink/60 px-3 py-1 text-[0.625rem] font-bold tracking-[0.16em] text-cream uppercase"
        >
          {isLive ? "Live" : "Local only"}
        </span>
      </div>
      <figcaption className="mt-3 flex items-center justify-between gap-3 text-xs font-semibold tracking-[0.08em] text-ink-soft uppercase">
        <span>100% on this device</span>
        <span>Your photos never leave it.</span>
      </figcaption>
    </figure>
  );
};
