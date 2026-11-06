import { THEME_IDS } from "./constants";
import type { ThemeId } from "./types";

export type ThemeMotif =
  "double-rule" | "heart" | "keyline" | "sprocket" | "sprig" | "stars";

export type ThemeTitle = {
  family: "fraunces" | "manrope";
  weight: number;
  italic?: boolean;
  uppercase?: boolean;
};

export type Theme = {
  id: ThemeId;
  label: string;
  bg: string;
  paper: string;
  ink: string;
  muted: string;
  accent: string;
  border: string;
  radius: number;
  motif: ThemeMotif;
  title: ThemeTitle;
};

export const themes = {
  classic: {
    id: "classic",
    label: "Classic",
    bg: "#F6EFE3",
    paper: "#FFFDF8",
    ink: "#211A16",
    muted: "#6E6154",
    accent: "#A33B2B",
    border: "#CDBDA6",
    radius: 2,
    motif: "double-rule",
    title: { family: "fraunces", weight: 600 },
  },
  blush: {
    id: "blush",
    label: "Blush",
    bg: "#F2DCD5",
    paper: "#FBF0EC",
    ink: "#3A2320",
    muted: "#6E4B44",
    accent: "#9A3628",
    border: "#D8B4A8",
    radius: 14,
    motif: "heart",
    title: { family: "fraunces", weight: 600, italic: true },
  },
  mono: {
    id: "mono",
    label: "Mono",
    bg: "#171412",
    paper: "#1F1B18",
    ink: "#FFF8EC",
    muted: "#C9BBAA",
    accent: "#F0D9A8",
    border: "#3B332C",
    radius: 0,
    motif: "keyline",
    title: { family: "manrope", weight: 800, uppercase: true },
  },
  film: {
    id: "film",
    label: "Film",
    bg: "#EFE3CC",
    paper: "#F7EDDA",
    ink: "#2A211A",
    muted: "#635444",
    accent: "#7E5220",
    border: "#C9B18E",
    radius: 4,
    motif: "sprocket",
    title: { family: "fraunces", weight: 600 },
  },
  sage: {
    id: "sage",
    label: "Sage",
    bg: "#E3E7D8",
    paper: "#EEF1E5",
    ink: "#2A3024",
    muted: "#545D49",
    accent: "#536145",
    border: "#B9C4A9",
    radius: 6,
    motif: "sprig",
    title: { family: "fraunces", weight: 500 },
  },
  midnight: {
    id: "midnight",
    label: "Midnight",
    bg: "#151A2E",
    paper: "#1B2138",
    ink: "#F7EEDC",
    muted: "#A9A891",
    accent: "#D6AE63",
    border: "#36405E",
    radius: 10,
    motif: "stars",
    title: { family: "fraunces", weight: 400, uppercase: true },
  },
} satisfies Record<ThemeId, Theme>;

export const themeOrder = THEME_IDS;
