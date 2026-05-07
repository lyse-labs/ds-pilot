import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { runInit } from "../src/init.js";
import { mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "fs";
import { resolve } from "path";
import { tmpdir } from "os";

function createTmpDir(): string {
  const dir = resolve(tmpdir(), `ds-pilot-test-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  mkdirSync(dir, { recursive: true });
  return dir;
}

describe("init - skill installation", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir();
    // Create a minimal component so detection works
    mkdirSync(resolve(tmpDir, "src/components"), { recursive: true });
    writeFileSync(resolve(tmpDir, "src/components/Button.tsx"), "export default function Button() {}");
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("installs skill to .claude/skills/ds-pilot-use/SKILL.md", () => {
    const result = runInit(tmpDir);

    expect(result.skillInstalled).toBe(true);
    const skillPath = resolve(tmpDir, ".claude/skills/ds-pilot-use/SKILL.md");
    expect(existsSync(skillPath)).toBe(true);

    const content = readFileSync(skillPath, "utf-8");
    expect(content).toContain("name: ds-pilot-use");
    expect(content).toContain("search_components");
    expect(content).toContain("get_component_props");
    expect(content).toContain("list_tokens");
  });

  it("does not write CLAUDE.md when skill is installed", () => {
    const result = runInit(tmpDir);

    expect(result.skillInstalled).toBe(true);
    expect(result.claudeMdUpdated).toBe(false);
    expect(existsSync(resolve(tmpDir, "CLAUDE.md"))).toBe(false);
  });

  it("still writes .mcp.json", () => {
    const result = runInit(tmpDir);

    expect(result.settingsUpdated).toBe(true);
    const mcpPath = resolve(tmpDir, ".mcp.json");
    expect(existsSync(mcpPath)).toBe(true);

    const config = JSON.parse(readFileSync(mcpPath, "utf-8"));
    expect(config.mcpServers["ds-pilot"]).toBeDefined();
  });

  it("is idempotent - re-running overwrites skill without error", () => {
    runInit(tmpDir);
    const result = runInit(tmpDir);

    expect(result.skillInstalled).toBe(true);
    const skillPath = resolve(tmpDir, ".claude/skills/ds-pilot-use/SKILL.md");
    expect(existsSync(skillPath)).toBe(true);
  });
});

describe("init - CLAUDE.md cleanup", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir();
    mkdirSync(resolve(tmpDir, "src/components"), { recursive: true });
    writeFileSync(resolve(tmpDir, "src/components/Button.tsx"), "export default function Button() {}");
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("removes old ds-pilot section from CLAUDE.md", () => {
    // Simulate old init having written CLAUDE.md
    const oldContent = `# Project\n\nSome existing content.\n\n## Design System\n\nBefore creating a new component, use the \`search_components\` tool to check if a similar component already exists.\nUse \`get_component_props\` to inspect a component's props, types, and defaults before using it.\nUse \`list_tokens\` and \`get_token\` to find design tokens instead of hardcoding colors, spacing, or typography values.\n`;
    writeFileSync(resolve(tmpDir, "CLAUDE.md"), oldContent);

    const result = runInit(tmpDir);

    expect(result.claudeMdCleaned).toBe(true);
    const content = readFileSync(resolve(tmpDir, "CLAUDE.md"), "utf-8");
    expect(content).not.toContain("search_components");
    expect(content).toContain("Some existing content.");
  });

  it("does not touch CLAUDE.md if it has no ds-pilot section", () => {
    const userContent = "# My Project\n\nCustom design system docs.\n";
    writeFileSync(resolve(tmpDir, "CLAUDE.md"), userContent);

    const result = runInit(tmpDir);

    expect(result.claudeMdCleaned).toBe(false);
    const content = readFileSync(resolve(tmpDir, "CLAUDE.md"), "utf-8");
    expect(content).toBe(userContent);
  });

  it("removes CLAUDE.md if it becomes empty after cleanup", () => {
    // CLAUDE.md contains only our section
    const onlyOurSection = `\n## Design System\n\nBefore creating a new component, use the \`search_components\` tool to check if a similar component already exists.\nUse \`get_component_props\` to inspect a component's props, types, and defaults before using it.\nUse \`list_tokens\` and \`get_token\` to find design tokens instead of hardcoding colors, spacing, or typography values.\n`;
    writeFileSync(resolve(tmpDir, "CLAUDE.md"), onlyOurSection);

    const result = runInit(tmpDir);

    expect(result.claudeMdCleaned).toBe(true);
    expect(existsSync(resolve(tmpDir, "CLAUDE.md"))).toBe(false);
  });
});

describe("init - CLAUDE.md fallback", () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = createTmpDir();
    mkdirSync(resolve(tmpDir, "src/components"), { recursive: true });
    writeFileSync(resolve(tmpDir, "src/components/Button.tsx"), "export default function Button() {}");
  });

  afterEach(() => {
    rmSync(tmpDir, { recursive: true, force: true });
  });

  it("falls back to CLAUDE.md when skill installation fails", () => {
    // Create a file at .claude to prevent mkdir from creating the directory
    writeFileSync(resolve(tmpDir, ".claude"), "blocker");

    const result = runInit(tmpDir);

    expect(result.skillInstalled).toBe(false);
    expect(result.claudeMdUpdated).toBe(true);
    expect(existsSync(resolve(tmpDir, "CLAUDE.md"))).toBe(true);
    const content = readFileSync(resolve(tmpDir, "CLAUDE.md"), "utf-8");
    expect(content).toContain("search_components");
  });
});
