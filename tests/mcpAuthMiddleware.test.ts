import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import jwt from "jsonwebtoken";

const mocks = vi.hoisted(() => ({
  config: { mcpAuthSecretKey: "12345678901234567890123456789012" },
  environment: "development",
  createRequestContext: vi.fn((value) => value),
  logger: {
    debug: vi.fn(),
    warning: vi.fn(),
    error: vi.fn(),
    fatal: vi.fn(),
  },
}));

vi.mock("../../../config/index.js", () => ({
  config: mocks.config,
  environment: mocks.environment,
}));

vi.mock("../../../utils/index.js", () => ({
  logger: mocks.logger,
  requestContextService: {
    createRequestContext: mocks.createRequestContext,
  },
}));

describe("mcpAuthMiddleware", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.resetModules();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("attaches auth info for a valid bearer token", async () => {
    const verifySpy = vi.spyOn(jwt, "verify").mockReturnValue({
      cid: "client-1",
      scp: ["read", "write"],
    } as never);
    const { mcpAuthMiddleware } = await import("../src/mcp-server/transports/authentication/authMiddleware.js");
    const token = jwt.sign(
      { cid: "client-1", scp: ["read", "write"] },
      mocks.config.mcpAuthSecretKey,
      { expiresIn: "1h" },
    );

    const req = {
      headers: { authorization: `Bearer ${token}` },
      method: "GET",
      path: "/mcp",
    } as never;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as never;
    const next = vi.fn();

    mcpAuthMiddleware(req, res, next);

    expect(verifySpy).toHaveBeenCalledTimes(1);
    expect(next).toHaveBeenCalledTimes(1);
    expect((req as { auth?: unknown }).auth).toEqual({
      token,
      clientId: "client-1",
      scopes: ["read", "write"],
    });
  });

  it("rejects requests without a bearer token", async () => {
    const { mcpAuthMiddleware } = await import("../src/mcp-server/transports/authentication/authMiddleware.js");
    const req = {
      headers: {},
      method: "GET",
      path: "/mcp",
    } as never;
    const res = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn(),
    } as never;
    const next = vi.fn();

    mcpAuthMiddleware(req, res, next);

    expect(next).not.toHaveBeenCalled();
    expect((res as { status: typeof vi.fn }).status).toHaveBeenCalledWith(401);
    expect((res as { json: typeof vi.fn }).json).toHaveBeenCalled();
  });
});
