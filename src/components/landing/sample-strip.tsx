import { cn } from "@/lib/cn";

import { SampleScene, type SampleSceneId } from "./sample-scenes";

interface SampleStripProps {
  className?: string;
}

const scenes: SampleSceneId[] = ["window", "cat", "mugs", "camera"];

export const SampleStrip = ({ className }: SampleStripProps) => (
  <div aria-hidden="true" className={cn("relative isolate", className)}>
    <div className="absolute -top-[2%] -left-[14%] z-0 w-[61%] rotate-[-8deg] border border-rule bg-cream p-[3%] shadow-panel">
      <div className="aspect-[4/5] overflow-hidden">
        <SampleScene scene="window" />
      </div>
      <p className="pt-1 text-center font-display text-[0.55rem] leading-none text-ink-soft italic">
        tuesday
      </p>
    </div>
    <div className="absolute top-[7%] -right-[14%] z-0 w-[59%] rotate-[6deg] border border-rule bg-paper-deep p-[3%] shadow-panel">
      <div className="aspect-[4/5] overflow-hidden">
        <SampleScene scene="mugs" />
      </div>
    </div>

    <figure className="animate-strip-float relative z-10 rotate-[-3.5deg] border border-rule bg-cream p-[4.5%] shadow-panel">
      <div className="mb-[3%] grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-1 border-b border-rule pb-[3%]">
        <figcaption className="min-w-0 font-display text-[clamp(0.75rem,3.2vw,1.2rem)] leading-none whitespace-nowrap text-ink italic md:text-[1.2rem]">
          a slow afternoon
        </figcaption>
        <span className="shrink-0 text-[0.42rem] font-bold tracking-[0.14em] text-brick uppercase sm:text-[0.48rem]">
          4 · 12 · 2026
        </span>
      </div>
      <div className="grid gap-[2.2%]">
        {scenes.map((scene) => (
          <div
            key={scene}
            className="aspect-[4/5] overflow-hidden border border-rule/80 bg-paper"
          >
            <SampleScene scene={scene} />
          </div>
        ))}
      </div>
      <p className="pt-[3%] text-center text-[0.43rem] font-bold tracking-[0.18em] text-ink-soft sm:text-[0.48rem]">
        made on this device
      </p>
    </figure>

    <span className="washi-tape absolute -top-[2.2%] left-[7%] z-20 h-[2.5%] w-[32%] rotate-[-11deg] bg-gold/70" />
    <span className="washi-tape absolute -top-[2.2%] right-[5%] z-20 h-[2.5%] w-[29%] rotate-[12deg] bg-gold/70" />
    <span className="absolute -right-[17%] bottom-[2%] z-30 grid size-[4.6rem] rotate-[-7deg] place-items-center rounded-full border border-brick bg-paper/90 px-2 text-center text-[0.55rem] leading-tight font-bold tracking-[0.16em] text-brick uppercase">
      No cloud
    </span>
  </div>
);
