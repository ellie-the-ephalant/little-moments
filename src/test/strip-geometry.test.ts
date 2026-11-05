import { describe, expect, it } from "vitest";

import { layoutOrder, layouts } from "../lib/layouts";
import { getStripGeometry } from "../lib/strip-geometry";

const expected = {
  classic: {
    height: 3936,
    size2x: [1600, 7872],
    slotCount: 4,
    first: { x: 44, y: 176 },
    second: { x: 44, y: 1082 },
    photo: { width: 712, height: 890 },
  },
  duo: {
    height: 2124,
    size2x: [1600, 4248],
    slotCount: 2,
    first: { x: 44, y: 176 },
    second: { x: 44, y: 1082 },
    photo: { width: 712, height: 890 },
  },
  grid: {
    height: 1178,
    size2x: [1600, 2356],
    slotCount: 4,
    first: { x: 40, y: 150 },
    second: { x: 408, y: 150 },
    photo: { width: 352, height: 440 },
    third: { x: 40, y: 606 },
  },
  six: {
    height: 1641,
    size2x: [1600, 3282],
    slotCount: 6,
    first: { x: 44, y: 162 },
    second: { x: 408, y: 162 },
    photo: { width: 348, height: 435 },
    third: { x: 44, y: 613 },
  },
  single: {
    height: 1238,
    size2x: [1600, 2476],
    slotCount: 1,
    first: { x: 44, y: 194 },
    photo: { width: 712, height: 890 },
  },
} as const;

function overlaps(
  a: { x: number; y: number; width: number; height: number },
  b: { x: number; y: number; width: number; height: number },
) {
  return (
    a.x < b.x + b.width &&
    b.x < a.x + a.width &&
    a.y < b.y + b.height &&
    b.y < a.y + a.height
  );
}

describe("strip geometry", () => {
  it("exposes every layout in the documented order", () => {
    expect(layoutOrder).toEqual(["classic", "duo", "grid", "six", "single"]);
    expect(Object.keys(layouts)).toHaveLength(5);
  });

  it("uses an 800px base width", () => {
    for (const id of layoutOrder) {
      expect(getStripGeometry(id).width).toBe(800);
    }
  });

  it("matches the exact 1x and 2x dimensions", () => {
    for (const id of layoutOrder) {
      const geometry = getStripGeometry(id);
      expect(geometry.height).toBe(expected[id].height);
      expect([geometry.width * 2, geometry.height * 2]).toEqual(
        expected[id].size2x,
      );
    }
  });

  it("has the exact slot counts, sizes, and positions", () => {
    for (const id of layoutOrder) {
      const geometry = getStripGeometry(id);
      const values = expected[id];
      expect(geometry.slotCount).toBe(values.slotCount);
      expect(geometry.slots).toHaveLength(values.slotCount);
      expect(geometry.photoWidth).toBe(values.photo.width);
      expect(geometry.photoHeight).toBe(values.photo.height);
      expect(geometry.slots[0]).toMatchObject({
        ...values.first,
        ...values.photo,
      });
      if ("second" in values) {
        expect(geometry.slots[1]).toMatchObject({
          ...values.second,
          ...values.photo,
        });
      }
      if ("third" in values) {
        expect(geometry.slots[2]).toMatchObject({
          ...values.third,
          ...values.photo,
        });
      }
    }
  });

  it("keeps every slot inside the canvas", () => {
    for (const id of layoutOrder) {
      const geometry = getStripGeometry(id);
      for (const slot of geometry.slots) {
        expect(slot.x).toBeGreaterThanOrEqual(0);
        expect(slot.y).toBeGreaterThanOrEqual(0);
        expect(slot.x + slot.width).toBeLessThanOrEqual(geometry.width);
        expect(slot.y + slot.height).toBeLessThanOrEqual(geometry.height);
      }
    }
  });

  it("never overlaps slots", () => {
    for (const id of layoutOrder) {
      const { slots } = getStripGeometry(id);
      for (let i = 0; i < slots.length; i += 1) {
        for (let j = i + 1; j < slots.length; j += 1) {
          expect(overlaps(slots[i], slots[j])).toBe(false);
        }
      }
    }
  });

  it("keeps every photo at exactly 4:5", () => {
    for (const id of layoutOrder) {
      const geometry = getStripGeometry(id);
      for (const slot of geometry.slots) {
        expect(slot.width * 5).toBe(slot.height * 4);
      }
    }
  });

  it("keeps the header, footer, and text rects inside the canvas", () => {
    for (const id of layoutOrder) {
      const geometry = getStripGeometry(id);
      for (const rect of [geometry.header, geometry.footer]) {
        expect(rect.x).toBeGreaterThanOrEqual(0);
        expect(rect.y).toBeGreaterThanOrEqual(0);
        expect(rect.x + rect.width).toBeLessThanOrEqual(geometry.width);
        expect(rect.y + rect.height).toBeLessThanOrEqual(geometry.height);
      }
      for (const rect of [geometry.title, geometry.date]) {
        expect(rect.x).toBeGreaterThanOrEqual(geometry.header.x);
        expect(rect.y).toBeGreaterThanOrEqual(geometry.header.y);
        expect(rect.x + rect.width).toBeLessThanOrEqual(
          geometry.header.x + geometry.header.width,
        );
        expect(rect.y + rect.height).toBeLessThanOrEqual(
          geometry.header.y + geometry.header.height,
        );
      }
      expect(geometry.footerText.x).toBeGreaterThanOrEqual(geometry.footer.x);
      expect(geometry.footerText.y).toBeGreaterThanOrEqual(geometry.footer.y);
      expect(
        geometry.footerText.x + geometry.footerText.width,
      ).toBeLessThanOrEqual(geometry.footer.x + geometry.footer.width);
      expect(
        geometry.footerText.y + geometry.footerText.height,
      ).toBeLessThanOrEqual(geometry.footer.y + geometry.footer.height);
    }
  });

  it("keeps slots between the header and footer", () => {
    for (const id of layoutOrder) {
      const geometry = getStripGeometry(id);
      for (const slot of geometry.slots) {
        expect(slot.y).toBeGreaterThanOrEqual(
          geometry.header.y + geometry.header.height,
        );
        expect(slot.y + slot.height).toBeLessThanOrEqual(geometry.footer.y);
      }
    }
  });
});
