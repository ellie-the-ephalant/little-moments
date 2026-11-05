"use client";

import type { ReactNode } from "react";

import { Button } from "@/components/ui/button";

interface PermissionHelpProps {
  error: { title: string; message: string } | null;
  isRetryAvailable: boolean;
  isSwitchAvailable?: boolean;
  onRetry?: () => void;
  onSwitch?: () => void;
  children?: ReactNode;
}

export const PermissionHelp = ({
  error,
  isRetryAvailable,
  isSwitchAvailable = false,
  onRetry,
  onSwitch,
  children,
}: PermissionHelpProps) => {
  if (!error) return null;

  return (
    <section
      role="alert"
      className="rounded-control border border-brick/50 bg-paper px-4 py-4"
    >
      <p className="type-micro text-brick">Camera help</p>
      <h2 className="mt-1 font-display text-xl leading-tight font-semibold">
        {error.title}
      </h2>
      <p className="type-small mt-2 text-ink-soft">{error.message}</p>
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2">
        {isRetryAvailable && onRetry ? (
          <Button variant="secondary" onClick={onRetry}>
            Try again
          </Button>
        ) : null}
        {isSwitchAvailable && onSwitch ? (
          <Button variant="secondary" onClick={onSwitch}>
            Switch camera
          </Button>
        ) : null}
        {children}
      </div>
    </section>
  );
};
