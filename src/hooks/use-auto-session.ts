"use client";

import { useEffect, useRef, useState } from "react";

import { capturePhoto } from "../lib/capture";
import { getStripGeometry } from "../lib/strip-geometry";
import { useStudioStore } from "../lib/studio-store";
import type { Photo } from "../lib/types";
import type { UseCameraResult } from "./use-camera";

export type AutoSessionState =
  "idle" | "counting" | "capturing" | "gap" | "paused" | "complete" | "error";

export type AutoSessionError = {
  code: "camera" | "capture";
  title: string;
  message: string;
};

export type AutoSessionCamera = Pick<
  UseCameraResult,
  "videoRef" | "status" | "error" | "facing" | "start" | "stop"
>;

export interface UseAutoSessionResult {
  state: AutoSessionState;
  countdown: number | "Smile" | null;
  activeIndex: number | null;
  error: AutoSessionError | null;
  isRunning: boolean;
  start: () => Promise<void>;
  cancel: () => void;
  resume: () => Promise<void>;
  retake: (index: number) => Promise<void>;
  tryAgain: () => Promise<void>;
}

export function firstEmptyVisibleSlot(
  photos: readonly (Photo | undefined)[],
  slotCount: number,
) {
  const visibleCount = Number.isFinite(slotCount)
    ? Math.max(0, Math.floor(slotCount))
    : 0;
  for (let index = 0; index < visibleCount; index += 1) {
    if (!photos[index]) return index;
  }
  return -1;
}

function isRunningState(state: AutoSessionState) {
  return state === "counting" || state === "capturing" || state === "gap";
}

export function useAutoSession(
  camera: AutoSessionCamera,
  reducedMotion: boolean,
): UseAutoSessionResult {
  const [state, setState] = useState<AutoSessionState>("idle");
  const stateRef = useRef<AutoSessionState>("idle");
  const [countdown, setCountdown] = useState<number | "Smile" | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [error, setError] = useState<AutoSessionError | null>(null);
  const generation = useRef(0);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const captureInFlight = useRef<Promise<void> | null>(null);
  const cancelRequested = useRef(false);
  const trackEnded = useRef(false);
  const targetIndex = useRef<number | null>(null);
  const isRetake = useRef(false);

  const updateState = (next: AutoSessionState) => {
    stateRef.current = next;
    setState(next);
  };

  const clearTimer = () => {
    if (timer.current === null) return;
    clearTimeout(timer.current);
    timer.current = null;
  };

  const schedule = (callback: () => void, delay: number) => {
    clearTimer();
    timer.current = setTimeout(() => {
      timer.current = null;
      callback();
    }, delay);
  };

  const isCurrent = (request: number) => generation.current === request;

  const finishImmediately = () => {
    generation.current += 1;
    clearTimer();
    cancelRequested.current = false;
    trackEnded.current = false;
    targetIndex.current = null;
    isRetake.current = false;
    setError(null);
    setCountdown(null);
    setActiveIndex(null);
    updateState("complete");
    camera.stop();
    useStudioStore.getState().setStep("finish");
  };

  const finishAfterLastShot = (request: number) => {
    cancelRequested.current = false;
    trackEnded.current = false;
    targetIndex.current = null;
    isRetake.current = false;
    setError(null);
    setCountdown(null);
    setActiveIndex(null);
    updateState("complete");
    schedule(
      () => {
        if (!isCurrent(request)) return;
        camera.stop();
        useStudioStore.getState().setStep("finish");
      },
      reducedMotion ? 0 : 900,
    );
  };

  const capture = (index: number, request: number) => {
    if (!isCurrent(request) || cancelRequested.current) return;
    updateState("capturing");
    setActiveIndex(index);

    const operation = (async () => {
      try {
        const video = camera.videoRef.current;
        if (!video) throw new Error("Camera video is unavailable");
        const facingMode = (video.srcObject as MediaStream | null)
          ?.getVideoTracks()[0]
          ?.getSettings().facingMode;
        const photo = await capturePhoto({
          video,
          mirror: useStudioStore.getState().mirror,
          facing:
            facingMode === "user" || facingMode === "environment"
              ? facingMode
              : camera.facing,
        });
        if (!isCurrent(request)) return;

        const store = useStudioStore.getState();
        if (isRetake.current || index < store.photos.length) {
          store.replacePhoto(index, photo);
        } else {
          store.addPhotos([photo]);
        }

        if (trackEnded.current) {
          setCountdown(null);
          updateState("error");
          return;
        }
        if (cancelRequested.current) {
          cancelRequested.current = false;
          isRetake.current = false;
          targetIndex.current = null;
          setCountdown(null);
          setActiveIndex(null);
          updateState("paused");
          return;
        }
        if (isRetake.current) {
          isRetake.current = false;
          targetIndex.current = null;
          setCountdown(null);
          setActiveIndex(null);
          updateState("paused");
          return;
        }

        const latest = useStudioStore.getState();
        const nextIndex = firstEmptyVisibleSlot(
          latest.photos,
          getStripGeometry(latest.layoutId).slotCount,
        );
        if (nextIndex < 0) {
          finishAfterLastShot(request);
          return;
        }
        setActiveIndex(nextIndex);
        setCountdown(null);
        updateState("gap");
        schedule(() => {
          if (!isCurrent(request)) return;
          if (cancelRequested.current) {
            cancelRequested.current = false;
            updateState("paused");
            return;
          }
          beginCountdown(nextIndex, request, false);
        }, 1000);
      } catch {
        if (!isCurrent(request)) return;
        setCountdown(null);
        if (!trackEnded.current) {
          setError({
            code: "capture",
            title: "That shot didn't save.",
            message: "The camera hiccuped. Try that pose once more.",
          });
        }
        updateState("error");
      }
    })();

    captureInFlight.current = operation;
    void operation.finally(() => {
      if (captureInFlight.current === operation) captureInFlight.current = null;
    });
  };

  const beginCountdown = (index: number, request: number, retake: boolean) => {
    if (!isCurrent(request) || cancelRequested.current) return;
    targetIndex.current = index;
    isRetake.current = retake;
    setActiveIndex(index);
    setError(null);
    updateState("counting");

    const seconds = useStudioStore.getState().countdownSeconds;
    if (seconds === 0) {
      setCountdown("Smile");
      schedule(() => capture(index, request), 350);
      return;
    }
    setCountdown(seconds);
    const tick = (remaining: number) => {
      schedule(() => {
        if (!isCurrent(request) || cancelRequested.current) return;
        if (remaining > 1) {
          setCountdown(remaining - 1);
          tick(remaining - 1);
        } else {
          setCountdown("Smile");
          capture(index, request);
        }
      }, 1000);
    };
    tick(seconds);
  };

  const start = async () => {
    if (isRunningState(stateRef.current) || captureInFlight.current) return;
    const store = useStudioStore.getState();
    const slotCount = getStripGeometry(store.layoutId).slotCount;
    const index = firstEmptyVisibleSlot(store.photos, slotCount);
    if (index < 0) {
      finishImmediately();
      return;
    }
    if (camera.status === "requesting") return;

    const request = ++generation.current;
    cancelRequested.current = false;
    trackEnded.current = false;
    targetIndex.current = index;
    isRetake.current = false;
    setError(null);
    if (camera.status !== "ready" && !(await camera.start())) return;
    if (!isCurrent(request)) return;
    useStudioStore.getState().setStep("booth");
    beginCountdown(index, request, false);
  };

  const cancel = () => {
    const current = stateRef.current;
    if (!isRunningState(current)) return;
    cancelRequested.current = true;
    clearTimer();
    setCountdown(null);
    if (current === "capturing" && captureInFlight.current) return;

    generation.current += 1;
    cancelRequested.current = false;
    targetIndex.current = null;
    isRetake.current = false;
    setActiveIndex(null);
    updateState("paused");
  };

  const resume = async () => {
    if (stateRef.current !== "paused" || captureInFlight.current) {
      return;
    }
    const store = useStudioStore.getState();
    const slotCount = getStripGeometry(store.layoutId).slotCount;
    const index = firstEmptyVisibleSlot(store.photos, slotCount);
    if (index < 0) {
      const request = ++generation.current;
      finishAfterLastShot(request);
      return;
    }
    if (camera.status === "requesting") return;

    const request = ++generation.current;
    cancelRequested.current = false;
    trackEnded.current = false;
    targetIndex.current = index;
    isRetake.current = false;
    setError(null);
    if (camera.status !== "ready" && !(await camera.start())) return;
    if (!isCurrent(request)) return;
    useStudioStore.getState().setStep("booth");
    beginCountdown(index, request, false);
  };

  const retake = async (index: number) => {
    if (
      isRunningState(stateRef.current) ||
      camera.status === "requesting" ||
      captureInFlight.current
    )
      return;
    const store = useStudioStore.getState();
    const slotCount = getStripGeometry(store.layoutId).slotCount;
    if (index < 0 || index >= slotCount || !store.photos[index]) return;

    const request = ++generation.current;
    cancelRequested.current = false;
    trackEnded.current = false;
    targetIndex.current = index;
    isRetake.current = true;
    setError(null);
    if (camera.status !== "ready" && !(await camera.start())) return;
    if (!isCurrent(request)) return;
    beginCountdown(index, request, true);
  };

  const tryAgain = async () => {
    if (stateRef.current !== "error" || captureInFlight.current) return;
    const store = useStudioStore.getState();
    const index =
      targetIndex.current ??
      firstEmptyVisibleSlot(
        store.photos,
        getStripGeometry(store.layoutId).slotCount,
      );
    if (index < 0) {
      const request = ++generation.current;
      finishAfterLastShot(request);
      return;
    }
    if (camera.status === "requesting") return;
    const request = ++generation.current;
    targetIndex.current = index;
    const retakeTarget = isRetake.current;
    cancelRequested.current = false;
    trackEnded.current = false;
    setError(null);
    if (camera.status !== "ready" && !(await camera.start())) return;
    if (!isCurrent(request)) return;
    beginCountdown(index, request, retakeTarget);
  };

  useEffect(() => {
    const currentState = stateRef.current;
    const sessionActive =
      isRunningState(currentState) ||
      currentState === "paused" ||
      (currentState === "error" && targetIndex.current !== null);
    if (camera.status !== "error" || !sessionActive) return;
    trackEnded.current = true;
    cancelRequested.current = true;
    clearTimer();
    setCountdown(null);
    if (!captureInFlight.current) {
      generation.current += 1;
      cancelRequested.current = false;
    }
    setError({
      code: "camera",
      title: camera.error?.title ?? "The camera didn't cooperate.",
      message: camera.error?.message ?? "Turn the camera on and try again.",
    });
    updateState("error");
  }, [camera.error, camera.status]);

  useEffect(
    () => () => {
      generation.current += 1;
      if (timer.current !== null) clearTimeout(timer.current);
    },
    [],
  );

  return {
    state,
    countdown,
    activeIndex,
    error,
    isRunning: isRunningState(state),
    start,
    cancel,
    resume,
    retake,
    tryAgain,
  };
}
