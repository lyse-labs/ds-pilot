import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve, join } from "path";
import { globSync } from "glob";

const CLAUDE_MD_SECTION = `
## Design System

Before creating a new component, use the \`search_components\` tool to check if a similar component already exists.
Use \`list_tokens\` and \`get_token\` to find design tokens instead of hardcoding colors, spacing, or typography values.
`;

interface InitResult {
  componentsDir: string;
  tokensFile: string | null;
  claudeMdUpdated: boolean;
  settingsUpdated: boolean;
}

export function runInit(cwd: string = process.cwd()): InitResult {
  const componentsDir = detectComponentsDir(cwd);
  const tokensFile = detectTokensFile(cwd);

  const settingsUpdated = writeSettings(cwd, componentsDir, tokensFile);
  const claudeMdUpdated = updateClaudeMd(cwd);

  return { componentsDir, tokensFile, claudeMdUpdated, settingsUpdated };
}

function detectComponentsDir(cwd: string): string {
  const candidates = [
    "src/components",
    "components",
    "src/ui",
    "app/components",
    "lib/components",
  ];

  for (const dir of candidates) {
    if (existsSync(resolve(cwd, dir))) return `./${dir}`;
  }

  return "./src/components";
}

function detectTokensFile(cwd: string): string | null {
  const candidates = [
    "tokens.json",
    "design-tokens.json",
    "src/tokens.json",
    "src/theme/tokens.json",
    "styles/tokens.json",
    "tokens.css",
    "src/tokens.css",
  ];

  for (const file of candidates) {
    if (existsSync(resolve(cwd, file))) return `./${file}`;
  }

  const found = globSync("**/tokens.{json,css}", {
    cwd,
    ignore: ["node_modules/**"],
    absolute: false,
  });

  return found.length > 0 ? `./${found[0]}` : null;
}

function writeSettings(cwd: string, componentsDir: string, tokensFile: string | null): boolean {
  const settingsDir = resolve(cwd, ".claude");
  const settingsFile = join(settingsDir, "settings.local.json");

  if (!existsSync(settingsDir)) {
    mkdirSync(settingsDir, { recursive: true });
  }

  let settings: Record<string, unknown> = {};
  if (existsSync(settingsFile)) {
    settings = JSON.parse(readFileSync(settingsFile, "utf-8"));
  }

  const mcpServers = (settings.mcpServers as Record<string, unknown>) || {};
  const args = ["ds-context", "serve", "--components", componentsDir];
  if (tokensFile) {
    args.push("--tokens", tokensFile);
  }

  mcpServers["ds-context"] = {
    command: "npx",
    args,
  };

  settings.mcpServers = mcpServers;
  writeFileSync(settingsFile, JSON.stringify(settings, null, 2) + "\n");
  return true;
}

function updateClaudeMd(cwd: string): boolean {
  const claudeMdPath = resolve(cwd, "CLAUDE.md");

  let content = "";
  if (existsSync(claudeMdPath)) {
    content = readFileSync(claudeMdPath, "utf-8");
    if (content.includes("search_components")) {
      return false;
    }
  }

  content += CLAUDE_MD_SECTION;
  writeFileSync(claudeMdPath, content);
  return true;
}
