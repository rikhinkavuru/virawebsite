import { describe, it, expect } from "vitest";
import { CHAPTERS, OPERATORS, DEPLOYMENT_STATS, deriveStats } from "./chapters";

describe("chapters data", () => {
  it("validates and loads all chapters and operators", () => {
    expect(CHAPTERS.length).toBe(21);
    expect(OPERATORS.length).toBe(22);
  });

  it("derives stats from the data instead of hardcoding them", () => {
    expect(DEPLOYMENT_STATS.total_nodes).toBe(21);
    expect(DEPLOYMENT_STATS.total_deployments).toBe(17);
    // sum of the 17 active chapters' attendees
    expect(DEPLOYMENT_STATS.total_users).toBe(983);
  });

  it("recomputes for a subset", () => {
    const activeOnly = deriveStats(CHAPTERS.filter((c) => c.status === "active"));
    expect(activeOnly.total_nodes).toBe(17);
    expect(activeOnly.total_deployments).toBe(17);
  });
});
