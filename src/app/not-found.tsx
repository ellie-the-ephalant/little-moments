import { ArrowLeft } from "lucide-react";
import Link from "next/link";

import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";
import { buttonStyles } from "@/components/ui/button";

export default function NotFound() {
  return (
    <>
      <SiteHeader />
      <main
        id="main"
        className="site-container flex min-h-[62svh] flex-col justify-center py-16"
      >
        <h1 className="type-h2 max-w-[16ch]">This moment isn&apos;t here.</h1>
        <Link
          href="/"
          className={buttonStyles({ className: "mt-7 w-fit gap-2" })}
        >
          <ArrowLeft aria-hidden="true" />
          Back to the beginning
        </Link>
      </main>
      <SiteFooter />
    </>
  );
}
