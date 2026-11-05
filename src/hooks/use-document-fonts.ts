"use client";

import { useEffect, useState } from "react";

import { ensureFonts } from "@/lib/canvas-fonts";

export function useDocumentFonts() {
  const [fontRevision, setFontRevision] = useState(0);

  useEffect(() => {
    if (!document.fonts) return;

    let mounted = true;
    const rerender = () => {
      if (mounted) setFontRevision((revision) => revision + 1);
    };
    document.fonts.addEventListener("loadingdone", rerender);
    void ensureFonts().then(rerender);

    return () => {
      mounted = false;
      document.fonts.removeEventListener("loadingdone", rerender);
    };
  }, []);

  return fontRevision;
}
