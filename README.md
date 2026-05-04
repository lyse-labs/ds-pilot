# ds-pilot

MCP server that exposes your design system (components + tokens) to AI agents. Prevents the agent from creating duplicate components or hardcoding values that should be tokens.

## Install

```bash
npx ds-pilot init
```

This will:
- Detect your components directory and tokens file
- Configure the MCP server in `.claude/settings.local.json`
- Add design system instructions to your `CLAUDE.md`

## Usage

### MCP Server (for AI agents)

```bash
npx ds-pilot serve --components ./src/components --tokens ./tokens.json
```

Once configured, your AI agent can:
- `search_components("button")` — find existing components
- `get_component_props("Button")` — see props, types, defaults
- `list_tokens("color")` — list all color tokens
- `get_token("color.primary")` — get a specific token value

### CLI (for you)

```bash
# List all components
npx ds-pilot list components --dir ./src/components

# List tokens filtered by type
npx ds-pilot list tokens --file ./tokens.json --type color

# Search components
npx ds-pilot search button --dir ./src/components

# Show component props
npx ds-pilot props Button --dir ./src/components
```

## Supported Formats

### Components
- React (`.tsx`, `.ts`, `.jsx`, `.js`)
- Vue / Nuxt (`.vue` with `<script setup lang="ts">`)
- Props with types, defaults, and structured variants
- Named and default exports

### Tokens
- DTCG JSON (W3C standard)
- Plain nested JSON (Figma export)
- CSS Custom Properties
- Alias resolution and group metadata

## How It Works

1. **Scanner** reads your codebase and extracts component names, props, and token values
2. **MCP Server** exposes this data as tools an AI agent can call
3. **CLAUDE.md** instructions tell the agent to check for existing components before creating new ones

The agent stops guessing and starts reusing.

## License

MIT
