# mcp-ssb-no

Statistics Norway (SSB) PxWebApi MCP.

Part of [Pipeworx](https://pipeworx.io) — an MCP gateway connecting AI agents to 1866+ live data sources. This is an independent, unofficial integration — not affiliated with, endorsed by, or published by the upstream provider.

## Tools

| Tool | Description |
|------|-------------|
| `subjects` | Navigate the subject tree. Pass a node id path under /table/ (default empty = root list of subjects). Each level returns child nodes ({id, type, text}); type "l" is a folder, "t" is a leaf table whose id is the numeric table id used by table_meta/query_table. e.g. path "" -> subjects, "be" -> Population, "be05" -> Population count tables. |
| `table_meta` | Table definition (variables/dimensions and valid values). id is the numeric SSB table id, e.g. "07459". |
| `query_table` | Pull data from a table. id is the numeric SSB table id; body is a PxWeb query object. Omitted dimensions with elimination collapse; otherwise select values per dimension. |
| `ssb_no_classification` | Look up a Statistics Norway (SSB) KLASS classification (code list) and its correspondences, valid at a date or year. Answers e.g. "which KOSTRA group is Bergen in, 2025?" (id 112 = KOSTRA municipality groups, mapped to id 131 = municipalities by default) and lists all municipalities in a county (code_prefix "46" = Vestland) with their KOSTRA group for each of several years. Other ids: 131 municipalities, 104 counties. Without id lists classifications. Unknown id returns found:false. Source: Statistics Norway (SSB), KLASS classification service. |

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

### What this endpoint actually serves

`tools/list` at `https://gateway.pipeworx.io/ssb-no/mcp` returns the tools in the table
above **plus the shared Pipeworx meta-tools** — `ask_pipeworx`,
`discover_tools`, `search_within`, `remember`/`recall` and the rest of the
gateway-wide set. So the tool count you see is larger than this table: a
single-pack endpoint currently lists roughly 30 shared tools alongside the
pack's own. The connection's `initialize` response states its exact scope, and
is the authoritative answer for a given day.

This is deliberate, not multiplexing by accident. The meta-tools are what let a
scoped connection answer a question this pack does not cover — via
`ask_pipeworx`, which routes across the whole catalog — without you adding a
second MCP server. There is currently no way to mount a pack endpoint without
them; if the extra schemas cost you more context than the routing is worth,
connect to the full gateway once rather than to several pack endpoints.

Or connect to the full Pipeworx gateway to get every pack's tools listed
directly, instead of just this one's:

```json
{
  "mcpServers": {
    "pipeworx": {
      "url": "https://gateway.pipeworx.io/mcp"
    }
  }
}
```

Both URLs reach the same gateway and the same 1866+ data sources. The
only difference is which pack's tools are listed **directly**; `ask_pipeworx`
reaches all of them from either one.

## No MCP client? Call it over HTTP

```bash
curl -X POST https://gateway.pipeworx.io/v1/tools/ssb_no_subjects \
  -H 'Content-Type: application/json' \
  -d '{"path":""}'
```

No account needed for the first calls. Inspect any tool: `GET https://gateway.pipeworx.io/v1/tools/ssb_no_subjects`. Find one: `POST https://gateway.pipeworx.io/v1/tools/search_packs` with `{"query":"..."}`.

## Run it from npm

`@pipeworx/mcp-ssb-no` is a local stdio bridge to the Pipeworx gateway: your MCP client
starts it with `npx`, and it forwards every call to the same
`https://gateway.pipeworx.io/ssb-no/mcp` endpoint shown above. It needs network access;
there is no offline mode.

```json
{
  "mcpServers": {
    "ssb-no": {
      "command": "npx",
      "args": ["-y", "@pipeworx/mcp-ssb-no"]
    }
  }
}
```

Without a key it calls anonymously, capped at 50 calls a day. A free account
raises that to 200 a day: get a key at https://pipeworx.io/signup and add
`"env": { "PIPEWORX_API_KEY": "<your key>" }` to the server entry.
The key is sent as a Bearer token, the same way a hosted connection sends it,
so calls are metered and billed exactly as they are there.

It lists **only** this pack's tools by default. Set `PIPEWORX_META_TOOLS=1` to
also list `ask_pipeworx` and the other gateway-wide tools.

Behind an HTTPS proxy: Node's built-in `fetch` does not read `HTTPS_PROXY` by
default. Newer Node releases honour it when `NODE_USE_ENV_PROXY=1` is set; check
your Node version's documentation.

## Using with ask_pipeworx

Instead of calling tools directly, you can ask questions in plain English —
this works on the pack endpoint above as well as on the full gateway:

```
ask_pipeworx({ question: "your question about Ssb No data" })
```

The gateway picks the right tool and fills the arguments automatically.

## More

- [Docs and guides](https://pipeworx.io/docs)
- [pipeworx.io](https://pipeworx.io)

## License

MIT
