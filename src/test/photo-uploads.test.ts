import { describe, expect, it } from "vitest";

import { getUploadDestination } from "../hooks/use-photo-uploads";

describe("getUploadDestination", () => {
  it.each([
    ["setup", 0, 2, 4, "booth"],
    ["setup", 2, 2, 4, "finish"],
    ["booth", 2, 1, 4, null],
    ["booth", 3, 1, 4, "finish"],
    ["setup", 1, 0, 4, null],
  ] as const)(
    "moves from %s with %s existing and %s added into %s slots to %s",
    (step, currentCount, addedCount, slotCount, destination) => {
      expect(
        getUploadDestination(step, currentCount, addedCount, slotCount),
      ).toBe(destination);
    },
  );
});
