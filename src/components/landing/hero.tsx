import { ArrowDown, ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { HeroArtwork } from "@/components/landing/hero-artwork";
import { SampleStrip } from "@/components/landing/sample-strip";
import { buttonStyles } from "@/components/ui/button";

export const Hero = () => (
  <section className="site-container grid gap-12 pt-12 pb-16 md:grid-cols-12 md:items-center md:gap-8 md:pt-20 md:pb-24">
    <div className="md:col-span-6 lg:col-span-7">
      <p className="type-micro text-brick">A tiny photobooth</p>
      <h1 className="type-display mt-5 max-w-[18ch]">
        Keep the <span className="text-brick italic">little</span> moments.
      </h1>
      <p className="type-body-l mt-6 max-w-[52ch] text-ink-soft">
        A tiny photobooth for the people, places, and ordinary afternoons you
        want to keep. No account. Nothing uploaded. Just you and the camera.
      </p>
      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <Link href="/studio" className={buttonStyles({ className: "gap-2" })}>
          Start a strip
          <ArrowRight aria-hidden="true" />
        </Link>
        <Link
          href="#how-it-works"
          className="inline-flex min-h-11 items-center gap-2 border-b border-rule px-0.5 pb-0.5 text-sm font-semibold text-ink transition-colors hover:border-brick hover:text-brick"
        >
          See how it works
          <ArrowDown aria-hidden="true" className="size-4" />
        </Link>
      </div>
      <p className="mt-7 flex items-center gap-2 text-sm text-ink-soft">
        <LockKeyhole aria-hidden="true" className="size-4 text-brick" />
        100% on this device · no account · no uploads
      </p>
    </div>

    <div className="flex justify-center md:col-span-6 md:justify-end lg:col-span-5">
      <HeroArtwork>
        <SampleStrip className="w-[min(54vw,184px)] md:w-[236px]" />
      </HeroArtwork>
    </div>
  </section>
);
