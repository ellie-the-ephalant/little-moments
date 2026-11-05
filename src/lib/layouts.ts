import { LAYOUT_IDS } from "./constants";
import type { LayoutId } from "./types";

export type Layout = {
  id: LayoutId;
  label: string;
  shortLabel: string;
  cols: number;
  rows: number;
  photoWidth: number;
  photoHeight: number;
  gap: number;
  pad: number;
  header: number;
  headerGap: number;
  footerGap: number;
  footer: number;
  titleSize: number;
};

export const layouts = {
  classic: {
    id: "classic",
    label: "Classic strip",
    shortLabel: "Classic",
    cols: 1,
    rows: 4,
    photoWidth: 712,
    photoHeight: 890,
    gap: 16,
    pad: 44,
    header: 116,
    headerGap: 16,
    footerGap: 20,
    footer: 88,
    titleSize: 38,
  },
  duo: {
    id: "duo",
    label: "Duo strip",
    shortLabel: "Duo",
    cols: 1,
    rows: 2,
    photoWidth: 712,
    photoHeight: 890,
    gap: 16,
    pad: 44,
    header: 116,
    headerGap: 16,
    footerGap: 20,
    footer: 88,
    titleSize: 38,
  },
  grid: {
    id: "grid",
    label: "2×2 grid",
    shortLabel: "Grid",
    cols: 2,
    rows: 2,
    photoWidth: 352,
    photoHeight: 440,
    gap: 16,
    pad: 40,
    header: 96,
    headerGap: 14,
    footerGap: 16,
    footer: 76,
    titleSize: 32,
  },
  six: {
    id: "six",
    label: "Six-cut",
    shortLabel: "Six",
    cols: 2,
    rows: 3,
    photoWidth: 348,
    photoHeight: 435,
    gap: 16,
    pad: 44,
    header: 104,
    headerGap: 14,
    footerGap: 18,
    footer: 80,
    titleSize: 34,
  },
  single: {
    id: "single",
    label: "Single frame",
    shortLabel: "Single",
    cols: 1,
    rows: 1,
    photoWidth: 712,
    photoHeight: 890,
    gap: 0,
    pad: 44,
    header: 132,
    headerGap: 18,
    footerGap: 22,
    footer: 88,
    titleSize: 42,
  },
} satisfies Record<LayoutId, Layout>;

export const layoutOrder = LAYOUT_IDS;
