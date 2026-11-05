"use client";

import { useId } from "react";

import { cn } from "@/lib/cn";

export type SwitchProps = {
  id?: string;
  label: string;
  description?: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
  name?: string;
  className?: string;
};

export function Switch({
  id,
  label,
  description,
  checked,
  onCheckedChange,
  disabled,
  name,
  className,
}: SwitchProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const labelId = `${inputId}-label`;
  const descriptionId = description ? `${inputId}-description` : undefined;

  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center justify-between gap-4 text-ink has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-60",
        className,
      )}
    >
      <span className="min-w-0">
        <span id={labelId} className="block text-sm font-semibold">
          {label}
        </span>
        {description ? (
          <span
            id={descriptionId}
            className="mt-0.5 block text-xs leading-5 text-ink-soft"
          >
            {description}
          </span>
        ) : null}
      </span>
      <span className="relative inline-flex shrink-0 items-center">
        <input
          id={inputId}
          name={name}
          type="checkbox"
          checked={checked}
          disabled={disabled}
          onChange={(event) => onCheckedChange(event.target.checked)}
          aria-labelledby={labelId}
          aria-describedby={descriptionId}
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="flex h-6 w-11 items-center rounded-full border border-rule bg-paper-deep p-0.5 transition-colors peer-checked:border-brick peer-checked:bg-brick peer-focus-visible:outline peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brick peer-checked:[&>span]:translate-x-5"
        >
          <span className="size-[18px] rounded-full bg-cream shadow-sm transition-transform" />
        </span>
      </span>
    </label>
  );
}
