import { useId, type ReactNode } from "react";

import { cn } from "@/lib/cn";

export type SampleSceneId = "window" | "cat" | "mugs" | "camera";

interface SampleSceneProps {
  scene: SampleSceneId;
  className?: string;
}

const backgrounds: Record<SampleSceneId, string> = {
  window: "var(--color-paper)",
  cat: "var(--color-cream)",
  mugs: "var(--color-paper-deep)",
  camera: "var(--color-paper)",
};

export const SampleScene = ({ scene, className }: SampleSceneProps) => {
  const patternId = `grain-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  let artwork: ReactNode;

  switch (scene) {
    case "window":
      artwork = (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M16 30h104v78H16z"
            fill="var(--color-paper-deep)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <path
            d="M24 38h88v62H24z"
            fill="var(--color-cream)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <path
            d="M68 39v60M25 69h86"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <path
            d="m30 100 34-30 34 0 47 72-75 20z"
            fill="var(--color-blush)"
            opacity=".6"
          />
          <path d="M9 145h142v48H9z" fill={`url(#${patternId})`} opacity=".4" />
          <path
            d="M119 166v-52m0 18-17-18m17 31 18-22m-18 34-16-16"
            fill="none"
            stroke="var(--color-sage)"
            strokeWidth="3"
          />
          <path
            d="M96 153h47l-5 32h-37z"
            fill="var(--color-brick)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <path
            d="M119 131c-13-2-17-12-17-18 12 1 18 8 17 18Zm2-3c1-14 8-20 18-22 0 11-6 18-18 22Zm-2 17c-12 0-18-6-20-14 11-1 18 3 20 14Z"
            fill="var(--color-sage)"
            stroke="var(--color-ink)"
            strokeWidth="1.5"
          />
        </g>
      );
      break;
    case "cat":
      artwork = (
        <g strokeLinecap="round" strokeLinejoin="round">
          <circle cx="124" cy="50" r="25" fill="var(--color-gold)" />
          <ellipse cx="78" cy="144" rx="68" ry="35" fill="var(--color-blush)" />
          <ellipse
            cx="77"
            cy="150"
            rx="50"
            ry="22"
            fill={`url(#${patternId})`}
            opacity=".45"
          />
          <path
            d="M49 139c-13-5-18-18-11-30 5-9 16-14 29-12 7-15 24-22 42-15 18 7 27 27 19 43-5 12-17 18-32 18H72c-8 0-16-1-23-4Z"
            fill="var(--color-ink)"
          />
          <path
            d="m62 101 2-23 19 16m24-2 17-16 1 29"
            fill="var(--color-ink)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <path
            d="M53 137c15 11 32 7 37-4 4-9-2-19-14-20 16-1 28 8 29 20 2 13-13 21-30 16"
            fill="none"
            stroke="var(--color-paper)"
            strokeWidth="2"
          />
          <path
            d="M12 180v-39m0 18 13-13m-13 24-10-12m10-1 14 3"
            fill="none"
            stroke="var(--color-sage)"
            strokeWidth="2"
          />
          <ellipse cx="10" cy="142" rx="6" ry="11" fill="var(--color-sage)" />
          <ellipse cx="25" cy="159" rx="6" ry="11" fill="var(--color-sage)" />
        </g>
      );
      break;
    case "mugs":
      artwork = (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M8 32h144v136H8z"
            fill="var(--color-paper)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <ellipse
            cx="80"
            cy="169"
            rx="70"
            ry="18"
            fill={`url(#${patternId})`}
            opacity=".45"
          />
          <path
            d="M19 73c18-12 34-12 50 0v65c-17-12-34-12-50 0zm50 0c17-12 34-12 51 0v65c-17-12-34-12-51 0z"
            fill="var(--color-cream)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <path
            d="M27 88h31m-31 9h31m-31 9h31m18-18h35m-35 9h35m-35 9h35"
            stroke="var(--color-ink-soft)"
            strokeWidth="1.5"
          />
          <circle cx="35" cy="47" r="18" fill="var(--color-gold)" />
          <path
            d="M27 40h16v14H27z"
            fill="var(--color-brick)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <path
            d="M43 43h4v7h-4"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <circle cx="121" cy="45" r="19" fill="var(--color-cream)" />
          <circle cx="121" cy="45" r="13" fill="var(--color-sage)" />
          <path
            d="M115 40h12v11h-12z"
            fill="var(--color-ink-soft)"
            stroke="var(--color-ink)"
            strokeWidth="1.5"
          />
          <path
            d="M112 39c-8 0-8 13 0 13m18-13c8 0 8 13 0 13"
            fill="none"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <path
            d="M74 150h15m-7-8v15"
            stroke="var(--color-brick)"
            strokeWidth="2"
          />
          <ellipse
            cx="126"
            cy="151"
            rx="20"
            ry="14"
            fill="var(--color-gold)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <path
            d="M118 145c0-3 2-5 5-5h6c3 0 5 2 5 5v12h-16z"
            fill="var(--color-paper-deep)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <path d="M121 146h10" stroke="var(--color-brick)" strokeWidth="2" />
        </g>
      );
      break;
    case "camera":
      artwork = (
        <g strokeLinecap="round" strokeLinejoin="round">
          <path
            d="M30 87c-14-19-7-40 6-50m88 0c13 12 19 32 7 50"
            fill="none"
            stroke="var(--color-brick)"
            strokeWidth="3"
          />
          <ellipse
            cx="81"
            cy="159"
            rx="59"
            ry="16"
            fill={`url(#${patternId})`}
            opacity=".45"
          />
          <path
            d="M31 83h100a9 9 0 0 1 9 9v47H22V92a9 9 0 0 1 9-9Z"
            fill="var(--color-cream)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <path
            d="M47 72h26l8 11H39z"
            fill="var(--color-ink)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <rect
            x="104"
            y="95"
            width="22"
            height="16"
            rx="2"
            fill="var(--color-gold)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <circle
            cx="76"
            cy="112"
            r="27"
            fill="var(--color-ink)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <circle
            cx="76"
            cy="112"
            r="17"
            fill="var(--color-midnight)"
            stroke="var(--color-paper-deep)"
            strokeWidth="2"
          />
          <circle cx="76" cy="112" r="7" fill="var(--color-sage)" />
          <path
            d="M27 141h108v13H27z"
            fill="var(--color-paper-deep)"
            stroke="var(--color-ink)"
            strokeWidth="2"
          />
          <path
            d="M128 160v-34m0 15-14-12m14 21 14-16m-14 5 12 2"
            fill="none"
            stroke="var(--color-sage)"
            strokeWidth="2"
          />
          <ellipse cx="114" cy="141" rx="7" ry="12" fill="var(--color-sage)" />
          <ellipse cx="143" cy="145" rx="7" ry="12" fill="var(--color-sage)" />
        </g>
      );
  }

  return (
    <svg
      aria-hidden="true"
      className={cn("block h-full w-full", className)}
      viewBox="0 0 160 200"
      focusable="false"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <pattern
          id={patternId}
          width="8"
          height="8"
          patternUnits="userSpaceOnUse"
        >
          <circle cx="2" cy="2" r="1.3" fill="var(--color-ink)" />
          <circle cx="6" cy="6" r="1.3" fill="var(--color-ink)" />
        </pattern>
      </defs>
      <rect width="160" height="200" fill={backgrounds[scene]} />
      {artwork}
    </svg>
  );
};
