import { ClosingCta } from "@/components/landing/closing-cta";
import { FeatureSpread } from "@/components/landing/feature-spread";
import { Hero } from "@/components/landing/hero";
import { HowItWorks } from "@/components/landing/how-it-works";
import { RecentMoments } from "@/components/landing/recent-moments";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main" className="overflow-x-clip">
        <Hero />
        <HowItWorks />
        <FeatureSpread />
        <RecentMoments />
        <ClosingCta />
      </main>
      <SiteFooter />
    </>
  );
}
