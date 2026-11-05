import { describe, expect, it } from "vitest";

import {
  effectiveTitle,
  filenameForStrip,
  formatDateLabel,
  parseLocalISO,
  slugify,
  toLocalISO,
  uid,
} from "../lib/utils";

describe("slugify", () => {
  it("strips accents and normalizes separators", () => {
    expect(slugify("Café déjà vu!")).toBe("cafe-deja-vu");
    expect(slugify("Hello, World")).toBe("hello-world");
    expect(slugify("--A  B--")).toBe("a-b");
  });

  it("falls back to strip for empty output", () => {
    expect(slugify("")).toBe("strip");
    expect(slugify("   ")).toBe("strip");
    expect(slugify("!!!")).toBe("strip");
  });

  it("caps the slug at 40 characters without a trailing hyphen", () => {
    const slug = slugify("a".repeat(20) + " " + "b".repeat(30));
    expect(slug.length).toBeLessThanOrEqual(40);
    expect(slug.endsWith("-")).toBe(false);
  });
});

describe("local dates", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(toLocalISO(new Date(2026, 10, 5))).toBe("2026-11-05");
  });

  it("round-trips a valid ISO date", () => {
    const parsed = parseLocalISO("2026-11-05");
    expect(parsed).not.toBeNull();
    expect(toLocalISO(parsed as Date)).toBe("2026-11-05");
  });

  it("rejects impossible or malformed dates", () => {
    expect(parseLocalISO("2026-02-31")).toBeNull();
    expect(parseLocalISO("2026-13-01")).toBeNull();
    expect(parseLocalISO("11/05/2026")).toBeNull();
    expect(parseLocalISO("")).toBeNull();
  });

  it("formats the display label in uppercase en-GB style", () => {
    expect(formatDateLabel("2026-11-05")).toBe("5 NOV 2026");
  });
});

describe("titles and filenames", () => {
  it("falls back to the default title", () => {
    expect(effectiveTitle("")).toBe("little moments");
    expect(effectiveTitle("  ")).toBe("little moments");
    expect(effectiveTitle("a slow afternoon")).toBe("a slow afternoon");
  });

  it("builds a slugged filename with date and extension", () => {
    expect(filenameForStrip("Café & Cream", "2026-11-05")).toBe(
      "little-moments-cafe-cream-2026-11-05.png",
    );
    expect(filenameForStrip("", "2026-11-05", "jpg")).toBe(
      "little-moments-strip-2026-11-05.jpg",
    );
  });
});

describe("uid", () => {
  it("returns unique ids", () => {
    const ids = new Set(Array.from({ length: 500 }, () => uid()));
    expect(ids.size).toBe(500);
  });
});
