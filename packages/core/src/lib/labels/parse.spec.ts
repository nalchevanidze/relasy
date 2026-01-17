import { test, expect, describe } from "vitest";
import { parseLabel } from "./parse";

describe("parseLabel", () => {
  const mockConfig = {
    changeTypes: {
      major: "Major Change",
      breaking: "Breaking Change",
      feature: "Feature",
      fix: "Bug Fix",
      chore: "Chore",
    },
    scopes: {
      core: "Core Module",
      cli: "Command Line Interface",
      docs: "Documentation",
      api: "API Changes",
    },
    gh: "mock-gh",
    project: { type: "npm" as const },
  };

  describe("changeTypes parsing", () => {
    test("parses simple change type label", () => {
      const label = parseLabel(mockConfig, "feature");
      expect(label).toEqual({
        type: "changeTypes",
        key: "feature",
        color: "0E8A16",
        description: "Label for versioning: Feature",
        name: "✨ feature",
        existing: "feature",
      });
    });

    test("parses fix change type with correct color", () => {
      const label = parseLabel(mockConfig, "fix");
      expect(label).toEqual({
        type: "changeTypes",
        key: "fix",
        color: "1D76DB",
        description: "Label for versioning: Bug Fix",
        name: "🐛 fix",
        existing: "fix",
      });
    });

    test("parses major change type with red color", () => {
      const label = parseLabel(mockConfig, "major");
      expect(label).toEqual({
        type: "changeTypes",
        key: "major",
        color: "B60205",
        description: "Label for versioning: Major Change",
        name: "🚨 major",
        existing: "major",
      });
    });

    test("parses breaking change type with red color", () => {
      const label = parseLabel(mockConfig, "breaking");
      expect(label).toEqual({
        type: "changeTypes",
        key: "breaking",
        color: "B60205",
        description: "Label for versioning: Breaking Change",
        name: "💥 breaking",
        existing: "breaking",
      });
    });

    test("parses chore with light gray color", () => {
      const label = parseLabel(mockConfig, "chore");
      expect(label).toEqual({
        type: "changeTypes",
        key: "chore",
        color: "D4DADF",
        description: "Label for versioning: Chore",
        name: "🧹 chore",
        existing: "chore",
      });
    });

    test("returns undefined for non-existent change type", () => {
      const label = parseLabel(mockConfig, "nonexistent");
      expect(label).toBeUndefined();
    });
  });

  describe("scopes parsing", () => {
    test("parses scope with 'scope/' prefix", () => {
      const label = parseLabel(mockConfig, "scope/core");
      expect(label).toEqual({
        type: "scopes",
        key: "core",
        color: "FFFFFF",
        description: 'Label for affected scope: "Core Module"',
        name: "📦 core",
        existing: "scope/core",
      });
    });

    test("parses scope with 'type/' prefix", () => {
      expect(() => parseLabel(mockConfig, "type/cli")).toThrow(
        "invalid label type/cli. key cli could not be found on object with fields: major, breaking, feature, fix, chore",
      );
    });

    test("parses scope with package emoji prefix", () => {
      const label = parseLabel(mockConfig, "📦/docs");
      expect(label).toEqual({
        type: "scopes",
        key: "docs",
        color: "FFFFFF",
        description: 'Label for affected scope: "Documentation"',
        name: "📦 docs",
        existing: "📦/docs",
      });
    });

    test("throws error for non-existent scope key", () => {
      expect(() => {
        parseLabel(mockConfig, "scope/nonexistent");
      }).toThrow(
        "invalid label scope/nonexistent. key nonexistent could not be found on object with fields: core, cli, docs, api",
      );
    });
  });

  describe("input normalization", () => {
    test("handles colons by converting to slashes", () => {
      const label = parseLabel(mockConfig, "scope:core");
      expect(label).toEqual({
        type: "scopes",
        key: "core",
        color: "FFFFFF",
        description: 'Label for affected scope: "Core Module"',
        name: "📦 core",
        existing: "scope:core",
      });
    });

    test("handles spaces by converting to slashes", () => {
      const label = parseLabel(mockConfig, "scope core");
      expect(label).toEqual({
        type: "scopes",
        key: "core",
        color: "FFFFFF",
        description: 'Label for affected scope: "Core Module"',
        name: "📦 core",
        existing: "scope core",
      });
    });

    test("trims whitespace", () => {
      const label = parseLabel(mockConfig, "  feature  ");
      expect(label).toEqual({
        type: "changeTypes",
        key: "feature",
        color: "0E8A16",
        description: "Label for versioning: Feature",
        name: "✨ feature",
        existing: "  feature  ",
      });
    });
  });

  describe("emoji prefix parsing", () => {
    test("parses with feature emoji prefix", () => {
      const label = parseLabel(mockConfig, "✨/feature");
      expect(label).toEqual({
        type: "changeTypes",
        key: "feature",
        color: "0E8A16",
        description: "Label for versioning: Feature",
        name: "✨ feature",
        existing: "✨/feature",
      });
    });

    test("parses with fix emoji prefix", () => {
      const label = parseLabel(mockConfig, "🐛/fix");
      expect(label).toEqual({
        type: "changeTypes",
        key: "fix",
        color: "1D76DB",
        description: "Label for versioning: Bug Fix",
        name: "🐛 fix",
        existing: "🐛/fix",
      });
    });

    test("parses with breaking change emoji prefix", () => {
      const label = parseLabel(mockConfig, "💥/breaking");
      expect(label).toEqual({
        type: "changeTypes",
        key: "breaking",
        color: "B60205",
        description: "Label for versioning: Breaking Change",
        name: "💥 breaking",
        existing: "💥/breaking",
      });
    });
  });

  describe("error cases", () => {
    test("throws error for too many slashes", () => {
      expect(() => {
        parseLabel(mockConfig, "scope/core/extra");
      }).toThrow(
        "invalid Label \"scope/core/extra\". only one '/' is allowed in labels for core",
      );
    });

    test("returns undefined for invalid prefix", () => {
      const label = parseLabel(mockConfig, "invalid/something");
      expect(label).toBeUndefined();
    });

    test("handles empty string gracefully", () => {
      const label = parseLabel(mockConfig, "");
      expect(label).toBeUndefined();
    });
  });

  describe("color fallback", () => {
    test("uses fallback color for unknown change type", () => {
      const configWithCustomType = {
        ...mockConfig,
        changeTypes: {
          ...mockConfig.changeTypes,
          custom: "Custom Type",
        },
      };

      const label = parseLabel(configWithCustomType, "custom");
      expect(label).toEqual({
        type: "changeTypes",
        key: "custom",
        color: "FFFFFF", // Falls back to pkg color
        description: "Label for versioning: Custom Type",
        name: "🏷️ custom", // Falls back to feature emoji since custom isn't in emojies map
        existing: "custom",
      });
    });
  });
});
