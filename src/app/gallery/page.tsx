import { GalleryGrid } from "@/components/gallery/gallery-grid";
import { SiteFooter } from "@/components/site/site-footer";
import { SiteHeader } from "@/components/site/site-header";

export default function GalleryPage() {
  return (
    <>
      <SiteHeader />
      <GalleryGrid />
      <SiteFooter />
    </>
  );
}
