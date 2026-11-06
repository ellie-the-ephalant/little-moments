"use client";

import { ArrowRight, CameraOff, RefreshCw } from "lucide-react";
import type { RefObject } from "react";
import { useEffect } from "react";

import { CameraDeviceSelect } from "@/components/studio/camera-device-select";
import { PermissionHelp } from "@/components/studio/permission-help";
import { PhotoUploadButton } from "@/components/studio/photo-upload-button";
import { Button } from "@/components/ui/button";
import { getStripGeometry } from "@/lib/strip-geometry";
import { useStudioStore } from "@/lib/studio-store";
import { usePhotoUploads } from "@/hooks/use-photo-uploads";
import type { UseAutoSessionResult } from "@/hooks/use-auto-session";
import type { UseCameraResult } from "@/hooks/use-camera";

interface BoothStepProps {
  camera: UseCameraResult;
  session: UseAutoSessionResult;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

export const BoothStep = ({ camera, session, headingRef }: BoothStepProps) => {
  const layoutId = useStudioStore((state) => state.layoutId);
  const photos = useStudioStore((state) => state.photos);
  const setStep = useStudioStore((state) => state.setStep);
  const { inputRef, isProcessing, handleChange, openPicker } =
    usePhotoUploads(camera);
  const slotCount = getStripGeometry(layoutId).slotCount;
  const isComplete = photos.length >= slotCount;
  const error = session.error ?? camera.error;
  const canSwitch = session.error
    ? session.error.code === "camera" && camera.devices.length > 1
    : camera.error?.code === "overconstrained" && camera.devices.length > 1;
  const { cancel, isRunning } = session;

  useEffect(() => {
    if (!isRunning) return;
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      event.preventDefault();
      cancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [cancel, isRunning]);

  const handlePrimary = () => {
    if (session.isRunning) session.cancel();
    else if (session.state === "paused") void session.resume();
    else if (session.error) void session.tryAgain();
    else void session.start();
  };

  const primaryLabel =
    session.error || camera.error
      ? "Try again"
      : session.isRunning
        ? "Cancel countdown"
        : session.state === "paused"
          ? "Continue session"
          : "Start session";
  const cannotRetryCamera =
    !session.error &&
    (camera.error?.code === "missing" || camera.error?.code === "insecure");

  const finishStrip = () => {
    if (!isComplete || session.isRunning) return;
    camera.stop();
    setStep("finish");
  };

  const primaryButton = !cannotRetryCamera && (
    <Button
      onClick={handlePrimary}
      disabled={camera.status === "requesting" && !session.isRunning}
      className="min-w-0"
    >
      {primaryLabel}
      <ArrowRight aria-hidden="true" />
    </Button>
  );
  const uploadButton = (className?: string) => (
    <PhotoUploadButton
      isDisabled={isProcessing}
      onClick={openPicker}
      className={className}
    />
  );

  const finishButton = (
    <Button
      variant="secondary"
      onClick={finishStrip}
      disabled={!isComplete || session.isRunning}
      className="min-w-0"
    >
      Finish strip
    </Button>
  );

  return (
    <section className="animate-step-in min-w-0 lg:col-span-4">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        aria-label="Choose photos"
        tabIndex={-1}
        className="sr-only"
        onChange={handleChange}
      />
      <div className="mb-5">
        <p className="type-micro text-brick">02 · Booth</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="type-h2 mt-2 focus:outline-none"
        >
          Strike a pose
        </h1>
        <p className="type-small mt-2 max-w-[40ch] text-ink-soft">
          A countdown, a few shots, and a retake for the ones you don&apos;t
          love.
        </p>
      </div>

      <div className="panel space-y-4 p-4 sm:p-6">
        {error ? (
          <PermissionHelp
            error={error}
            isRetryAvailable={false}
            isSwitchAvailable={canSwitch}
            onSwitch={() => void camera.switchCamera()}
          >
            {uploadButton()}
          </PermissionHelp>
        ) : null}

        <div className="grid gap-3">
          <div className="hidden gap-3 lg:grid">{primaryButton}</div>
          {uploadButton("w-full")}
          <Button
            variant="secondary"
            disabled={!camera.stream || session.isRunning}
            onClick={camera.stop}
          >
            <CameraOff aria-hidden="true" />
            Turn off camera
          </Button>
          {camera.devices.length > 1 ? (
            <Button
              variant="secondary"
              disabled={camera.status !== "ready" || session.isRunning}
              onClick={() => void camera.switchCamera()}
            >
              <RefreshCw aria-hidden="true" />
              Switch camera
            </Button>
          ) : null}
          <CameraDeviceSelect camera={camera} isDisabled={session.isRunning} />
          <div className="hidden border-t border-rule pt-4 lg:block">
            {finishButton}
          </div>
        </div>
        <p className="text-xs leading-5 text-ink-soft">
          Your photos stay here until you choose to keep the strip.
        </p>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(33_26_22_/_0.08)] lg:hidden">
        <div className="site-container grid grid-cols-2 gap-3 px-0">
          {primaryButton}
          {finishButton}
        </div>
      </div>
    </section>
  );
};
