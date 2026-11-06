"use client";

import { Pause, Play } from "lucide-react";
import { useState, type ReactNode } from "react";

import { Button } from "@/components/ui/button";
import { useReducedMotion } from "@/hooks/use-reduced-motion";
import { cn } from "@/lib/cn";

interface HeroArtworkProps {
  children: ReactNode;
}

export const HeroArtwork = ({ children }: HeroArtworkProps) => {
  const [isPaused, setIsPaused] = useState(false);
  const isReducedMotion = useReducedMotion();

  return (
    <div
      className={cn(
        "flex w-full flex-col items-center md:items-end",
        isPaused && "sample-motion-paused",
      )}
    >
      {children}
      {!isReducedMotion ? (
        <Button
          variant="quiet"
          size="sm"
          className="sample-motion-control mt-2"
          aria-pressed={isPaused}
          onClick={() => setIsPaused((paused) => !paused)}
        >
          {isPaused ? (
            <Play aria-hidden="true" />
          ) : (
            <Pause aria-hidden="true" />
          )}
          {isPaused ? "Resume motion" : "Pause motion"}
        </Button>
      ) : null}
    </div>
  );
};
