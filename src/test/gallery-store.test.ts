import { describe, expect, it } from "vitest";

import { getOldestKeys, isQuotaExceededError } from "../lib/gallery-store";

describe("getOldestKeys", () => {
  it("drops corrupt entries before the oldest valid strips", () => {
    expect(
      getOldestKeys(
        [
          { key: "strip:new", createdAt: 30 },
          { key: "strip:broken", createdAt: null },
          { key: "strip:old", createdAt: 10 },
          { key: "strip:middle", createdAt: 20 },
        ],
        2,
      ),
    ).toEqual(["strip:broken", "strip:old"]);
  });

  it("returns no keys when nothing needs pruning", () => {
    expect(getOldestKeys([{ key: "strip:one", createdAt: 1 }], 0)).toEqual([]);
  });
});

describe("isQuotaExceededError", () => {
  it("recognizes quota errors by name and rejects unrelated storage errors", () => {
    expect(isQuotaExceededError({ name: "QuotaExceededError" })).toBe(true);
    expect(
      isQuotaExceededError(new DOMException("full", "QuotaExceededError")),
    ).toBe(true);
    expect(isQuotaExceededError({ name: "SecurityError" })).toBe(false);
    expect(isQuotaExceededError(null)).toBe(false);
  });
});
