import { readFileSync } from "fs";
import { extname } from "path";

export interface Token {
  name: string;
  value: string;
  type: string;
}

interface DTCGNode {
  $value?: string;
  $type?: string;
  [key: string]: unknown;
}

export function parseTokens(filePath: string): Token[] {
  const ext = extname(filePath);

  if (ext !== ".json" && ext !== ".css") {
    throw new Error(`Unsupported token file format: ${ext}. Use .json (DTCG) or .css`);
  }

  const content = readFileSync(filePath, "utf-8");

  if (ext === ".json") {
    return parseDTCG(JSON.parse(content));
  }

  if (ext === ".css") {
    return parseCSS(content);
  }

  return [];
}

function parseDTCG(obj: Record<string, unknown>, prefix = ""): Token[] {
  const tokens: Token[] = [];

  for (const [key, value] of Object.entries(obj)) {
    if (key.startsWith("$")) continue;

    const path = prefix ? `${prefix}.${key}` : key;
    const node = value as DTCGNode;

    if (node.$value !== undefined) {
      tokens.push({
        name: path,
        value: String(node.$value),
        type: String(node.$type || "unknown"),
      });
    } else if (typeof node === "object" && node !== null) {
      tokens.push(...parseDTCG(node as Record<string, unknown>, path));
    }
  }

  return tokens;
}

function parseCSS(content: string): Token[] {
  const tokens: Token[] = [];
  const stripped = content.replace(/\/\*[\s\S]*?\*\//g, "");
  const regex = /--([\w-]+)\s*:\s*([^;]+);/g;
  let match;

  while ((match = regex.exec(stripped)) !== null) {
    const rawName = match[1];
    const value = match[2].trim();
    const name = rawName.replace(/-/g, ".");

    let type = "unknown";
    if (value.startsWith("#") || value.startsWith("rgb") || value.startsWith("hsl")) {
      type = "color";
    } else if (value.endsWith("px") || value.endsWith("rem") || value.endsWith("em")) {
      type = "dimension";
    } else if (/^[\d.]+$/.test(value)) {
      type = "number";
    } else {
      type = "string";
    }

    tokens.push({ name, value, type });
  }

  return tokens;
}
