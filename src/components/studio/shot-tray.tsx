import { Button } from "@/components/ui/button";
import { cn } from "@/lib/cn";
import { firstEmptyVisibleSlot } from "@/hooks/use-auto-session";
import type { Photo } from "@/lib/types";
import Image from "next/image";

interface ShotTrayProps {
  photos: Photo[];
  slotCount: number;
  activeIndex: number | null;
  isDisabled: boolean;
  onRetake: (index: number) => void;
}

export const ShotTray = ({
  photos,
  slotCount,
  activeIndex,
  isDisabled,
  onRetake,
}: ShotTrayProps) => {
  const nextIndex = activeIndex ?? firstEmptyVisibleSlot(photos, slotCount);
  const shotNumber = nextIndex < 0 ? slotCount : nextIndex + 1;

  return (
    <section aria-label="Shot tray" className="mt-5">
      <div className="mb-3 flex items-center justify-between gap-4">
        <p
          role="status"
          aria-live="polite"
          aria-atomic="true"
          className="text-sm font-semibold text-ink"
        >
          Shot {shotNumber} of {slotCount}
        </p>
        <div className="flex items-center gap-1.5" aria-hidden="true">
          {Array.from({ length: slotCount }, (_, index) => (
            <span
              key={`progress-${index}`}
              className={cn(
                "size-2.5 rounded-full border",
                photos[index]
                  ? "border-brick bg-brick"
                  : index === nextIndex
                    ? "border-brick bg-cream ring-2 ring-brick/20"
                    : "border-rule bg-paper-deep",
              )}
            />
          ))}
        </div>
      </div>
      <ol className="grid snap-x snap-mandatory auto-cols-[minmax(5.25rem,1fr)] grid-flow-col gap-2 overflow-x-auto pb-2 lg:auto-cols-auto lg:grid-flow-row lg:grid-cols-6 lg:overflow-visible">
        {Array.from({ length: slotCount }, (_, index) => {
          const photo = photos[index];
          return (
            <li
              key={photo?.id ?? `empty-${index}`}
              className="min-w-0 snap-start"
            >
              {photo ? (
                <>
                  <div className="aspect-[4/5] overflow-hidden rounded-control border border-rule bg-paper-deep">
                    <Image
                      src={photo.dataUrl}
                      alt={`Photo ${index + 1}`}
                      width={1080}
                      height={1350}
                      unoptimized
                      className="size-full object-cover"
                    />
                  </div>
                  <Button
                    variant="quiet"
                    size="sm"
                    disabled={isDisabled}
                    onClick={() => onRetake(index)}
                    className="mt-1 w-full px-1 text-xs"
                  >
                    Retake {index + 1}
                  </Button>
                </>
              ) : (
                <div className="grid aspect-[4/5] place-items-center rounded-control border border-dashed border-rule bg-paper-deep/50 text-center text-xs font-semibold text-ink-soft">
                  Frame {index + 1}
                </div>
              )}
            </li>
          );
        })}
      </ol>
    </section>
  );
};
