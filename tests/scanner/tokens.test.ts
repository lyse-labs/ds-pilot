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
        group: "color",
      });
    });

    it("parses nested tokens with dot notation", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens.json"));
      const neutral100 = tokens.find((t) => t.name === "color.neutral.100");
      expect(neutral100).toEqual({
        name: "color.neutral.100",
        value: "#F5F5F5",
        type: "color",
        group: "color",
      });
    });

    it("parses spacing tokens", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens.json"));
      const spacingMd = tokens.find((t) => t.name === "spacing.md");
      expect(spacingMd).toEqual({
        name: "spacing.md",
        value: "16px",
        type: "dimension",
        group: "spacing",
      });
    });

    it("parses all tokens", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens.json"));
      expect(tokens.length).toBe(9);
    });

    it("detects alias references and resolves them", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens-with-aliases.json"));

      const btnBg = tokens.find((t) => t.name === "button.background");
      expect(btnBg?.value).toBe("{color.primary}");
      expect(btnBg?.resolvedValue).toBe("#3B82F6");

      const btnBorder = tokens.find((t) => t.name === "button.border");
      expect(btnBorder?.value).toBe("{color.secondary}");
      expect(btnBorder?.resolvedValue).toBe("#6366F1");

      const btnText = tokens.find((t) => t.name === "button.text");
      expect(btnText?.resolvedValue).toBeUndefined();
    });

    it("adds group metadata to tokens", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens-with-aliases.json"));

      const btnBg = tokens.find((t) => t.name === "button.background");
      expect(btnBg?.group).toBe("button");

      const primary = tokens.find((t) => t.name === "color.primary");
      expect(primary?.group).toBe("color");
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

  describe("Plain nested JSON format (Figma export)", () => {
    it("parses nested values as tokens", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens-plain.json"));

      const bgPrimary = tokens.find((t) => t.name === "Color.Background.primary");
      expect(bgPrimary?.value).toBe("#1a1a23");
      expect(bgPrimary?.type).toBe("color");
      expect(bgPrimary?.group).toBe("Color");
    });

    it("infers types from values", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens-plain.json"));

      const fontSize = tokens.find((t) => t.name === "Typography.font.size.body.md");
      expect(fontSize?.value).toBe("16px");
      expect(fontSize?.type).toBe("dimension");

      const fontWeight = tokens.find((t) => t.name === "Typography.font.weight.Regular");
      expect(fontWeight?.value).toBe("Regular");
      expect(fontWeight?.type).toBe("string");
    });

    it("parses all tokens", () => {
      const tokens = parseTokens(resolve(fixturesDir, "tokens-plain.json"));
      expect(tokens.length).toBe(8);
    });
  });

  it("throws on unsupported format", () => {
    expect(() => parseTokens("tokens.yaml")).toThrow("Unsupported token file format");
  });
});
