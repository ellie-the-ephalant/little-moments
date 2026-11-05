interface CountdownOverlayProps {
  value: number | "Smile";
}

export const CountdownOverlay = ({ value }: CountdownOverlayProps) => (
  <div className="absolute inset-0 z-10 grid place-items-center bg-ink/20">
    <span
      key={value}
      aria-hidden="true"
      className="animate-countdown-pop font-display text-[clamp(5rem,18vw,10rem)] leading-none font-semibold text-cream drop-shadow-[0_3px_16px_rgb(33_26_22_/_0.3)]"
    >
      {value}
    </span>
    <span
      className="sr-only"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {value}
    </span>
  </div>
);
