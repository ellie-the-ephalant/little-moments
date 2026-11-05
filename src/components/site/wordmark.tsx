import Link from "next/link";

import { cn } from "@/lib/cn";

export function Wordmark({ className }: { className?: string }) {
  return (
    <Link
      href="/"
      aria-label="little moments, home"
      className={cn(
        "group inline-flex items-center gap-2.5 text-ink transition-colors hover:text-brick",
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
      <span className="font-display text-[1.125rem] font-semibold tracking-[-0.02em] lowercase md:text-[1.3rem]">
        little moments
      </span>
    </Link>
  );
}
