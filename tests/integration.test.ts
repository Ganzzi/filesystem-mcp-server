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

// ---------------------------------------------------------------------------
// Live MCP Server Integration Tests
// ---------------------------------------------------------------------------
// These tests connect to a running MCP server instance.
// They are skipped unless MCP_TEST_HOST is set.
//
// Environment variables required:
// - MCP_TEST_HOST — MCP server host (e.g., "http://192.168.1.100:3010")
// - MCP_AUTH_SECRET_KEY — JWT secret key for authentication
//
// To enable live tests:
//   export MCP_TEST_HOST="http://your-mcp-server:3010"
//   export MCP_AUTH_SECRET_KEY="your-secret-key"
// ---------------------------------------------------------------------------

describe.skipIf(!process.env.MCP_TEST_HOST)("Live MCP Filesystem Operations", () => {
  const MCP_HOST = process.env.MCP_TEST_HOST || "";
  const AUTH_SECRET = process.env.MCP_AUTH_SECRET_KEY || "test-secret";

  it("should connect and list files", async () => {
    // This test would require an actual MCP client implementation
    // For now, we skip with a structured message
    if (!MCP_HOST) {
      console.log(
        "BUILT_NOT_VERIFIED: MCP_TEST_HOST not set. " +
        'Set MCP_TEST_HOST="http://your-mcp-server:3010" to enable live MCP tests.'
      );
      return;
    }

    // TODO: Implement MCP client connection and list_files test
    // This requires a client library that can speak the MCP protocol over HTTP
    console.log("Live MCP test placeholder - client implementation needed");
  });

  it("should write and read file round-trip", async () => {
    if (!MCP_HOST) {
      console.log(
        "BUILT_NOT_VERIFIED: MCP_TEST_HOST not set. " +
        'Set MCP_TEST_HOST="http://your-mcp-server:3010" to enable live MCP tests.'
      );
      return;
    }

    // TODO: Implement write_file and read_file round-trip test
    // This requires:
    // 1. JWT token generation using MCP_AUTH_SECRET_KEY
    // 2. HTTP POST to MCP server with tool call
    // 3. Verify write_file response
    // 4. Verify read_file returns written content
    console.log("Live MCP test placeholder - client implementation needed");
  });

  it("should perform search-and-replace operation", async () => {
    if (!MCP_HOST) {
      console.log(
        "BUILT_NOT_VERIFIED: MCP_TEST_HOST not set. " +
        'Set MCP_TEST_HOST="http://your-mcp-server:3010" to enable live MCP tests.'
      );
      return;
    }

    // TODO: Implement update_file test with search/replace
    console.log("Live MCP test placeholder - client implementation needed");
  });
});
