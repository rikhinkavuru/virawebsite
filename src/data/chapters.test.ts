import { describe, it, expect } from "vitest";
import { CHAPTERS, OPERATORS, DEPLOYMENT_STATS, deriveStats } from "./chapters";

describe("chapters data", () => {
  it("validates and loads all chapters and operators", () => {
    expect(CHAPTERS.length).toBe(15);
    expect(OPERATORS.length).toBe(16);
  });

  it("derives stats from the data instead of hardcoding them", () => {
    expect(DEPLOYMENT_STATS.total_nodes).toBe(15);
    expect(DEPLOYMENT_STATS.total_deployments).toBe(15);
    // sum of the attendees across all chapters (four have no event logged yet)
    expect(DEPLOYMENT_STATS.total_users).toBe(610);
  });

  it("recomputes for a subset", () => {
    const activeOnly = deriveStats(CHAPTERS.filter((c) => c.status === "active"));
    expect(activeOnly.total_nodes).toBe(15);
    expect(activeOnly.total_deployments).toBe(15);
  });
});
