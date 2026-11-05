import Link from "next/link";
import type { MouseEventHandler } from "react";

import { cn } from "@/lib/cn";

interface WordmarkProps {
  isCompact?: boolean;
  className?: string;
  onClick?: MouseEventHandler<HTMLAnchorElement>;
}

export function Wordmark({
  isCompact = false,
  className,
  onClick,
}: WordmarkProps) {
  return (
    <Link
      href="/"
      aria-label="little moments, home"
      onClick={onClick}
      className={cn(
        "group inline-flex items-center gap-2.5 text-ink transition-colors hover:text-brick",
        isCompact && "gap-1.5",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="flex h-[26px] w-[18px] flex-col gap-[2px] rounded-[2px] border border-current p-[2px]"
      >
        <span className="h-full flex-1 rounded-[1px] bg-current opacity-90" />
        <span className="h-full flex-1 rounded-[1px] bg-current opacity-90" />
        <span className="h-full flex-1 rounded-[1px] bg-current opacity-90" />
        <span className="h-full flex-1 rounded-[1px] bg-current opacity-90" />
      </span>
      <span
        className={cn(
          "font-display text-[1.125rem] font-semibold tracking-[-0.02em] lowercase md:text-[1.3rem]",
          isCompact && "text-sm md:text-[1.3rem]",
        )}
      >
        little moments
      </span>
    </Link>
  );
}
