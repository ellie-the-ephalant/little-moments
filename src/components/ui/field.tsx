import type { InputHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type FieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "id"> & {
  id: string;
  label: string;
  hint?: string;
  error?: string;
  className?: string;
};

export function Field({
  id,
  label,
  hint,
  error,
  className,
  ...props
}: FieldProps) {
  const hintId = hint ? `${id}-hint` : undefined;
  const errorId = error ? `${id}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(" ") || undefined;

  return (
    <div className={cn("min-w-0 space-y-2", className)}>
      <label htmlFor={id} className="block text-sm font-semibold text-ink">
        {label}
      </label>
      <input
        id={id}
        aria-describedby={describedBy}
        aria-invalid={error ? true : undefined}
        className={cn(
          "min-h-12 w-full rounded-control border bg-paper px-3 py-2.5 text-ink transition-colors placeholder:text-ink-soft/70 disabled:cursor-not-allowed disabled:bg-paper-deep disabled:opacity-70",
          error ? "border-brick" : "border-rule hover:border-ink-soft/60",
        )}
        {...props}
      />
      {hint ? (
        <p id={hintId} className="text-xs leading-5 text-ink-soft">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p
          id={errorId}
          role="alert"
          className="text-xs leading-5 font-semibold text-brick"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}
