import type { ButtonHTMLAttributes } from "react";

import { cn } from "@/lib/cn";

export type ButtonVariant = "primary" | "secondary" | "quiet" | "danger";
export type ButtonSize = "sm" | "md";

const baseStyles =
  "type-button inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-control transition-colors duration-150 disabled:cursor-not-allowed disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0";

const variantStyles: Record<ButtonVariant, string> = {
  primary: "bg-brick px-5 text-cream hover:bg-brick-deep active:translate-y-px",
  secondary:
    "border-b border-rule px-0.5 pb-0.5 text-ink hover:border-brick hover:text-brick",
  quiet: "px-0.5 text-ink-soft hover:text-ink",
  danger:
    "border-b border-brick/40 px-0.5 pb-0.5 text-brick hover:border-brick hover:text-brick-deep",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "text-sm",
  md: "text-[0.9375rem]",
};

export function buttonStyles({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
} = {}) {
  return cn(baseStyles, variantStyles[variant], sizeStyles[size], className);
}

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={buttonStyles({ variant, size, className })}
      {...props}
    />
  );
}
