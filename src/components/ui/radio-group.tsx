import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

export type RadioOption<T extends string | number> = {
  value: T;
  label: string;
  description?: string;
  visual?: ReactNode;
};

export type RadioGroupProps<T extends string | number> = {
  name: string;
  legend: string;
  value: T;
  onValueChange: (value: T) => void;
  options: readonly RadioOption<T>[];
  className?: string;
  groupClassName?: string;
  optionClassName?: string;
};

export function RadioGroup<T extends string | number>({
  name,
  legend,
  value,
  onValueChange,
  options,
  className,
  groupClassName,
  optionClassName,
}: RadioGroupProps<T>) {
  return (
    <fieldset className={cn("min-w-0", className)}>
      <legend className="mb-3 block text-sm font-semibold text-ink">
        {legend}
      </legend>
      <div className={cn("grid gap-2", groupClassName)}>
        {options.map((option) => {
          const id = `${name}-${String(option.value)}`;
          return (
            <label
              key={id}
              htmlFor={id}
              className={cn(
                "flex min-h-11 cursor-pointer items-center gap-2.5 rounded-control border border-rule bg-paper px-3 py-2.5 text-sm text-ink transition-colors hover:border-ink-soft/60 has-[:checked]:border-brick has-[:checked]:bg-cream has-[:focus-visible]:outline has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-brick",
                optionClassName,
              )}
            >
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={value === option.value}
                onChange={() => onValueChange(option.value)}
                className="sr-only"
              />
              {option.visual ? (
                <span aria-hidden="true" className="shrink-0">
                  {option.visual}
                </span>
              ) : null}
              <span className="min-w-0">
                <span className="block font-semibold">{option.label}</span>
                {option.description ? (
                  <span className="mt-0.5 block text-xs leading-5 text-ink-soft">
                    {option.description}
                  </span>
                ) : null}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
