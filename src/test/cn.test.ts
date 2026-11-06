import { describe, expect, it } from "vitest";

import { cn } from "../lib/cn";

describe("cn", () => {
  it("merges class names", () => {
    expect(cn("flex", "items-center")).toBe("flex items-center");
  });

  it("resolves conflicting tailwind utilities to the last value", () => {
    expect(cn("px-2 py-1", "px-4")).toBe("py-1 px-4");
  });

  it("drops false, null, and undefined values", () => {
    expect(cn("block", false, null, undefined, "text-ink")).toBe(
      "block text-ink",
    );
  });

  it("supports conditional objects and arrays", () => {
    expect(cn(["rounded", { hidden: false, block: true }], "gap-2")).toBe(
      "rounded block gap-2",
    );
  });

  it("keeps non-tailwind classes that do not conflict", () => {
    expect(cn("custom-class", "text-ink", "bg-paper")).toBe(
      "custom-class text-ink bg-paper",
    );
  });
});
