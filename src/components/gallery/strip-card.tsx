"use client";

import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/cn";
import { layouts } from "@/lib/layouts";
import { themes } from "@/lib/themes";
import type { StripRecord } from "@/lib/types";
import { formatDateLabel, toLocalISO } from "@/lib/utils";
import { useObjectUrl } from "@/hooks/use-object-url";

interface StripCardProps {
  record: StripRecord;
  href?: string;
  className?: string;
  onOpen?: () => void;
}

export const StripCard = ({
  record,
  href,
  className,
  onOpen,
}: StripCardProps) => {
  const imageUrl = useObjectUrl(record.thumb);
  const dateLabel = formatDateLabel(toLocalISO(new Date(record.createdAt)));
  const theme = themes[record.themeId];
  const content = (
    <span className="panel block overflow-hidden rounded-panel p-2 text-left shadow-panel transition-transform duration-200 group-hover:-translate-y-0.5">
      <span
        className="relative block aspect-[4/5] overflow-hidden rounded-control border border-rule"
        style={{ backgroundColor: theme.bg }}
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt=""
            fill
            unoptimized
            sizes="(min-width: 1024px) 28vw, (min-width: 640px) 45vw, 90vw"
            className="object-cover object-top transition-transform duration-300 group-hover:scale-[1.025]"
          />
        ) : null}
        <span className="absolute top-2 left-2 rounded-[2px] border border-ink/15 bg-cream/95 px-2 py-1 text-[0.625rem] font-bold tracking-[0.12em] text-ink uppercase">
          {layouts[record.layoutId].shortLabel}
        </span>
      </span>
      <span className="block px-2 pt-3 pb-2">
        <span className="block truncate font-display text-lg leading-tight font-semibold text-ink">
          {record.title}
        </span>
        <span className="mt-1 block text-xs font-semibold tracking-[0.12em] text-ink-soft uppercase">
          {dateLabel}
        </span>
      </span>
    </span>
  );
  const rootClassName = cn("group block w-full", className);

  if (href) {
    return (
      <Link
        href={href}
        aria-label={`View ${record.title} in the gallery`}
        className={rootClassName}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      aria-label={`Open ${record.title}`}
      onClick={onOpen}
      className={cn(
        rootClassName,
        "appearance-none rounded-panel border-0 bg-transparent p-0 text-left",
      )}
    >
      {content}
    </button>
  );
};
