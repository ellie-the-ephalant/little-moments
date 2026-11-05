"use client";

import { useRef, useState, type ChangeEvent } from "react";

import { processUploads } from "../lib/capture";
import { getStripGeometry } from "../lib/strip-geometry";
import { useStudioStore } from "../lib/studio-store";
import { toast } from "../lib/toast-store";
import type { StudioStep } from "../lib/types";
import type { UseCameraResult } from "./use-camera";

export function getUploadDestination(
  currentStep: StudioStep,
  currentCount: number,
  addedCount: number,
  slotCount: number,
): StudioStep | null {
  if (!addedCount) return null;
  if (currentCount + addedCount >= slotCount) return "finish";
  return currentStep === "setup" ? "booth" : null;
}

export const usePhotoUploads = (camera: Pick<UseCameraResult, "stop">) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const input = event.currentTarget;
    const files = input.files ? Array.from(input.files) : [];
    input.value = "";
    if (!files.length || isProcessingRef.current) return;

    isProcessingRef.current = true;
    setIsProcessing(true);
    try {
      const store = useStudioStore.getState();
      const slotCount = getStripGeometry(store.layoutId).slotCount;
      const visibleEmptySlots = Math.max(0, slotCount - store.photos.length);
      const result = await processUploads(files, visibleEmptySlots);

      if (result.photos.length) store.addPhotos(result.photos);
      if (result.rejectedTooLarge) {
        toast("That photo is over 25 MB. Try a smaller one.", "error");
      }
      if (result.rejectedUnreadable) {
        toast(
          "That file isn't an image we can read. Try a JPEG or PNG.",
          "error",
        );
      }
      if (result.ignored)
        toast(`Added the first ${result.photos.length} photos.`);

      const destination = getUploadDestination(
        store.step,
        store.photos.length,
        result.photos.length,
        slotCount,
      );
      if (destination === "finish") {
        camera.stop();
        store.setStep(destination);
      } else if (destination) {
        store.setStep(destination);
      }
    } finally {
      isProcessingRef.current = false;
      setIsProcessing(false);
    }
  };

  const openPicker = () => {
    if (!isProcessingRef.current) inputRef.current?.click();
  };

  return { inputRef, isProcessing, handleChange, openPicker };
};
