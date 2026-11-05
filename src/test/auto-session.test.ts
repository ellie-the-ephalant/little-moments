import { describe, expect, it } from "vitest";

import { firstEmptyVisibleSlot } from "../hooks/use-auto-session";
import type { Photo } from "../lib/types";

const photo = (id: string): Photo => ({
  id,
  dataUrl: "data:image/jpeg;base64,AA==",
  width: 1080,
  height: 1350,
  source: "camera",
  createdAt: 1,
});

describe("firstEmptyVisibleSlot", () => {
  it("returns the first empty visible index", () => {
    expect(firstEmptyVisibleSlot([photo("a"), undefined, photo("c")], 4)).toBe(
      1,
    );
  });

  it("ignores hidden photos and returns -1 when visible slots are full", () => {
    expect(firstEmptyVisibleSlot([photo("a"), photo("b"), photo("c")], 2)).toBe(
      -1,
    );
  });
});
