"use client";

import { ArrowRight } from "lucide-react";
import type { RefObject } from "react";

import { CameraDeviceSelect } from "@/components/studio/camera-device-select";
import { FilterPicker } from "@/components/studio/filter-picker";
import { LayoutPicker } from "@/components/studio/layout-picker";
import { PermissionHelp } from "@/components/studio/permission-help";
import { PhotoUploadButton } from "@/components/studio/photo-upload-button";
import { SessionFields } from "@/components/studio/session-fields";
import { ThemePicker } from "@/components/studio/theme-picker";
import { Button } from "@/components/ui/button";
import { RadioGroup, type RadioOption } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { getStripGeometry } from "@/lib/strip-geometry";
import { useStudioStore } from "@/lib/studio-store";
import { usePhotoUploads } from "@/hooks/use-photo-uploads";
import type { CountdownSeconds } from "@/lib/types";
import type { UseAutoSessionResult } from "@/hooks/use-auto-session";
import type { UseCameraResult } from "@/hooks/use-camera";

interface SetupStepProps {
  camera: UseCameraResult;
  session: UseAutoSessionResult;
  headingRef: RefObject<HTMLHeadingElement | null>;
}

const countdownOptions: readonly RadioOption<CountdownSeconds>[] = [
  { value: 0, label: "Off" },
  { value: 3, label: "3 sec" },
  { value: 5, label: "5 sec" },
  { value: 10, label: "10 sec" },
];

export const SetupStep = ({ camera, session, headingRef }: SetupStepProps) => {
  const layoutId = useStudioStore((state) => state.layoutId);
  const themeId = useStudioStore((state) => state.themeId);
  const filterId = useStudioStore((state) => state.filterId);
  const countdownSeconds = useStudioStore((state) => state.countdownSeconds);
  const mirror = useStudioStore((state) => state.mirror);
  const flash = useStudioStore((state) => state.flash);
  const photos = useStudioStore((state) => state.photos);
  const setLayout = useStudioStore((state) => state.setLayout);
  const setTheme = useStudioStore((state) => state.setTheme);
  const setFilter = useStudioStore((state) => state.setFilter);
  const setCountdown = useStudioStore((state) => state.setCountdown);
  const setMirror = useStudioStore((state) => state.setMirror);
  const setFlash = useStudioStore((state) => state.setFlash);
  const { inputRef, isProcessing, handleChange, openPicker } =
    usePhotoUploads(camera);
  const slotCount = getStripGeometry(layoutId).slotCount;
  const extraCount = Math.max(0, photos.length - slotCount);
  const canRetry =
    camera.error?.code !== "missing" && camera.error?.code !== "insecure";

  const startSession = () => void session.start();
  const retryCamera = () => void camera.start();
  const switchCamera = () => void camera.switchCamera();
  const uploadButton = (className?: string) => (
    <PhotoUploadButton
      isDisabled={isProcessing || session.isRunning}
      onClick={openPicker}
      className={className}
    />
  );

  return (
    <section className="animate-step-in min-w-0 lg:col-span-5">
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
        <p className="type-micro text-brick">01 · Setup</p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="type-h2 mt-2 focus:outline-none"
        >
          Set the scene
        </h1>
        <p className="type-small mt-2 max-w-[42ch] text-ink-soft">
          Choose a paper, a tone, and how many frames to keep.
        </p>
      </div>

      <div className="panel space-y-5 p-4 sm:space-y-6 sm:p-6">
        <CameraDeviceSelect camera={camera} isDisabled={session.isRunning} />
        <LayoutPicker value={layoutId} onChange={setLayout} />
        {extraCount ? (
          <p className="rounded-control border border-rule bg-paper px-3 py-2.5 text-xs leading-5 text-ink-soft">
            {extraCount} extra {extraCount === 1 ? "shot is" : "shots are"} kept
            and will return if you choose a larger layout.
          </p>
        ) : null}
        <div aria-hidden="true" className="perforation" />
        <ThemePicker value={themeId} onChange={setTheme} />
        <div aria-hidden="true" className="perforation" />
        <FilterPicker value={filterId} onChange={setFilter} />
        <div aria-hidden="true" className="perforation" />
        <RadioGroup
          name="studio-countdown"
          legend="Countdown"
          value={countdownSeconds}
          onValueChange={setCountdown}
          options={countdownOptions}
          groupClassName="grid-cols-4 gap-1.5"
          optionClassName="justify-center px-1.5 text-center text-xs"
        />
        <div className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
          <Switch
            label="Mirror front camera"
            description="Face the way you expect in the preview."
            checked={mirror}
            onCheckedChange={setMirror}
          />
          <Switch
            label="Screen flash"
            description="A quick frame of light for each shot."
            checked={flash}
            onCheckedChange={setFlash}
          />
        </div>
        <div aria-hidden="true" className="perforation" />
        <div className="space-y-4">
          <p className="type-micro text-ink-soft">Details</p>
          <SessionFields />
        </div>

        <PermissionHelp
          error={camera.error}
          isRetryAvailable={canRetry}
          isSwitchAvailable={
            camera.error?.code === "overconstrained" &&
            camera.devices.length > 1
          }
          onRetry={retryCamera}
          onSwitch={switchCamera}
        >
          {uploadButton()}
        </PermissionHelp>

        <div className="hidden gap-3 border-t border-rule pt-5 lg:grid">
          <Button
            onClick={startSession}
            disabled={camera.status === "requesting"}
          >
            Start session
            <ArrowRight aria-hidden="true" />
          </Button>
          {uploadButton("w-full")}
        </div>
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-rule bg-paper px-4 pt-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))] shadow-[0_-8px_24px_rgb(33_26_22_/_0.08)] lg:hidden">
        <div className="site-container grid grid-cols-[1fr_1fr] gap-3 px-0">
          <Button
            onClick={startSession}
            disabled={camera.status === "requesting"}
            className="min-w-0 px-2"
          >
            Start session
          </Button>
          {uploadButton("min-w-0 px-2")}
        </div>
      </div>
    </section>
  );
};
