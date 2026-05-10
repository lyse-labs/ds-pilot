import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { writeFileSync, unlinkSync, mkdirSync, rmSync } from "fs";
import { resolve, join } from "path";
import { createScannerCache } from "../../src/scanner/cache.js";

const TMP = resolve(import.meta.dirname, ".tmp-cache-test");

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

describe("createScannerCache — components", () => {
  let dir: string;

  beforeEach(() => {
    dir = join(TMP, "components");
    mkdirSync(dir, { recursive: true });
    writeFileSync(
      join(dir, "Foo.tsx"),
      `interface FooProps { label: string }
export const Foo = (props: FooProps) => null;`
    );
  });

  afterEach(() => {
    rmSync(TMP, { recursive: true, force: true });
  });

  it("returns scanned components on first call", () => {
    const cache = createScannerCache(dir);
    const components = cache.getComponents();
    expect(components.map((c) => c.name)).toContain("Foo");
  });

  it("serves from cache when nothing has changed (same reference)", () => {
    const cache = createScannerCache(dir);
    const first = cache.getComponents();
    const second = cache.getComponents();
    expect(second).toBe(first);
  });

  it("re-scans when a new component file is added", async () => {
    const cache = createScannerCache(dir);
    cache.getComponents();
    await sleep(15);
    writeFileSync(
      join(dir, "Bar.tsx"),
      `export const Bar = () => null;`
    );
    const after = cache.getComponents();
    expect(after.map((c) => c.name)).toContain("Bar");
    expect(after.map((c) => c.name)).toContain("Foo");
  });

  it("re-scans when a component file is deleted", async () => {
    writeFileSync(join(dir, "Bar.tsx"), `export const Bar = () => null;`);
    const cache = createScannerCache(dir);
    cache.getComponents();
    await sleep(15);
    unlinkSync(join(dir, "Bar.tsx"));
    const after = cache.getComponents();
    expect(after.map((c) => c.name)).toContain("Foo");
    expect(after.map((c) => c.name)).not.toContain("Bar");
  });

  it("re-scans when a component is renamed via file edit", async () => {
    const cache = createScannerCache(dir);
    cache.getComponents();
    await sleep(15);
    writeFileSync(
      join(dir, "Foo.tsx"),
      `export const Renamed = () => null;`
    );
    const after = cache.getComponents();
    expect(after.map((c) => c.name)).toContain("Renamed");
  });
});

describe("createScannerCache — tokens", () => {
  let dir: string;
  let tokensFile: string;

  beforeEach(() => {
    dir = join(TMP, "components");
    mkdirSync(dir, { recursive: true });
    writeFileSync(join(dir, "Foo.tsx"), `export const Foo = () => null;`);
    tokensFile = join(TMP, "tokens.json");
    writeFileSync(
      tokensFile,
      JSON.stringify({
        color: { primary: { $value: "#3B82F6", $type: "color" } },
      })
    );
  });

  afterEach(() => {
    rmSync(TMP, { recursive: true, force: true });
  });

  it("returns scanned tokens on first call", () => {
    const cache = createScannerCache(dir, tokensFile);
    const tokens = cache.getTokens();
    expect(tokens.find((t) => t.name === "color.primary")).toBeDefined();
  });

  it("returns same reference when tokens file unchanged", () => {
    const cache = createScannerCache(dir, tokensFile);
    const first = cache.getTokens();
    const second = cache.getTokens();
    expect(second).toBe(first);
  });

  it("re-scans tokens when tokens file is modified", async () => {
    const cache = createScannerCache(dir, tokensFile);
    cache.getTokens();
    await sleep(15);
    writeFileSync(
      tokensFile,
      JSON.stringify({
        color: { secondary: { $value: "#10B981", $type: "color" } },
      })
    );
    const after = cache.getTokens();
    expect(after.find((t) => t.name === "color.secondary")).toBeDefined();
    expect(after.find((t) => t.name === "color.primary")).toBeUndefined();
  });

  it("returns empty tokens array when no tokens file is given", () => {
    const cache = createScannerCache(dir);
    expect(cache.getTokens()).toEqual([]);
  });
});
