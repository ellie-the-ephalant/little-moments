import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { buttonStyles } from "@/components/ui/button";

export const ClosingCta = () => (
  <section className="closing-band mt-6 bg-paper-deep py-16 sm:py-20">
    <div className="site-container flex flex-col items-center text-center">
      <p className="type-micro text-brick">A little thing to keep</p>
      <h2 className="type-h2 mt-4 max-w-[16ch]">
        The moment is <span className="text-brick italic">already</span> here.
      </h2>
      <Link
        href="/studio"
        className={buttonStyles({ className: "mt-7 gap-2" })}
      >
        Start a strip
        <ArrowRight aria-hidden="true" />
      </Link>
      <p className="type-micro mt-5 text-ink-soft">
        No account. No uploads. No cloud.
      </p>
    </div>
  </section>
);
