# @ferroui/mcp-server

Model Context Protocol (MCP) server that exposes FerroUI tools and layout generation to any MCP-compatible AI client (Claude Desktop, Cursor, Continue, etc.).

## Tools

| Tool | Description |
|---|---|
| `ferroui_generate_layout` | Generate a FerroUI layout from a natural-language prompt via the dual-phase pipeline |
| `ferroui_validate_layout` | Validate any FerroUI layout JSON against schema + tier rules |
| `ferroui_list_tools` | List registered FerroUI backend tools and their parameter schemas |
| `ferroui_list_components` | List known components with tier classification |

## Resources

| URI | Description |
|---|---|
| `ferroui://schema` | JSON Schema for the FerroUILayout type |
| `ferroui://components` | Component registry manifest with tier info |

## Usage

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "ferroui": {
      "command": "node",
      "args": ["/path/to/FerroUI/packages/mcp-server/dist/index.js"],
      "env": {
        "ANTHROPIC_API_KEY": "your-key",
        "LLM_PROVIDER": "anthropic"
      }
    }
  }
}
```

### Build & Run

```bash
pnpm --filter @ferroui/mcp-server build
node packages/mcp-server/dist/index.js
```

### Environment Variables

| Variable | Default | Description |
|---|---|---|
| `LLM_PROVIDER` | `anthropic` | `anthropic` or `openai` |
| `ANTHROPIC_API_KEY` | — | Required when using Anthropic |
| `OPENAI_API_KEY` | — | Required when using OpenAI |
