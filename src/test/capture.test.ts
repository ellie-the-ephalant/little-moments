import { describe, expect, it } from "vitest";

import { MAX_UPLOAD_BYTES } from "../lib/constants";
import { validateUploadFile } from "../lib/capture";

describe("validateUploadFile", () => {
  it("rejects files larger than 25 MB", () => {
    expect(
      validateUploadFile({ size: MAX_UPLOAD_BYTES + 1, type: "image/jpeg" }),
    ).toBe("too-large");
    expect(
      validateUploadFile({ size: MAX_UPLOAD_BYTES, type: "image/jpeg" }),
    ).toBeNull();
  });

  it("accepts image MIME types and rejects other files", () => {
    expect(validateUploadFile({ size: 1, type: "image/png" })).toBeNull();
    expect(validateUploadFile({ size: 1, type: "text/plain" })).toBe(
      "not-image",
    );
  });
});
