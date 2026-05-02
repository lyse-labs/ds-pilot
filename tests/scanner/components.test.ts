import { describe, it, expect } from "vitest";
import { scanComponents, getComponentProps } from "../../src/scanner/components.js";
import { resolve } from "path";

const fixturesDir = resolve(import.meta.dirname, "../fixtures/components");

describe("scanComponents", () => {
  it("finds all component files", () => {
    const components = scanComponents(fixturesDir);
    const names = components.map((c) => c.name);
    expect(names).toContain("Button");
    expect(names).toContain("Card");
    expect(names).toContain("Modal");
  });

  it("ignores test files", () => {
    const components = scanComponents(fixturesDir);
    const names = components.map((c) => c.name);
    expect(names).not.toContain("Button.test");
  });

  it("ignores barrel index files", () => {
    const components = scanComponents(fixturesDir);
    const names = components.map((c) => c.name);
    expect(names).not.toContain("index");
  });

  it("detects export types", () => {
    const components = scanComponents(fixturesDir);
    const button = components.find((c) => c.name === "Button");
    const card = components.find((c) => c.name === "Card");
    expect(button?.exportType).toBe("named");
    expect(card?.exportType).toBe("default");
  });
});

describe("getComponentProps", () => {
  it("extracts Button props", () => {
    const components = scanComponents(fixturesDir);
    const button = components.find((c) => c.name === "Button")!;
    const props = getComponentProps(button.filePath, "Button");

    expect(props.length).toBe(5);

    const label = props.find((p) => p.name === "label");
    expect(label?.required).toBe(true);
    expect(label?.type).toContain("string");

    const variant = props.find((p) => p.name === "variant");
    expect(variant?.required).toBe(false);

    const disabled = props.find((p) => p.name === "disabled");
    expect(disabled?.required).toBe(false);
  });

  it("extracts Card props", () => {
    const components = scanComponents(fixturesDir);
    const card = components.find((c) => c.name === "Card")!;
    const props = getComponentProps(card.filePath, "Card");

    expect(props.length).toBe(3);
    const title = props.find((p) => p.name === "title");
    expect(title?.required).toBe(true);
  });

  it("extracts Modal props (React.FC pattern)", () => {
    const components = scanComponents(fixturesDir);
    const modal = components.find((c) => c.name === "Modal")!;
    const props = getComponentProps(modal.filePath, "Modal");

    expect(props.length).toBe(4);
    const isOpen = props.find((p) => p.name === "isOpen");
    expect(isOpen?.required).toBe(true);
    expect(isOpen?.type).toContain("boolean");
  });
});
