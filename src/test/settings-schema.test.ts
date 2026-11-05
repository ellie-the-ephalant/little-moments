import { describe, expect, it } from "vitest";

import { settingsSchema } from "../lib/settings-schema";

describe("settingsSchema", () => {
  it("fills the documented defaults", () => {
    expect(settingsSchema.parse({})).toEqual({
      layoutId: "classic",
      themeId: "classic",
      filterId: "natural",
      countdownSeconds: 3,
      mirror: true,
      flash: false,
    });
  });

  it("accepts every valid option", () => {
    const parsed = settingsSchema.parse({
      layoutId: "six",
      themeId: "midnight",
      filterId: "vivid",
      countdownSeconds: 10,
      mirror: false,
      flash: true,
    });
    expect(parsed).toEqual({
      layoutId: "six",
      themeId: "midnight",
      filterId: "vivid",
      countdownSeconds: 10,
      mirror: false,
      flash: true,
    });
  });

  it("rejects unknown enum values", () => {
    expect(settingsSchema.safeParse({ layoutId: "poster" }).success).toBe(
      false,
    );
    expect(settingsSchema.safeParse({ themeId: "neon" }).success).toBe(false);
    expect(settingsSchema.safeParse({ filterId: "sepia" }).success).toBe(false);
  });

  it("accepts only the four countdown values", () => {
    for (const value of [0, 3, 5, 10]) {
      expect(
        settingsSchema.safeParse({ countdownSeconds: value }).success,
      ).toBe(true);
    }
    expect(settingsSchema.safeParse({ countdownSeconds: 4 }).success).toBe(
      false,
    );
  });

  it("rejects non-boolean switches", () => {
    expect(settingsSchema.safeParse({ mirror: "true" }).success).toBe(false);
    expect(settingsSchema.safeParse({ flash: 1 }).success).toBe(false);
  });

  it("strips unknown keys", () => {
    const parsed = settingsSchema.parse({ themeId: "mono", accent: "#ff0000" });
    expect(parsed).not.toHaveProperty("accent");
  });

  it("defaults each missing field independently", () => {
    expect(settingsSchema.parse({ themeId: "blush" })).toMatchObject({
      layoutId: "classic",
      themeId: "blush",
      filterId: "natural",
      countdownSeconds: 3,
      mirror: true,
      flash: false,
    });
  });
});
