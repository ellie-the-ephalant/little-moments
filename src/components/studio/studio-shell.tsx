"use client";

import { ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { CameraStage } from "@/components/studio/camera-stage";
import { FinishStep } from "@/components/studio/finish-step";
import { ShotTray } from "@/components/studio/shot-tray";
import { SetupStep } from "@/components/studio/setup-step";
import { StepRail } from "@/components/studio/step-rail";
import { StudioSkeleton } from "@/components/studio/studio-skeleton";
import { BoothStep } from "@/components/studio/booth-step";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { Wordmark } from "@/components/site/wordmark";
import { useAutoSession } from "@/hooks/use-auto-session";
import { useBeforeUnload } from "@/hooks/use-before-unload";
import { useCamera } from "@/hooks/use-camera";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { getStripRevision } from "@/lib/export-actions";
import type { StripRenderSettings } from "@/lib/render-strip";
import { getStripGeometry } from "@/lib/strip-geometry";
import { useStudioStore } from "@/lib/studio-store";
import { todayISO } from "@/lib/utils";
import type { StudioStep } from "@/lib/types";

export const StudioShell = () => {
  const router = useRouter();
  const step = useStudioStore((state) => state.step);
  const layoutId = useStudioStore((state) => state.layoutId);
  const themeId = useStudioStore((state) => state.themeId);
  const title = useStudioStore((state) => state.title);
  const dateISO = useStudioStore((state) => state.dateISO);
  const photos = useStudioStore((state) => state.photos);
  const isHydrated = useStudioStore((state) => state.hydrated);
  const mirror = useStudioStore((state) => state.mirror);
  const filterId = useStudioStore((state) => state.filterId);
  const flash = useStudioStore((state) => state.flash);
  const setStep = useStudioStore((state) => state.setStep);
  const camera = useCamera();
  const reducedMotion = useReducedMotion();
  const session = useAutoSession(camera, reducedMotion);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const previousStepRef = useRef<StudioStep>(step);
  const [isLeaveOpen, setIsLeaveOpen] = useState(false);
  const [savedStripRevision, setSavedStripRevision] = useState<string | null>(
    null,
  );
  const stripSettings: StripRenderSettings = {
    layoutId,
    themeId,
    filterId,
    title,
    dateISO,
  };
  const stripRevision = getStripRevision(photos, stripSettings);
  const slotCount = getStripGeometry(layoutId).slotCount;
  const isFinishAvailable = photos.length >= slotCount;

  useBeforeUnload();

  useEffect(() => {
    let isMounted = true;
    void Promise.resolve(useStudioStore.persist.rehydrate())
      .catch(() => undefined)
      .finally(() => {
        if (!isMounted) return;
        const store = useStudioStore.getState();
        if (!store.dateISO) store.setDate(todayISO());
        store.setHydrated(true);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (previousStepRef.current !== step) headingRef.current?.focus();
    previousStepRef.current = step;
  }, [step]);

  const leaveStudio = () => {
    camera.stop();
    router.push("/");
  };

  const startOver = () => {
    session.cancelFinishTransition();
    camera.stop();
    useStudioStore.getState().resetSession();
  };

  const requestLeave = () => {
    if (photos.length) setIsLeaveOpen(true);
    else leaveStudio();
  };

  const handleStepChange = (nextStep: StudioStep) => {
    if (nextStep === "finish" && !isFinishAvailable) return;
    if (nextStep !== "finish") session.cancelFinishTransition();
    if (nextStep === "finish") camera.stop();
    setStep(nextStep);
  };

  return (
    <div className="min-h-dvh overflow-x-clip">
      <header className="border-b border-rule/80 bg-paper">
        <div className="site-container flex min-h-16 items-center justify-between gap-4 sm:min-h-[72px]">
          <Wordmark
            onClick={(event) => {
              event.preventDefault();
              requestLeave();
            }}
          />
          <Button variant="secondary" onClick={requestLeave}>
            Leave studio
            <ArrowRight aria-hidden="true" className="rotate-180" />
          </Button>
        </div>
      </header>
      <StepRail
        currentStep={step}
        isFinishAvailable={isFinishAvailable}
        onStepChange={handleStepChange}
      />
      <main id="main" className="site-container pb-6">
        {!isHydrated ? (
          <StudioSkeleton />
        ) : step === "finish" ? (
          <FinishStep
            headingRef={headingRef}
            stripRevision={stripRevision}
            savedStripRevision={savedStripRevision}
            onBackToBooth={() => handleStepChange("booth")}
            onStartOver={startOver}
            onStripSaved={setSavedStripRevision}
          />
        ) : (
          <div className="grid grid-cols-1 items-start gap-7 pb-32 lg:grid-cols-12 lg:gap-8 lg:pb-10">
            <div
              className={
                step === "setup"
                  ? "min-w-0 lg:col-span-7"
                  : "min-w-0 lg:col-span-8"
              }
            >
              <CameraStage
                camera={camera}
                step={step}
                mirror={mirror}
                filterId={filterId}
                countdown={session.countdown}
                isCapturing={session.state === "capturing"}
                flash={flash}
                onTurnOnCamera={() => void camera.start()}
              />
              {step === "booth" ? (
                <ShotTray
                  photos={photos}
                  slotCount={slotCount}
                  activeIndex={session.activeIndex}
                  onRetake={(index) => {
                    useStudioStore.getState().setStep("booth");
                    void session.retake(index);
                  }}
                  isDisabled={session.isRunning}
                />
              ) : null}
            </div>
            {step === "setup" ? (
              <SetupStep
                camera={camera}
                session={session}
                headingRef={headingRef}
              />
            ) : (
              <BoothStep
                camera={camera}
                session={session}
                headingRef={headingRef}
              />
            )}
          </div>
        )}
      </main>
      <ConfirmDialog
        open={isLeaveOpen}
        onOpenChange={setIsLeaveOpen}
        title="Leave the studio?"
        description="Your photos haven't been saved. Leave the studio?"
        cancelLabel="Stay here"
        confirmLabel="Leave studio"
        onConfirm={leaveStudio}
      />
    </div>
  );
};
