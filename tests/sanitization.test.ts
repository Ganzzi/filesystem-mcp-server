import { describe, expect, it } from "vitest";

import { sanitization } from "../src/utils/security/sanitization.js";

describe("sanitizePath", () => {
  it("rejects traversal outside the configured root", () => {
    expect(() =>
      sanitization.sanitizePath("../secret.txt", { rootDir: "/workspace" }),
    ).toThrow(/Path traversal detected/);
  });

  it("normalizes absolute paths when absolute access is allowed", () => {
    const result = sanitization.sanitizePath("/tmp//nested/file.txt", {
      allowAbsolute: true,
      toPosix: true,
    });

    expect(result.sanitizedPath).toBe("/tmp/nested/file.txt");
    expect(result.wasAbsolute).toBe(true);
    expect(result.convertedToRelative).toBe(false);
  });

  it("strips the absolute prefix when absolute paths are disallowed", () => {
    const result = sanitization.sanitizePath("/workspace/input.txt");

    expect(result.sanitizedPath).toBe("workspace/input.txt");
    expect(result.convertedToRelative).toBe(true);
  });
});
