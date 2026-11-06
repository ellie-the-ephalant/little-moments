import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { cn } from "@/lib/cn";

interface EmptyStripTeaserProps {
  isCompact?: boolean;
}

export const EmptyStripTeaser = ({
  isCompact = false,
}: EmptyStripTeaserProps) => (
  <div
    className={cn(
      "panel grid items-center gap-6 p-5 sm:p-7",
      isCompact ? "sm:grid-cols-[minmax(0,0.8fr)_1.2fr]" : "md:grid-cols-2",
    )}
  >
    <div
      aria-hidden="true"
      className={cn(
        "mx-auto w-full",
        isCompact ? "max-w-[5rem]" : "max-w-[7rem]",
      )}
    >
      <div className="rotate-[-2deg] border border-dashed border-rule bg-cream p-3 shadow-panel">
        <div className="flex items-center justify-between border-b border-dashed border-rule pb-2">
          <span className="font-display text-sm font-semibold text-ink-soft italic">
            little moments
          </span>
          <span className="size-2 rounded-full bg-paper-shade" />
        </div>
        <div className="mt-2 grid gap-2">
          {Array.from({ length: 4 }, (_, index) => (
            <span
              key={`empty-frame-${index + 1}`}
              className="aspect-[4/5] rounded-[2px] border border-dashed border-rule bg-paper"
            />
          ))}
        </div>
        <span className="mt-2 block text-center text-[0.5625rem] font-bold tracking-[0.18em] text-ink-soft uppercase">
          Made on this device
        </span>
      </div>
    </div>
    <div className="max-w-md">
      <p className="type-micro text-brick">A blank strip</p>
      <h2 className="mt-2 font-display text-2xl leading-tight font-semibold text-ink">
        Your first strip will live here.
      </h2>
      {!isCompact ? (
        <p className="type-small mt-2 text-ink-soft">
          Saved only in this browser. Nothing is uploaded.
        </p>
      ) : null}
      <Link
        href="/studio"
        className={buttonStyles({ className: "mt-5 gap-2" })}
      >
        Start a strip
        <ArrowRight aria-hidden="true" />
      </Link>
    </div>
  </div>
);
