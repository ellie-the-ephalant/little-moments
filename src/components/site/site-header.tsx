import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";
import { Wordmark } from "@/components/site/wordmark";

export function SiteHeader() {
  return (
    <header className="border-b border-rule/70">
      <div className="site-container flex h-16 items-center justify-between gap-3 md:h-[72px] md:gap-6">
        <Wordmark />
        <nav
          aria-label="Primary"
          className="flex items-center gap-3 sm:gap-5 md:gap-7"
        >
          <Link
            href="/#how-it-works"
            className="hidden text-sm text-ink-soft transition-colors hover:text-brick md:inline-flex"
          >
            How it works
          </Link>
          <Link
            href="/gallery"
            className="hidden text-sm text-ink-soft transition-colors hover:text-brick min-[480px]:inline-flex"
          >
            Gallery
          </Link>
          <Link
            href="/studio"
            className={buttonStyles({
              variant: "primary",
              size: "sm",
              className: "gap-1.5",
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
