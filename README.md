# ds-context

MCP server that exposes your design system (components + tokens) to AI agents. Prevents the agent from creating duplicate components or hardcoding values that should be tokens.

## Install

```bash
npx ds-context init
```

This will:
- Detect your components directory and tokens file
- Configure the MCP server in `.claude/settings.local.json`
- Add design system instructions to your `CLAUDE.md`

## Usage

### MCP Server (for AI agents)

```bash
npx ds-context serve --components ./src/components --tokens ./tokens.json
```

Once configured, your AI agent can:
- `search_components("button")` — find existing components
- `get_component_props("Button")` — see props, types, defaults
- `list_tokens("color")` — list all color tokens
- `get_token("color.primary")` — get a specific token value

### CLI (for you)

```bash
# List all components
npx ds-context list components --dir ./src/components

# List tokens filtered by type
npx ds-context list tokens --file ./tokens.json --type color

# Search components
npx ds-context search button --dir ./src/components

# Show component props
npx ds-context props Button --dir ./src/components
```

## Supported Formats

### Components
- React (`.tsx`, `.ts`, `.jsx`)
- Named and default exports
- Props extracted via TypeScript AST

### Tokens
- DTCG JSON (W3C standard)
- CSS Custom Properties

## How It Works

1. **Scanner** reads your codebase and extracts component names, props, and token values
2. **MCP Server** exposes this data as tools an AI agent can call
3. **CLAUDE.md** instructions tell the agent to check for existing components before creating new ones

The agent stops guessing and starts reusing.

## License

MIT
