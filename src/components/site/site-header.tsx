import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { Wordmark } from "@/components/site/wordmark";

export function SiteHeader() {
  return (
    <header className="border-b border-rule/70">
      <div className="site-container flex h-16 items-center justify-between gap-2 md:h-[72px] md:gap-6">
        <Wordmark isCompact />
        <nav
          aria-label="Primary"
          className="flex items-center gap-1.5 sm:gap-4 md:gap-7"
        >
          <Link
            href="/#how-it-works"
            className="hidden text-sm text-ink-soft transition-colors hover:text-brick md:inline-flex"
          >
            How it works
          </Link>
          <Link
            href="/gallery"
            className="inline-flex min-h-11 items-center px-0.5 text-xs text-ink-soft transition-colors hover:text-brick sm:text-sm"
          >
            Gallery
          </Link>
          <Link
            href="/studio"
            className={buttonStyles({
              variant: "primary",
              size: "sm",
              className:
                "gap-1 px-2 text-xs min-[480px]:gap-1.5 min-[480px]:px-3 min-[480px]:text-sm [&_svg]:size-3 min-[480px]:[&_svg]:size-4",
            })}
          >
            Start a strip
            <ArrowRight aria-hidden="true" />
          </Link>
        </nav>
      </div>
    </header>
  );
}
