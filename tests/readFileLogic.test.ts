import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  readFile: vi.fn(),
  resolvePath: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  default: {
    readFile: mocks.readFile,
  },
}));

vi.mock("../src/mcp-server/state.js", () => ({
  serverState: {
    resolvePath: mocks.resolvePath,
  },
}));

import { readFileLogic } from "../src/mcp-server/tools/readFile/readFileLogic.js";
import { BaseErrorCode, McpError } from "../src/types-global/errors.js";

describe("readFileLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns file content for a resolved path", async () => {
    mocks.resolvePath.mockReturnValue("/workspace/note.txt");
    mocks.readFile.mockResolvedValue("hello world");

    await expect(
      readFileLogic({ path: "note.txt" }, { requestId: "req-1" } as never),
    ).resolves.toEqual({ content: "hello world" });

    expect(mocks.resolvePath).toHaveBeenCalledWith(
      "note.txt",
      expect.objectContaining({ requestId: "req-1" }),
    );
    expect(mocks.readFile).toHaveBeenCalledWith("/workspace/note.txt", "utf8");
  });

  it("maps missing files to a not found error", async () => {
    mocks.resolvePath.mockReturnValue("/workspace/missing.txt");
    mocks.readFile.mockRejectedValue({ code: "ENOENT", message: "missing" });

    await expect(
      readFileLogic({ path: "missing.txt" }, { requestId: "req-2" } as never),
    ).rejects.toMatchObject({ code: BaseErrorCode.NOT_FOUND });

    await expect(
      readFileLogic({ path: "missing.txt" }, { requestId: "req-2" } as never),
    ).rejects.toBeInstanceOf(McpError);
  });
});
