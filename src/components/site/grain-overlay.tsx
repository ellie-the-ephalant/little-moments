const grainSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="160" height="160"><filter id="n"><feTurbulence type="fractalNoise" baseFrequency="0.82" numOctaves="3" stitchTiles="stitch"/></filter><rect width="100%" height="100%" filter="url(#n)"/></svg>`;

const grainImage = `url("data:image/svg+xml,${encodeURIComponent(grainSvg)}")`;

export function GrainOverlay() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-50 opacity-[0.035] mix-blend-multiply"
      style={{ backgroundImage: grainImage }}
    />
  );
}
