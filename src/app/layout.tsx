import type { Metadata } from "next";

import "@fontsource-variable/fraunces/wght.css";
import "@fontsource-variable/fraunces/wght-italic.css";
import "@fontsource-variable/manrope/wght.css";
import "./globals.css";

import { GrainOverlay } from "@/components/site/grain-overlay";
import { ToastRegion } from "@/components/ui/toast-region";

export const metadata: Metadata = {
  title: {
    default: "little moments",
    template: "%s · little moments",
  },
  description:
    "A tiny, local-first photobooth that turns a few photos into a designed strip. No account, no uploads, no cloud.",
  referrer: "strict-origin-when-cross-origin",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-dvh bg-paper font-body text-ink antialiased">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[80] focus:rounded-control focus:bg-ink focus:px-4 focus:py-3 focus:text-sm focus:font-semibold focus:text-cream focus:outline-cream"
        >
          Skip to content
        </a>
        <div aria-hidden="true" className="sr-only">
          <span
            style={{
              fontFamily:
                '"Fraunces Variable", Georgia, "Times New Roman", serif',
              fontWeight: 600,
            }}
          >
            Aa
          </span>
          <span
            style={{
              fontFamily:
                '"Fraunces Variable", Georgia, "Times New Roman", serif',
              fontWeight: 600,
              fontStyle: "italic",
            }}
          >
            Aa
          </span>
          <span
            style={{
              fontFamily:
                '"Manrope Variable", ui-sans-serif, system-ui, sans-serif',
              fontWeight: 600,
            }}
          >
            Aa
          </span>
        </div>
        <GrainOverlay />
        {children}
        <ToastRegion />
      </body>
    </html>
  );
}
