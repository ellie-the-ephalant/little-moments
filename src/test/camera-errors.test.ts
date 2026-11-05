import { describe, expect, it } from "vitest";

import { getCameraErrorCode } from "../hooks/use-camera";

describe("getCameraErrorCode", () => {
  it.each([
    ["NotAllowedError", "denied"],
    ["NotFoundError", "missing"],
    ["NotReadableError", "busy"],
    ["OverconstrainedError", "overconstrained"],
    ["SecurityError", "insecure"],
    ["OtherError", "generic"],
  ] as const)("maps %s to %s", (name, code) => {
    expect(getCameraErrorCode({ name })).toBe(code);
  });
});
