import { describe, it, expect } from "vitest";
import { searchComponents, getComponentWithProps, listTokens, getToken } from "../../src/tools.js";
import { scanComponents } from "../../src/scanner/components.js";
import { parseTokens } from "../../src/scanner/tokens.js";
import { resolve } from "path";

const componentsDir = resolve(import.meta.dirname, "../fixtures/components");
const tokensFile = resolve(import.meta.dirname, "../fixtures/tokens/tokens.json");

describe("searchComponents", () => {
  it("finds components by partial name", () => {
    const components = scanComponents(componentsDir);
    const results = searchComponents(components, "but");
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Button");
  });

  it("is case-insensitive", () => {
    const components = scanComponents(componentsDir);
    const results = searchComponents(components, "CARD");
    expect(results.length).toBe(1);
    expect(results[0].name).toBe("Card");
  });

  it("returns empty for no match", () => {
    const components = scanComponents(componentsDir);
    const results = searchComponents(components, "nonexistent");
    expect(results.length).toBe(0);
  });
});

describe("getComponentWithProps", () => {
  it("returns component with props", () => {
    const components = scanComponents(componentsDir);
    const result = getComponentWithProps(components, "Button");
    expect(result).not.toBeNull();
    expect(result!.name).toBe("Button");
    expect(result!.props.length).toBe(5);
  });

  it("returns null for unknown component", () => {
    const components = scanComponents(componentsDir);
    const result = getComponentWithProps(components, "Unknown");
    expect(result).toBeNull();
  });
});

describe("listTokens", () => {
  it("returns all tokens without filter", () => {
    const tokens = parseTokens(tokensFile);
    const result = listTokens(tokens);
    expect(result.length).toBe(9);
  });

  it("filters by type", () => {
    const tokens = parseTokens(tokensFile);
    const colors = listTokens(tokens, "color");
    expect(colors.every((t) => t.type === "color")).toBe(true);
    expect(colors.length).toBe(4);
  });
});

describe("getToken", () => {
  it("finds a token by name", () => {
    const tokens = parseTokens(tokensFile);
    const token = getToken(tokens, "color.primary");
    expect(token).toEqual({
      name: "color.primary",
      value: "#3B82F6",
      type: "color",
    });
  });

  it("returns null for unknown token", () => {
    const tokens = parseTokens(tokensFile);
    const token = getToken(tokens, "nonexistent");
    expect(token).toBeNull();
  });
});
