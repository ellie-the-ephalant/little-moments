"use client";

import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { Button, buttonStyles } from "@/components/ui/button";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ reset }: ErrorPageProps) {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="site-container flex min-h-[62svh] flex-col justify-center py-16"
      >
        <h1 className="type-h2 max-w-[18ch]">Something jammed in the booth.</h1>
        <div className="mt-7 flex flex-wrap items-center gap-6">
          <Button onClick={reset}>Reload</Button>
          <Link href="/" className={buttonStyles({ variant: "secondary" })}>
            Back home
          </Link>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
