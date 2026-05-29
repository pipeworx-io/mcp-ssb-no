interface McpToolDefinition {
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

interface McpToolExport {
  tools: McpToolDefinition[];
  callTool: (name: string, args: Record<string, unknown>) => Promise<unknown>;
  meter?: { credits: number };
  cost?: Record<string, unknown>;
  provider?: string;
}

/**
 * Statistics Norway (SSB) PxWebApi MCP.
 *
 * SSB serves all tables under a single /table/ namespace. Navigation walks the
 * subject tree by appending node ids to /table/ (e.g. "" -> root, "be" ->
 * Population, "be05" -> Population count). Leaf nodes are numeric table ids
 * (e.g. "07459"). GET /table/{id} returns the table metadata; POST /table/{id}
 * with a PxWeb query body returns the data.
 */


const BASE = 'https://data.ssb.no/api/v0/en/table';
const UA = 'pipeworx-mcp-ssb-no/1.0 (+https://pipeworx.io)';

const tools: McpToolExport['tools'] = [
  {
    name: 'subjects',
    description:
      'Navigate the subject tree. Pass a node id path under /table/ (default empty = root list of subjects). Each level returns child nodes ({id, type, text}); type "l" is a folder, "t" is a leaf table whose id is the numeric table id used by table_meta/query_table. e.g. path "" -> subjects, "be" -> Population, "be05" -> Population count tables.',
    inputSchema: {
      type: 'object',
      properties: { path: { type: 'string', description: 'Sub-path under /table/ (default empty = root). e.g. "be" or "be05".' } },
    },
  },
  {
    name: 'table_meta',
    description: 'Table definition (variables/dimensions and valid values). id is the numeric SSB table id, e.g. "07459".',
    inputSchema: {
      type: 'object',
      properties: { id: { type: 'string', description: 'Numeric table id, e.g. "07459".' } },
      required: ['id'],
    },
  },
  {
    name: 'query_table',
    description:
      'Pull data from a table. id is the numeric SSB table id; body is a PxWeb query object. Omitted dimensions with elimination collapse; otherwise select values per dimension.',
    inputSchema: {
      type: 'object',
      properties: {
        id: { type: 'string', description: 'Numeric table id, e.g. "07459".' },
        body: {
          type: 'object',
          description:
            '{query: [{code, selection: {filter: "item", values: [...]}}], response: {format: "json-stat2"}}',
        },
      },
      required: ['id', 'body'],
    },
  },
];

async function callTool(name: string, args: Record<string, unknown>): Promise<unknown> {
  switch (name) {
    case 'subjects': {
      const path = (args.path as string | undefined)?.replace(/^\/+|\/+$/g, '') ?? '';
      return ssbGet(path ? `/${path}` : '');
    }
    case 'table_meta':
      return ssbGet(`/${reqStr(args, 'id', '"07459"').replace(/^\/+|\/+$/g, '')}`);
    case 'query_table': {
      const id = reqStr(args, 'id', '"07459"').replace(/^\/+|\/+$/g, '');
      const body = args.body;
      if (!body || typeof body !== 'object') throw new Error('body must be a PxWeb query object.');
      const res = await fetch(`${BASE}/${id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json', 'User-Agent': UA },
        body: JSON.stringify(body),
      });
      if (!res.ok) throw new Error(`SSB: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
      return res.json();
    }
    default:
      throw new Error(`Unknown tool: ${name}`);
  }
}

async function ssbGet(path: string): Promise<unknown> {
  const res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json', 'User-Agent': UA } });
  if (!res.ok) throw new Error(`SSB: ${res.status} ${await res.text().then((t) => t.slice(0, 200))}`);
  return res.json();
}

function reqStr(args: Record<string, unknown>, key: string, example: string): string {
  const v = args[key];
  if (typeof v !== 'string' || !v.trim()) throw new Error(`Required argument "${key}" is missing. Pass a string like ${example}.`);
  return v;
}

export default { tools, callTool, meter: { credits: 1 } } satisfies McpToolExport;
