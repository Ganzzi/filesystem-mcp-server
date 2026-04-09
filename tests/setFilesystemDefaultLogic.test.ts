import { beforeEach, describe, expect, it, vi } from "vitest";

import { serverState } from "../src/mcp-server/state.js";
import { setFilesystemDefaultLogic } from "../src/mcp-server/tools/setFilesystemDefault/setFilesystemDefaultLogic.js";

describe("setFilesystemDefaultLogic", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("delegates to server state and returns the current default path", async () => {
    vi.spyOn(serverState, "setDefaultFilesystemPath").mockImplementation(
      () => undefined,
    );
    vi.spyOn(serverState, "getDefaultFilesystemPath").mockReturnValue(
      "/workspace/default",
    );

    await expect(
      setFilesystemDefaultLogic(
        { path: "/workspace/default" },
        { requestId: "req-4" } as never,
      ),
    ).resolves.toEqual({
      message: "Default filesystem path successfully set to: /workspace/default",
      currentDefaultPath: "/workspace/default",
    });
  });
});
