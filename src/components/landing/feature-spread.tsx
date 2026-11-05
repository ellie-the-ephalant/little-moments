import { FeatureContactSheet } from "@/components/landing/feature-contact-sheet";

export const FeatureSpread = () => (
  <section className="site-container grid gap-8 py-14 sm:py-20 md:grid-cols-12 md:items-start md:gap-8 lg:gap-10">
    <div className="max-w-lg md:col-span-6 lg:sticky lg:top-24 lg:col-span-4">
      <p className="type-micro text-brick">04 · Make it yours</p>
      <h2 className="type-h2 mt-3">A whole roll of ways to keep it.</h2>
      <p className="type-body mt-5 max-w-[40ch] text-ink-soft">
        Five cuts, six papers, seven tones. Make the strip feel like the moment
        you want to remember.
      </p>
      <p className="mt-5 border-l-2 border-brick pl-4 font-display text-xl text-brick italic">
        Camera optional. Uploads welcome.
      </p>
    </div>
    <div className="min-w-0 md:col-span-6 lg:col-span-8">
      <FeatureContactSheet />
    </div>
  </section>
);
