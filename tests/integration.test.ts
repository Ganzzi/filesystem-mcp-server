import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  mkdir: vi.fn(),
  readFile: vi.fn(),
  stat: vi.fn(),
  writeFile: vi.fn(),
  resolvePath: vi.fn(),
}));

vi.mock("fs/promises", () => ({
  default: {
    mkdir: mocks.mkdir,
    readFile: mocks.readFile,
    stat: mocks.stat,
    writeFile: mocks.writeFile,
  },
}));

vi.mock("../src/mcp-server/state.js", () => ({
  serverState: {
    resolvePath: mocks.resolvePath,
  },
}));

import { readFileLogic } from "../src/mcp-server/tools/readFile/readFileLogic.js";
import { writeFileLogic } from "../src/mcp-server/tools/writeFile/writeFileLogic.js";
import { BaseErrorCode, McpError } from "../src/types-global/errors.js";

describe("filesystem MCP read/write integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("writes a file and then reads it through resolved MCP paths", async () => {
    const absolutePath = "/workspace/docs/note.txt";
    mocks.resolvePath.mockReturnValue(absolutePath);
    mocks.stat.mockRejectedValue({ code: "ENOENT" });
    mocks.mkdir.mockResolvedValue(undefined);
    mocks.writeFile.mockResolvedValue(undefined);
    mocks.readFile.mockResolvedValue("hello world");

    const context = { requestId: "integration-1" } as never;

    await expect(
      writeFileLogic({ path: "docs/note.txt", content: "hello world" }, context),
    ).resolves.toEqual({
      message: `Successfully wrote content to ${absolutePath}`,
      writtenPath: absolutePath,
      bytesWritten: 11,
    });

    await expect(readFileLogic({ path: "docs/note.txt" }, context)).resolves.toEqual({
      content: "hello world",
    });

    expect(mocks.resolvePath).toHaveBeenCalledTimes(2);
    expect(mocks.resolvePath).toHaveBeenNthCalledWith(1, "docs/note.txt", context);
    expect(mocks.resolvePath).toHaveBeenNthCalledWith(2, "docs/note.txt", context);
    expect(mocks.mkdir).toHaveBeenCalledWith("/workspace/docs", { recursive: true });
    expect(mocks.writeFile).toHaveBeenCalledWith(absolutePath, "hello world", "utf8");
    expect(mocks.readFile).toHaveBeenCalledWith(absolutePath, "utf8");
  });

  it("rejects directory writes before read/write workflow continues", async () => {
    mocks.resolvePath.mockReturnValue("/workspace/docs");
    mocks.stat.mockResolvedValue({ isDirectory: () => true });

    await expect(
      writeFileLogic({ path: "docs", content: "not allowed" }, { requestId: "integration-2" } as never),
    ).rejects.toMatchObject({ code: BaseErrorCode.VALIDATION_ERROR });

    expect(mocks.mkdir).not.toHaveBeenCalled();
    expect(mocks.writeFile).not.toHaveBeenCalled();
  });

  it("maps missing read targets to MCP not-found errors", async () => {
    mocks.resolvePath.mockReturnValue("/workspace/missing.txt");
    mocks.readFile.mockRejectedValue({ code: "ENOENT", message: "missing" });

    await expect(
      readFileLogic({ path: "missing.txt" }, { requestId: "integration-3" } as never),
    ).rejects.toMatchObject({ code: BaseErrorCode.NOT_FOUND });

    await expect(
      readFileLogic({ path: "missing.txt" }, { requestId: "integration-3" } as never),
    ).rejects.toBeInstanceOf(McpError);
  });

  it("propagates path resolution failures as MCP errors", async () => {
    const resolutionError = new McpError(
      BaseErrorCode.VALIDATION_ERROR,
      "Path must stay within the configured filesystem root",
      { requestId: "integration-4" },
    );
    mocks.resolvePath.mockImplementation(() => {
      throw resolutionError;
    });

    await expect(
      readFileLogic({ path: "../../outside.txt" }, { requestId: "integration-4" } as never),
    ).rejects.toBe(resolutionError);
  });
});
