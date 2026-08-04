# mcp-ssb-no

Statistics Norway (SSB) PxWebApi MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1394+ live data sources.

## Tools

| Tool | Description |
|------|-------------|
| `subjects` | Navigate the subject tree. Pass a node id path under /table/ (default empty = root list of subjects). Each level returns child nodes ({id, type, text}); type "l" is a folder, "t" is a leaf table whose id is the numeric table id used by table_meta/query_table. e.g. path "" -> subjects, "be" -> Population, "be05" -> Population count tables. |
| `table_meta` | Table definition (variables/dimensions and valid values). id is the numeric SSB table id, e.g. "07459". |
| `query_table` | Pull data from a table. id is the numeric SSB table id; body is a PxWeb query object. Omitted dimensions with elimination collapse; otherwise select values per dimension. |

## Quick Start

Add to your MCP client (Claude Desktop, Cursor, Windsurf, etc.):

```json
{
  "mcpServers": {
    "ssb-no": {
      "url": "https://gateway.pipeworx.io/ssb-no/mcp"
    }
  }
}
```

Or connect to the full Pipeworx gateway for access to all 1394+ data sources:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English:

```
ask_pipeworx({ question: "your question about Ssb No data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
