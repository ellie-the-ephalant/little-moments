"use client";

import { useEffect, useState } from "react";

export const useObjectUrl = (blob: Blob | null | undefined) => {
  const [objectUrl, setObjectUrl] = useState<{
    blob: Blob;
    url: string;
  } | null>(null);

  useEffect(() => {
    let isActive = true;
    if (!blob) {
      void Promise.resolve().then(() => {
        if (isActive) setObjectUrl(null);
      });
      return () => {
        isActive = false;
      };
    }

    const url = URL.createObjectURL(blob);
    void Promise.resolve().then(() => {
      if (isActive) setObjectUrl({ blob, url });
    });
    return () => {
      isActive = false;
      URL.revokeObjectURL(url);
    };
  }, [blob]);

  return objectUrl && objectUrl.blob === blob ? objectUrl.url : null;
};
