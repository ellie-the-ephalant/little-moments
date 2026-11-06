import { SampleScene } from "@/components/landing/sample-scenes";
import { filterOrder, filters } from "@/lib/filters";
import { layoutOrder, layouts } from "@/lib/layouts";
import { themeOrder, themes } from "@/lib/themes";

const frames = ["top", "second", "third", "bottom"] as const;

export const FeatureContactSheet = () => (
  <figure className="relative border border-rule bg-cream shadow-panel">
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-dashed border-rule px-4 py-3 sm:px-6">
      <p className="type-micro text-ink-soft">little moments / contact sheet</p>
      <span className="rotate-[-4deg] border border-brick px-2 py-1 text-[0.55rem] font-bold tracking-[0.14em] text-brick uppercase">
        no cloud
      </span>
    </div>

    <div className="divide-y divide-dashed divide-rule px-4 sm:px-6">
      <section className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-2 py-5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-4">
        <h3 className="type-micro pt-2 text-ink-soft">5 cuts</h3>
        <ul className="grid grid-cols-5 gap-1.5 sm:gap-3">
          {layoutOrder.map((id) => {
            const layout = layouts[id];
            return (
              <li key={id} className="min-w-0 text-center">
                <div
                  aria-hidden="true"
                  className="mx-auto grid h-14 w-9 gap-0.5 border border-ink/60 p-1"
                  style={{
                    gridTemplateColumns: `repeat(${layout.cols}, minmax(0, 1fr))`,
                    gridTemplateRows: `repeat(${layout.rows}, minmax(0, 1fr))`,
                  }}
                >
                  {Array.from({ length: layout.cols * layout.rows }, (_, i) => {
                    const row = Math.floor(i / layout.cols);
                    const column = i % layout.cols;
                    return (
                      <span
                        key={`${id}-row-${row}-column-${column}`}
                        className="border border-ink/50 bg-paper"
                      />
                    );
                  })}
                </div>
                <span className="mt-2 block text-[0.6rem] leading-tight font-semibold text-ink">
                  {layout.shortLabel}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-2 py-5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-4">
        <h3 className="type-micro pt-2 text-ink-soft">6 papers</h3>
        <ul className="grid grid-cols-2 gap-x-2 gap-y-4 lg:grid-cols-6 lg:gap-x-1">
          {themeOrder.map((id) => {
            const theme = themes[id];
            return (
              <li key={id} className="flex min-w-0 flex-col items-center">
                <div
                  aria-hidden="true"
                  className="flex h-[92px] w-[72px] flex-col border p-1.5"
                  style={{
                    backgroundColor: theme.bg,
                    borderColor: theme.border,
                    color: theme.ink,
                  }}
                >
                  <span className="truncate font-display text-[0.46rem] leading-none italic">
                    a slow afternoon
                  </span>
                  <span
                    className="mt-1 text-[0.32rem] font-bold tracking-[0.12em] uppercase"
                    style={{ color: theme.accent }}
                  >
                    4 · 12 · 2026
                  </span>
                  <span className="mt-1 grid flex-1 grid-rows-4 gap-[2px]">
                    {frames.map((frame) => (
                      <span
                        key={`${id}-${frame}`}
                        className="border"
                        style={{
                          backgroundColor: theme.paper,
                          borderColor: theme.border,
                        }}
                      />
                    ))}
                  </span>
                </div>
                <span className="mt-2 text-[0.6rem] leading-tight font-semibold text-ink">
                  {theme.label}
                </span>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="grid grid-cols-[3.5rem_minmax(0,1fr)] gap-2 py-5 sm:grid-cols-[4.5rem_minmax(0,1fr)] sm:gap-4">
        <h3 className="type-micro pt-2 text-ink-soft">7 tones</h3>
        <ul className="grid grid-cols-4 gap-1.5 lg:grid-cols-7 lg:gap-1">
          {filterOrder.map((id) => (
            <li key={id} className="min-w-0 text-center">
              <div
                aria-hidden="true"
                className="mx-auto aspect-[4/5] w-full max-w-[4.5rem] overflow-hidden border border-rule bg-paper"
                style={{ filter: filters[id].css }}
              >
                <SampleScene scene="mugs" />
              </div>
              <span className="mt-2 block text-[0.58rem] leading-tight font-semibold text-ink">
                {filters[id].label}
              </span>
            </li>
          ))}
        </ul>
      </section>
    </div>

    <figcaption className="flex flex-wrap gap-x-4 gap-y-2 border-t border-rule px-4 py-3 text-[0.62rem] font-semibold tracking-[0.08em] text-ink-soft uppercase sm:px-6">
      <span>no account</span>
      <span>saved here</span>
      <span>works without a camera</span>
    </figcaption>
  </figure>
);
