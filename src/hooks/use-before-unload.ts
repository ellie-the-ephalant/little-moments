"use client";

import { useEffect } from "react";

import { useStudioStore } from "../lib/studio-store";

export function useBeforeUnload() {
  const hasPhotos = useStudioStore((state) => state.photos.length > 0);

  useEffect(() => {
    if (!hasPhotos) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [hasPhotos]);
}
