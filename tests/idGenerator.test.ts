import { describe, expect, it } from "vitest";

import { IdGenerator, generateUUID } from "../src/utils/security/idGenerator.js";

describe("IdGenerator", () => {
  it("generates IDs for registered entities", () => {
    const gen = new IdGenerator({ project: "PROJ" });
    const id = gen.generateForEntity("project", { length: 8 });

    expect(id.startsWith("PROJ_")).toBe(true);
    expect(id.length).toBe("PROJ_".length + 8);
    expect(gen.isValid(id, "project", { length: 8 })).toBe(true);
  });

  it("normalizes id casing", () => {
    const gen = new IdGenerator({ task: "TASK" });
    const normalized = gen.normalize("task_ab12cd");

    expect(normalized).toBe("TASK_AB12CD");
  });
});

describe("generateUUID", () => {
  it("returns a valid v4 UUID-like shape", () => {
    const uuid = generateUUID();
    expect(uuid).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    );
  });
});
