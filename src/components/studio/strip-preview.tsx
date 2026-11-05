"use client";

import { useEffect, useRef, useState } from "react";

import { useDocumentFonts } from "@/hooks/use-document-fonts";
import { cn } from "@/lib/cn";
import { filters } from "@/lib/filters";
import { layouts } from "@/lib/layouts";
import { renderStrip, type StripRenderSettings } from "@/lib/render-strip";
import { getStripGeometry } from "@/lib/strip-geometry";
import { themes } from "@/lib/themes";
import type { Photo } from "@/lib/types";

interface StripPreviewProps {
  photos: Photo[];
  settings: StripRenderSettings;
  className?: string;
}

export const StripPreview = ({
  photos,
  settings,
  className,
}: StripPreviewProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const renderToken = useRef(0);
  const [status, setStatus] = useState<"loading" | "ready" | "error">(
    "loading",
  );
  const [devicePixelRatio, setDevicePixelRatio] = useState(1);
  const fontRevision = useDocumentFonts();
  const geometry = getStripGeometry(settings.layoutId);
  const label = `Photo strip preview, ${layouts[settings.layoutId].shortLabel.toLowerCase()} layout, ${geometry.slotCount} photos, ${themes[settings.themeId].label.toLowerCase()} paper, ${filters[settings.filterId].label.toLowerCase()} tone`;
  const isMissingPhotos = photos.length < geometry.slotCount;

  useEffect(() => {
    const updatePixelRatio = () =>
      setDevicePixelRatio(window.devicePixelRatio || 1);
    updatePixelRatio();
    window.addEventListener("resize", updatePixelRatio);
    return () => window.removeEventListener("resize", updatePixelRatio);
  }, []);

  useEffect(() => {
    const token = ++renderToken.current;
    let mounted = true;
    const timer = window.setTimeout(() => {
      if (!mounted || renderToken.current !== token) return;
      setStatus("loading");
      void (async () => {
        let rendered: HTMLCanvasElement | undefined;
        try {
          rendered = await renderStrip({
            photos,
            settings: {
              layoutId: settings.layoutId,
              themeId: settings.themeId,
              filterId: settings.filterId,
              title: settings.title,
              dateISO: settings.dateISO,
            },
            mode: "preview",
            scale: 1,
          });
          if (!mounted || renderToken.current !== token) return;

          const canvas = canvasRef.current;
          if (!canvas) throw new Error("Preview canvas is unavailable");
          canvas.width = rendered.width;
          canvas.height = rendered.height;
          const context = canvas.getContext("2d");
          if (!context) throw new Error("Preview canvas is unavailable");
          context.drawImage(rendered, 0, 0);
          setStatus("ready");
        } catch {
          if (mounted && renderToken.current === token) setStatus("error");
        } finally {
          if (rendered) {
            rendered.width = 0;
            rendered.height = 0;
          }
        }
      })();
    }, 120);

    return () => {
      mounted = false;
      window.clearTimeout(timer);
      if (renderToken.current === token) renderToken.current += 1;
    };
  }, [
    photos,
    settings.layoutId,
    settings.themeId,
    settings.filterId,
    settings.title,
    settings.dateISO,
    fontRevision,
  ]);

  const statusText =
    status === "loading"
      ? "Arranging your strip…"
      : status === "error"
        ? isMissingPhotos
          ? "Fill every visible frame to preview the strip."
          : "The strip preview couldn't be rendered."
        : null;

  return (
    <figure
      className={cn(
        "mx-auto w-full rounded-panel border border-rule bg-cream p-3 shadow-panel",
        className,
      )}
      aria-busy={status === "loading"}
    >
      <canvas
        ref={canvasRef}
        width={geometry.width}
        height={geometry.height}
        role="img"
        aria-label={label}
        className="mx-auto block h-auto w-full"
        style={{ maxWidth: `${geometry.width / devicePixelRatio}px` }}
      >
        {label}. Complete every visible frame to see the strip.
      </canvas>
      {statusText && (
        <figcaption
          className="type-small mt-3 text-center text-ink-soft"
          role="status"
        >
          {statusText}
        </figcaption>
      )}
    </figure>
  );
};
