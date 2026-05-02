import { describe, it, expect } from "vitest";
import { parseVueProps } from "../../src/scanner/vue-components.js";
import { resolve } from "path";

const fixturesDir = resolve(import.meta.dirname, "../fixtures/components");

describe("parseVueProps", () => {
  it("extracts props from withDefaults(defineProps<T>())", () => {
    const props = parseVueProps(resolve(fixturesDir, "Input.vue"), "Input");

    expect(props.length).toBe(5);

    const label = props.find((p) => p.name === "label");
    expect(label?.required).toBe(false);
    expect(label?.type).toContain("string");

    const type = props.find((p) => p.name === "type");
    expect(type?.required).toBe(false);
    expect(type?.variants).toEqual(["text", "email", "password"]);
    expect(type?.defaultValue).toBe('"text"');

    const disabled = props.find((p) => p.name === "disabled");
    expect(disabled?.defaultValue).toBe("false");
  });

  it("extracts props from defineProps<T>() without withDefaults", () => {
    const props = parseVueProps(resolve(fixturesDir, "Tag.vue"), "Tag");

    expect(props.length).toBe(3);

    const label = props.find((p) => p.name === "label");
    expect(label?.required).toBe(true);

    const color = props.find((p) => p.name === "color");
    expect(color?.required).toBe(false);
    expect(color?.variants).toEqual(["blue", "green", "red", "gray"]);
    expect(color?.defaultValue).toBeUndefined();

    const removable = props.find((p) => p.name === "removable");
    expect(removable?.required).toBe(false);
  });

  it("returns empty array for file without script setup", () => {
    const props = parseVueProps(resolve(fixturesDir, "NoScript.vue"), "NoScript");
    expect(props).toEqual([]);
  });
});
