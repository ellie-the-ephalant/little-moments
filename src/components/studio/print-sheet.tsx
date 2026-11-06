"use client";

import { useEffect, useRef } from "react";
import { createPortal } from "react-dom";

import { useMounted } from "@/hooks/use-mounted";
import { useObjectUrl } from "@/hooks/use-object-url";

interface PrintSheetProps {
  blob: Blob;
  onComplete: () => void;
  onError: () => void;
}

export const PrintSheet = ({ blob, onComplete, onError }: PrintSheetProps) => {
  const imageRef = useRef<HTMLImageElement>(null);
  const didPrint = useRef(false);
  const isMounted = useMounted();
  const imageUrl = useObjectUrl(blob);
  const portalRoot =
    isMounted && typeof document !== "undefined" ? document.body : null;

  useEffect(() => {
    const printImage = imageRef.current;
    if (!portalRoot || !imageUrl || !printImage || didPrint.current) return;
    didPrint.current = true;

    let isActive = true;
    let safetyTimer = 0;
    const finish = () => {
      if (!isActive) return;
      isActive = false;
      window.clearTimeout(safetyTimer);
      window.removeEventListener("afterprint", finish);
      onComplete();
    };
    safetyTimer = window.setTimeout(finish, 60_000);
    window.addEventListener("afterprint", finish);

    void (async () => {
      await new Promise<void>((resolve) =>
        window.requestAnimationFrame(() =>
          window.requestAnimationFrame(() => resolve()),
        ),
      );
      await printImage.decode();
      if (isActive) window.print();
    })().catch(() => {
      if (isActive) onError();
      finish();
    });

    return () => {
      isActive = false;
      didPrint.current = false;
      window.clearTimeout(safetyTimer);
      window.removeEventListener("afterprint", finish);
    };
  }, [imageUrl, onComplete, onError, portalRoot]);

  if (!portalRoot || !imageUrl) return null;

  return createPortal(
    <div className="print-sheet" aria-hidden="true">
      {/* Print-only object URL: preserve the browser's natural image ratio. */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img ref={imageRef} src={imageUrl} alt="Your photo strip" />
    </div>,
    portalRoot,
  );
};
