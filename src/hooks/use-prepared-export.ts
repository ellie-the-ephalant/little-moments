"use client";

import { useEffect, useState } from "react";

import { useDocumentFonts } from "@/hooks/use-document-fonts";
import {
  getPreparedExportRevision,
  getStripRevision,
  preparePngExport,
  type PreparedPng,
} from "@/lib/export-actions";
import type { StripRenderSettings } from "@/lib/render-strip";
import type { Photo } from "@/lib/types";

type PreparedExportState =
  | { status: "preparing"; revision: string }
  | { status: "ready"; revision: string; prepared: PreparedPng }
  | { status: "error"; revision: string; error: unknown };

interface UsePreparedExportProps {
  photos: Photo[];
  settings: StripRenderSettings;
  scale: 1 | 2;
}

export const usePreparedExport = ({
  photos,
  settings,
  scale,
}: UsePreparedExportProps): PreparedExportState => {
  const fontRevision = useDocumentFonts();
  const revision = getPreparedExportRevision(
    getStripRevision(photos, settings),
    scale,
    fontRevision,
  );
  const { layoutId, themeId, filterId, title, dateISO } = settings;
  const [state, setState] = useState<PreparedExportState>({
    status: "preparing",
    revision: "",
  });

  useEffect(() => {
    let isCurrent = true;
    const timer = window.setTimeout(() => {
      void preparePngExport(
        photos,
        { layoutId, themeId, filterId, title, dateISO },
        scale,
      ).then(
        (prepared) => {
          if (isCurrent) setState({ status: "ready", revision, prepared });
        },
        (error: unknown) => {
          if (isCurrent) setState({ status: "error", revision, error });
        },
      );
    }, 350);

    return () => {
      isCurrent = false;
      window.clearTimeout(timer);
    };
  }, [dateISO, filterId, layoutId, photos, revision, scale, themeId, title]);

  return state.revision === revision
    ? state
    : { status: "preparing", revision };
};
