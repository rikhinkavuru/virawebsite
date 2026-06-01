import { describe, it, expect } from "vitest";
import { CHAPTERS, OPERATORS, DEPLOYMENT_STATS, deriveStats } from "./chapters";

describe("chapters data", () => {
  it("validates and loads all chapters and operators", () => {
    expect(CHAPTERS.length).toBe(21);
    expect(OPERATORS.length).toBe(22);
  });

  it("derives stats from the data instead of hardcoding them", () => {
    expect(DEPLOYMENT_STATS.total_nodes).toBe(21);
    expect(DEPLOYMENT_STATS.total_deployments).toBe(5);
    // sum of active-chapter attendees: 58 + 42 + 73 + 88 + 65 = 326
    expect(DEPLOYMENT_STATS.total_users).toBe(326);
  });

  it("recomputes for a subset", () => {
    const activeOnly = deriveStats(CHAPTERS.filter((c) => c.status === "active"));
    expect(activeOnly.total_nodes).toBe(5);
    expect(activeOnly.total_deployments).toBe(5);
  });
});
