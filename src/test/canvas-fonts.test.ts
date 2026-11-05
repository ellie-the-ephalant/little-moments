import { describe, expect, it } from "vitest";

import { ensureFonts } from "../lib/canvas-fonts";

describe("ensureFonts", () => {
  it("returns false when the document font API is unavailable", async () => {
    expect(await ensureFonts()).toBe(false);
  });
});
