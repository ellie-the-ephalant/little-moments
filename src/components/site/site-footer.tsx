import Link from "next/link";

import { Wordmark } from "@/components/site/wordmark";

const footerLinks = [
  { href: "/studio", label: "Studio" },
  { href: "/gallery", label: "Gallery" },
  {
    href: "https://github.com/ellie-the-ephalant/little-moments",
    label: "Source",
    external: true,
  },
] as const;

export function SiteFooter() {
  return (
    <footer className="border-t border-rule">
      <div className="site-container py-10 md:py-14">
        <div className="flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
          <div className="space-y-3">
            <Wordmark />
            <p className="max-w-[36ch] text-sm text-ink-soft">
              A local-first keepsake. No analytics, no accounts, no cloud.
            </p>
          </div>
          <nav
            aria-label="Footer"
            className="flex flex-wrap gap-x-5 gap-y-2 text-sm"
          >
            {footerLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                {...("external" in link ? { rel: "noreferrer" } : {})}
                className="text-ink-soft underline-offset-4 transition-colors hover:text-brick hover:underline"
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-8 border-t border-rule/70 pt-4 text-xs text-ink-soft">
          © 2026 little moments
        </p>
      </div>
    </footer>
  );
}
