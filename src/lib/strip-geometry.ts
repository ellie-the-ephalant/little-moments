import { layoutOrder, layouts, type Layout } from "./layouts";
import { STRIP_WIDTH } from "./constants";
import type { LayoutId, Rect } from "./types";

export type StripGeometry = {
  width: number;
  height: number;
  photoWidth: number;
  photoHeight: number;
  slotCount: number;
  slots: Rect[];
  header: Rect;
  footer: Rect;
  title: Rect;
  date: Rect;
  footerText: Rect;
};

function buildGeometry(layout: Layout): StripGeometry {
  const width = STRIP_WIDTH;
  const rowsHeight =
    layout.rows * layout.photoHeight +
    Math.max(0, layout.rows - 1) * layout.gap;
  const height =
    layout.pad +
    layout.header +
    layout.headerGap +
    rowsHeight +
    layout.footerGap +
    layout.footer +
    layout.pad;

  const slots: Rect[] = [];
  const startX = layout.pad;
  const startY = layout.pad + layout.header + layout.headerGap;
  for (let row = 0; row < layout.rows; row += 1) {
    for (let col = 0; col < layout.cols; col += 1) {
      slots.push({
        x: startX + col * (layout.photoWidth + layout.gap),
        y: startY + row * (layout.photoHeight + layout.gap),
        width: layout.photoWidth,
        height: layout.photoHeight,
      });
    }
  }

  const header: Rect = {
    x: layout.pad,
    y: layout.pad,
    width: width - layout.pad * 2,
    height: layout.header,
  };
  const footer: Rect = {
    x: layout.pad,
    y: height - layout.pad - layout.footer,
    width: width - layout.pad * 2,
    height: layout.footer,
  };
  const title: Rect = {
    x: header.x + 20,
    y: header.y + 12,
    width: header.width - 190,
    height: header.height - 24,
  };
  const date: Rect = {
    x: header.x + header.width - 170,
    y: header.y + header.height - 26,
    width: 150,
    height: 14,
  };
  const footerText: Rect = {
    x: footer.x,
    y: footer.y + (footer.height - 14) / 2,
    width: footer.width,
    height: 14,
  };

  return {
    width,
    height,
    photoWidth: layout.photoWidth,
    photoHeight: layout.photoHeight,
    slotCount: slots.length,
    slots,
    header,
    footer,
    title,
    date,
    footerText,
  };
}

export const stripGeometries = Object.fromEntries(
  layoutOrder.map((id) => [id, buildGeometry(layouts[id])]),
) as Record<LayoutId, StripGeometry>;

export function getStripGeometry(layoutId: LayoutId): StripGeometry {
  return stripGeometries[layoutId];
}
