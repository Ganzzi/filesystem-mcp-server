import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mkdir: vi.fn(),
  stat: vi.fn(),
  writeFile: vi.fn(),
  resolvePath: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  default: {
    mkdir: mocks.mkdir,
    stat: mocks.stat,
    writeFile: mocks.writeFile,
  },
}));

vi.mock("../src/mcp-server/state.js", () => ({
  serverState: {
    resolvePath: mocks.resolvePath,
  },
}));

import { writeFileLogic } from "../src/mcp-server/tools/writeFile/writeFileLogic.js";

describe("writeFileLogic", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("writes content and creates parent directories", async () => {
    mocks.resolvePath.mockReturnValue("/workspace/docs/note.txt");
    mocks.stat.mockRejectedValue({ code: "ENOENT" });
    mocks.mkdir.mockResolvedValue(undefined);
    mocks.writeFile.mockResolvedValue(undefined);

    await expect(
      writeFileLogic(
        { path: "docs/note.txt", content: "hello" },
        { requestId: "req-3" } as never,
      ),
    ).resolves.toEqual({
      message: "Successfully wrote content to /workspace/docs/note.txt",
      writtenPath: "/workspace/docs/note.txt",
      bytesWritten: 5,
    });

    expect(mocks.stat).toHaveBeenCalledWith("/workspace/docs/note.txt");
    expect(mocks.mkdir).toHaveBeenCalledWith("/workspace/docs", {
      recursive: true,
    });
    expect(mocks.writeFile).toHaveBeenCalledWith(
      "/workspace/docs/note.txt",
      "hello",
      "utf8",
    );
  });
});
