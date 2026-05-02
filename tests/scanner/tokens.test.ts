import { describe, it, expect } from "vitest";
import { parseTokens } from "../../src/scanner/tokens.js";
import { resolve } from "path";

const fixturesDir = resolve(import.meta.dirname, "../fixtures/tokens");

describe("parseTokens", () => {
  describe("DTCG JSON format", () => {
    it("parses flat tokens", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens.json"));
      const primary = tokens.find((t) => t.name === "color.primary");
      expect(primary).toEqual({
        name: "color.primary",
        value: "#3B82F6",
        type: "color",
      });
    });

    it("parses nested tokens with dot notation", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens.json"));
      const neutral100 = tokens.find((t) => t.name === "color.neutral.100");
      expect(neutral100).toEqual({
        name: "color.neutral.100",
        value: "#F5F5F5",
        type: "color",
      });
    });

    it("parses spacing tokens", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens.json"));
      const spacingMd = tokens.find((t) => t.name === "spacing.md");
      expect(spacingMd).toEqual({
        name: "spacing.md",
        value: "16px",
        type: "dimension",
      });
    });

    it("parses all tokens", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens.json"));
      expect(tokens.length).toBe(9);
    });
  });

  describe("CSS custom properties format", () => {
    it("parses color tokens", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens.css"));
      const primary = tokens.find((t) => t.name === "color.primary");
      expect(primary).toEqual({
        name: "color.primary",
        value: "#3B82F6",
        type: "color",
      });
    });

    it("parses spacing tokens", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens.css"));
      const spacingMd = tokens.find((t) => t.name === "spacing.md");
      expect(spacingMd).toEqual({
        name: "spacing.md",
        value: "16px",
        type: "dimension",
      });
    });

    it("parses string tokens", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens.css"));
      const fontFamily = tokens.find((t) => t.name === "typography.heading.font.family");
      expect(fontFamily?.type).toBe("string");
    });

    it("parses all tokens", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens.css"));
      expect(tokens.length).toBe(9);
    });
  });

  it("throws on unsupported format", () => {
    expect(() => parseTokens("tokens.yaml")).toThrow("Unsupported token file format");
  });
});
