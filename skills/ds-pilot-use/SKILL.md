---
name: ds-pilot-use
description: "Use when creating or modifying UI components — always check the design system for existing components and tokens before writing code"
---

# ds-pilot: Design System Tools

Before writing UI code, use the design system MCP tools:

- **Before creating a component** — call `search_components` to check if a similar component already exists. If one does, inform the user and suggest using it instead of creating a duplicate.
- **Before modifying a component** — call `get_component_props` to understand its current props, defaults, and variants.
- **Before hardcoding a value** (color, spacing, font size, etc.) — call `list_tokens` or `get_token` to find the corresponding design token.
