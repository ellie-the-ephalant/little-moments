"use client";

import { X } from "lucide-react";

import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";
import { useToastStore } from "@/lib/toast-store";

export function ToastRegion() {
  const toasts = useToastStore((state) => state.toasts);
  const dismissToast = useToastStore((state) => state.dismissToast);

  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed inset-x-0 bottom-4 z-[70] flex flex-col items-center gap-2 px-4 sm:bottom-6"
    >
      {toasts.map((item) => (
        <div
          key={item.id}
          className={cn(
            "pointer-events-auto flex w-full max-w-md items-start gap-3 rounded-panel border bg-cream px-4 py-3 text-sm shadow-panel",
            item.tone === "error"
              ? "border-brick text-brick"
              : "border-rule text-ink",
          )}
        >
          <p className="min-w-0 flex-1 leading-6">{item.message}</p>
          <IconButton
            label="Dismiss notification"
            onClick={() => dismissToast(item.id)}
            className="-my-1 -mr-2 border-0 hover:bg-paper-deep"
          >
            <X />
          </IconButton>
        </div>
      ))}
    </div>
  );
}
