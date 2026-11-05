"use client";

import { X } from "lucide-react";
import { useEffect, useId, useRef, type ReactNode } from "react";

import { IconButton } from "@/components/ui/icon-button";
import { cn } from "@/lib/cn";

export type DialogProps = {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children?: ReactNode;
  footer?: ReactNode;
  className?: string;
};

export function Dialog({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
}: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descriptionId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (open) {
      if (!dialog.open) {
        restoreFocusRef.current =
          document.activeElement instanceof HTMLElement
            ? document.activeElement
            : null;
        dialog.showModal();
      }
    } else if (dialog.open) {
      dialog.close();
      restoreFocusRef.current?.focus();
    }
  }, [open]);

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby={titleId}
      aria-describedby={description ? descriptionId : undefined}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={onClose}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className={cn(
        "animate-dialog-in m-auto max-h-[92dvh] w-[min(92vw,36rem)] overflow-y-auto rounded-panel border border-rule bg-cream p-0 text-ink shadow-panel",
        className,
      )}
    >
      <div className="p-5 sm:p-6">
        <div className="flex items-start justify-between gap-4 border-b border-rule pb-4">
          <div className="min-w-0">
            <h2
              id={titleId}
              className="font-display text-2xl leading-tight font-semibold text-ink"
            >
              {title}
            </h2>
            {description ? (
              <p
                id={descriptionId}
                className="mt-1.5 text-sm leading-6 text-ink-soft"
              >
                {description}
              </p>
            ) : null}
          </div>
          <IconButton
            label="Close dialog"
            onClick={onClose}
            className="-mt-1 -mr-1"
          >
            <X />
          </IconButton>
        </div>
        {children ? <div className="pt-5">{children}</div> : null}
        {footer ? (
          <div className="mt-6 flex flex-wrap items-center justify-end gap-4 border-t border-rule pt-4">
            {footer}
          </div>
        ) : null}
      </div>
    </dialog>
  );
}
