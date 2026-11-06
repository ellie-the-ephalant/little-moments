"use client";

import { useEffect, useRef, useState, type RefObject } from "react";

import type { CameraFacing } from "../lib/types";

export type CameraStatus = "idle" | "requesting" | "ready" | "error";
export type CameraErrorCode =
  "denied" | "missing" | "busy" | "overconstrained" | "insecure" | "generic";

export type CameraFailure = {
  code: CameraErrorCode;
  title: string;
  message: string;
};

export interface UseCameraResult {
  videoRef: RefObject<HTMLVideoElement | null>;
  stream: MediaStream | null;
  status: CameraStatus;
  error: CameraFailure | null;
  devices: MediaDeviceInfo[];
  activeDeviceId: string | null;
  facing: CameraFacing;
  start: (deviceId?: string) => Promise<boolean>;
  stop: () => void;
  switchCamera: () => Promise<boolean>;
  selectDevice: (deviceId: string) => Promise<boolean>;
  videoReady: boolean;
}

const CAMERA_FAILURES: Record<CameraErrorCode, CameraFailure> = {
  denied: {
    code: "denied",
    title: "The camera is blocked.",
    message:
      "Allow camera access for this site in your browser settings, then try again.",
  },
  missing: {
    code: "missing",
    title: "No camera found.",
    message:
      "This device doesn't have a camera we can use. You can still make a strip from photos.",
  },
  busy: {
    code: "busy",
    title: "The camera is busy.",
    message: "Another app is using it. Close that app and try again.",
  },
  overconstrained: {
    code: "overconstrained",
    title: "That camera didn't cooperate.",
    message:
      "We couldn't start it with the requested settings. Try another camera or upload.",
  },
  insecure: {
    code: "insecure",
    title: "Camera needs a secure page.",
    message: "Open this site over HTTPS to use the camera.",
  },
  generic: {
    code: "generic",
    title: "We couldn't reach the camera.",
    message: "Check permissions and try again, or upload photos instead.",
  },
};

function errorName(error: unknown) {
  return typeof error === "object" && error !== null && "name" in error
    ? String((error as { name: unknown }).name)
    : "";
}

export function getCameraErrorCode(error: unknown): CameraErrorCode {
  switch (errorName(error)) {
    case "NotAllowedError":
    case "PermissionDeniedError":
      return "denied";
    case "NotFoundError":
    case "DevicesNotFoundError":
      return "missing";
    case "NotReadableError":
    case "TrackStartError":
    case "AbortError":
      return "busy";
    case "OverconstrainedError":
    case "ConstraintNotSatisfiedError":
    case "TypeError":
      return "overconstrained";
    case "SecurityError":
      return "insecure";
    default:
      return "generic";
  }
}

function facingFromLabel(label: string): CameraFacing | null {
  if (/front|user|facetime/i.test(label)) return "user";
  if (/back|rear|environment/i.test(label)) return "environment";
  return null;
}

function stopTracks(
  stream: MediaStream | null,
  handlers: Map<MediaStreamTrack, EventListener>,
) {
  if (!stream) return;
  for (const track of stream.getTracks()) {
    const handler = handlers.get(track);
    if (handler) track.removeEventListener("ended", handler);
    handlers.delete(track);
    track.stop();
  }
}

export function useCamera(): UseCameraResult {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const generation = useRef(0);
  const endedHandlers = useRef(new Map<MediaStreamTrack, EventListener>());
  const statusRef = useRef<CameraStatus>("idle");
  const devicesRef = useRef<MediaDeviceInfo[]>([]);
  const activeDeviceIdRef = useRef<string | null>(null);
  const [status, setStatus] = useState<CameraStatus>("idle");
  const [error, setError] = useState<CameraFailure | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);
  const [facing, setFacing] = useState<CameraFacing>("user");
  const [videoReady, setVideoReady] = useState(false);

  const updateStatus = (next: CameraStatus) => {
    statusRef.current = next;
    setStatus(next);
  };

  const updateActiveDevice = (next: string | null) => {
    activeDeviceIdRef.current = next;
    setActiveDeviceId(next);
  };

  const clearCurrentStream = () => {
    stopTracks(streamRef.current, endedHandlers.current);
    streamRef.current = null;
    setStream(null);
    setVideoReady(false);
    updateActiveDevice(null);
  };

  const enumerateVideoDevices = async (request: number) => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.enumerateDevices
    ) {
      return [];
    }
    try {
      const videoDevices = (
        await navigator.mediaDevices.enumerateDevices()
      ).filter((device) => device.kind === "videoinput");
      if (generation.current !== request) return [];
      devicesRef.current = videoDevices;
      setDevices(videoDevices);
      return videoDevices;
    } catch {
      return [];
    }
  };

  const startWith = async (
    deviceId: string | undefined,
    requestedFacing: CameraFacing,
  ) => {
    const request = ++generation.current;
    clearCurrentStream();
    setError(null);
    updateStatus("requesting");

    const mediaDevices =
      typeof navigator === "undefined" ? undefined : navigator.mediaDevices;
    if (!mediaDevices?.getUserMedia) {
      setError(CAMERA_FAILURES.insecure);
      updateStatus("error");
      return false;
    }

    const constraints: MediaStreamConstraints = deviceId
      ? { video: { deviceId: { exact: deviceId } }, audio: false }
      : {
          video: {
            facingMode: { ideal: requestedFacing },
            width: { ideal: 1280 },
            height: { ideal: 960 },
          },
          audio: false,
        };

    let nextStream: MediaStream;
    try {
      try {
        nextStream = await mediaDevices.getUserMedia(constraints);
      } catch (firstError) {
        if (generation.current !== request) return false;
        const retryable =
          getCameraErrorCode(firstError) === "overconstrained" &&
          (errorName(firstError) === "TypeError" ||
            errorName(firstError) === "OverconstrainedError" ||
            errorName(firstError) === "ConstraintNotSatisfiedError");
        if (!retryable) throw firstError;
        try {
          nextStream = await mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch {
          if (generation.current !== request) return false;
          setError(CAMERA_FAILURES.overconstrained);
          updateStatus("error");
          return false;
        }
      }
    } catch (requestError) {
      if (generation.current !== request) return false;
      setError(CAMERA_FAILURES[getCameraErrorCode(requestError)]);
      updateStatus("error");
      return false;
    }

    if (generation.current !== request) {
      stopTracks(nextStream, endedHandlers.current);
      return false;
    }

    streamRef.current = nextStream;
    setStream(nextStream);
    const track = nextStream.getVideoTracks()[0];
    const settings = track?.getSettings();
    const device = deviceId
      ? devicesRef.current.find((item) => item.deviceId === deviceId)
      : undefined;
    const trackFacing = settings?.facingMode;
    setFacing(
      trackFacing === "environment" || trackFacing === "user"
        ? trackFacing
        : (facingFromLabel(device?.label ?? "") ?? requestedFacing),
    );
    updateActiveDevice(settings?.deviceId || deviceId || null);
    updateStatus("ready");

    for (const videoTrack of nextStream.getVideoTracks()) {
      const handleEnded: EventListener = () => {
        if (
          generation.current !== request ||
          streamRef.current !== nextStream
        ) {
          return;
        }
        clearCurrentStream();
        setError(CAMERA_FAILURES.generic);
        updateStatus("error");
      };
      endedHandlers.current.set(videoTrack, handleEnded);
      videoTrack.addEventListener("ended", handleEnded, { once: true });
    }
    void enumerateVideoDevices(request);
    return true;
  };

  const start = (deviceId?: string) => {
    const label =
      devicesRef.current.find((device) => device.deviceId === deviceId)
        ?.label ?? "";
    return startWith(deviceId, facingFromLabel(label) ?? "user");
  };

  const stop = () => {
    generation.current += 1;
    clearCurrentStream();
    setError(null);
    updateStatus("idle");
  };

  const switchCamera = async () => {
    if (statusRef.current !== "ready") return false;
    const request = generation.current;
    const videoDevices = await enumerateVideoDevices(request);
    if (
      generation.current !== request ||
      statusRef.current !== "ready" ||
      videoDevices.length < 2
    ) {
      return false;
    }

    const opposite = facing === "user" ? "environment" : "user";
    const currentIndex = videoDevices.findIndex(
      (device) => device.deviceId === activeDeviceIdRef.current,
    );
    const nextByOrder =
      videoDevices[
        (currentIndex + 1 + videoDevices.length) % videoDevices.length
      ];
    const nextDevice =
      videoDevices.find(
        (device) =>
          device.deviceId !== activeDeviceIdRef.current &&
          facingFromLabel(device.label) === opposite,
      ) ?? nextByOrder;
    if (!nextDevice) return false;
    return startWith(
      nextDevice.deviceId,
      facingFromLabel(nextDevice.label) ?? opposite,
    );
  };

  const selectDevice = (deviceId: string) => {
    if (!deviceId || statusRef.current === "requesting")
      return Promise.resolve(false);
    const label =
      devicesRef.current.find((device) => device.deviceId === deviceId)
        ?.label ?? "";
    return startWith(deviceId, facingFromLabel(label) ?? facing);
  };

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (!stream) {
      video.srcObject = null;
      return;
    }

    video.srcObject = stream;
    const updateReady = () => {
      if (video.srcObject === stream) {
        setVideoReady(video.readyState >= 2 && video.videoWidth > 0);
      }
    };
    video.addEventListener("loadeddata", updateReady);
    void video.play().catch(() => {});
    updateReady();

    return () => {
      video.removeEventListener("loadeddata", updateReady);
      if (video.srcObject === stream) video.srcObject = null;
    };
  }, [stream]);

  useEffect(
    () => () => {
      generation.current += 1;
      stopTracks(streamRef.current, endedHandlers.current);
      streamRef.current = null;
    },
    [],
  );

  return {
    videoRef,
    stream,
    status,
    error,
    devices,
    activeDeviceId,
    facing,
    start,
    stop,
    switchCamera,
    selectDevice,
    videoReady,
  };
}
