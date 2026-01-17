import { test, expect, describe } from "vitest";
import { parseLabel } from "./parse";

describe("parseLabel", () => {
  test("parses change type label", () => {
    const config = {
      changeTypes: {
        feat: "Feature",
        fix: "Bug Fix",
      },
      scopes: {},
    };

    const label = parseLabel(config, "feat");
    expect(label).toEqual({
      type: "changeTypes",
      key: "feat",
      color: "#0d8a16",
      description: "Label for versioning: Feature",
      name: "changeTypes/feat",
      existing: "feat",
    });
  });
});
