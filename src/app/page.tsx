import { ArrowRight, LockKeyhole } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonStyles } from "@/components/ui/button";

const frames = ["01", "02", "03", "04"];

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="overflow-x-clip">
        <section className="site-container grid gap-14 pt-[72px] pb-20 md:grid-cols-12 md:items-center md:gap-10 md:pt-20 md:pb-28 lg:pt-[128px] lg:pb-32">
          <div className="md:col-span-7">
            <p className="type-micro text-brick">A tiny photobooth</p>
            <h1 className="type-display mt-5 max-w-[18ch]">
              Keep the <span className="text-brick italic">little</span>{" "}
              moments.
            </h1>
            <p className="type-body-l mt-6 max-w-[52ch] text-ink-soft">
              A tiny photobooth for the people, places, and ordinary afternoons
              you want to keep. No account. Nothing uploaded. Just you and the
              camera.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
              <Link
                href="/studio"
                className={buttonStyles({ className: "gap-2" })}
              >
                Start a strip
                <ArrowRight aria-hidden="true" />
              </Link>
              <Link
                href="/gallery"
                className={buttonStyles({ variant: "secondary" })}
              >
                Open the gallery
              </Link>
            </div>
            <p className="mt-7 flex items-center gap-2 text-sm text-ink-soft">
              <LockKeyhole aria-hidden="true" className="size-4 text-brick" />
              100% on this device · no account · no uploads
            </p>
          </div>

          <div className="flex justify-center md:col-span-5 md:justify-end">
            <div aria-hidden="true" className="relative w-[190px] md:w-[228px]">
              <div className="absolute inset-x-5 top-7 h-[94%] rotate-[6deg] rounded-[2px] border border-rule bg-paper-deep shadow-panel" />
              <div className="absolute inset-x-2 top-4 h-[96%] rotate-[-8deg] rounded-[2px] border border-rule bg-cream shadow-panel" />
              <div className="animate-strip-float relative rotate-[-3.5deg] border border-rule bg-cream p-3 shadow-panel">
                <div className="flex items-baseline justify-between gap-2 border-b border-rule pb-2">
                  <p className="font-display text-lg leading-none text-ink italic">
                    a slow afternoon
                  </p>
                  <p className="text-[7px] font-semibold tracking-[0.18em] text-brick uppercase">
                    4 · 12 · 2026
                  </p>
                </div>
                <div className="mt-2 space-y-2">
                  {frames.map((frame, index) => (
                    <div
                      key={frame}
                      className="flex aspect-[4/5] items-center justify-center border border-rule/80 bg-paper"
                      style={{
                        background:
                          index % 2 === 0
                            ? "linear-gradient(145deg, #F3EBDD 0%, #E7DBC6 100%)"
                            : "linear-gradient(145deg, #FFF8EC 0%, #F3EBDD 100%)",
                      }}
                    >
                      <span className="type-micro text-ink-soft/80">
                        {frame}
                      </span>
                    </div>
                  ))}
                </div>
                <p className="pt-2 text-center text-[7px] font-semibold tracking-[0.2em] text-ink-soft uppercase">
                  made on this device
                </p>
              </div>
              <span className="absolute -right-4 -bottom-3 rotate-[-7deg] rounded-full border border-brick px-2.5 py-2 text-[8px] font-bold tracking-[0.16em] text-brick uppercase">
                No cloud
              </span>
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
