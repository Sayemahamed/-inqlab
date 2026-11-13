import { McpServer } from "@modelcontextprotocol/server";
import { StdioServerTransport } from "@modelcontextprotocol/server/stdio";
import { consola } from "consola";
import { z } from "zod";

import { executeRemoteRpc, updateProjectPath } from "./api";
import { resolveBranch } from "./config";
import { MCP_SERVER_NAME, MCP_SERVER_VERSION } from "./constants";
import { SKILLS_GUIDE } from "./skills";

/**
 * Starts the Model Context Protocol server over stdio transport.
 * Dynamically resolves the active branch on every tool call using the hierarchical branch registry.
 */
export async function startMcpServer(options: {
  apiKey: string;
  projectSlug: string;
  branchOverride?: string;
}): Promise<void> {
  // Redirect stdout to stderr to protect JSON-RPC stdio protocol integrity
  consola.options.stdout = process.stderr;
  console.log = (...data: unknown[]) => console.error(...data);

  const { apiKey, projectSlug, branchOverride } = options;

  const server = new McpServer({
    name: MCP_SERVER_NAME,
    version: MCP_SERVER_VERSION,
  });

  async function callRemote(toolName: string, args: Record<string, unknown>) {
    const activeBranch = resolveBranch(projectSlug, branchOverride);
    try {
      const res = await executeRemoteRpc(
        apiKey,
        projectSlug,
        activeBranch,
        toolName,
        args,
      );
      return res;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      return {
        content: [
          {
            type: "text",
            text: `Remote MCP server error: ${message}`,
          },
        ],
        isError: true,
      };
    }
  }

  // 1. getArchitectureContext
  server.registerTool(
    "getArchitectureContext",
    {
      description:
        "Retrieve architectural graph context for the active branch. When 'node' is omitted, returns the entire system graph (all nodes, metadata, contracts, and directional edges). When 'node' is provided, returns a focused dependency subgraph containing that node, its upstream callers, downstream callees, and connecting contracts up to specified depth.",
      inputSchema: z.object({
        node: z
          .string()
          .optional()
          .describe(
            "Optional focal node relativePath or symbol identifier (e.g. 'server/api/users.get.ts' or 'src/services/user.ts#getUser').",
          ),
        depth: z
          .number()
          .int()
          .min(1)
          .max(3)
          .optional()
          .default(1)
          .describe(
            "Traversal depth when 'node' is provided (default: 1, direct callers and callees). Max: 3.",
          ),
        direction: z
          .enum(["both", "upstream", "downstream"])
          .optional()
          .default("both")
          .describe(
            "Traversal direction from focal node: 'upstream' (callers), 'downstream' (callees), or 'both'.",
          ),
        branchName: z
          .string()
          .optional()
          .describe(
            "Optional branch override. If omitted, queries the project's active branch.",
          ),
      }),
    },
    async (args) => callRemote("getArchitectureContext", args),
  );

  // 2. batchAddNodes
  server.registerTool(
    "batchAddNodes",
    {
      description:
        "Record or update multiple code entities (files, functions, classes, components, routes) in a single atomic tool call. Always specify 'group' ('api', 'function', 'db', 'service', 'component', 'middleware', 'model', 'hook', 'config') in data for visualization.",
      inputSchema: z.object({
        nodes: z
          .array(
            z.object({
              relativePath: z
                .string()
                .describe(
                  "Relative file path or qualified identifier of the node, e.g. 'src/auth/login.ts' or 'src/services/user.ts#getUser'",
                ),
              data: z
                .union([z.record(z.string(), z.unknown()), z.string()])
                .optional()
                .describe(
                  "Node metadata JSON object or stringified JSON (e.g. { line: 20, name: 'login', group: 'api' }). 'line' is the 1-based start line number in source file for IDE jump navigation.",
                ),
              parameter: z
                .union([
                  z.enum(["void", "drop"]),
                  z.record(z.string(), z.unknown()),
                  z.string(),
                ])
                .nullable()
                .optional()
                .describe(
                  "Node parameters contract: 'void' if parameters are unchanged, 'drop' to clear, or a parameters object (e.g. { email: 'string' }).",
                ),
            }),
          )
          .min(1)
          .max(50)
          .describe("Array of node activity objects to record (1 to 50 nodes)"),
      }),
    },
    async (args) => callRemote("batchAddNodes", args),
  );

  // 3. batchAddEdges
  server.registerTool(
    "batchAddEdges",
    {
      description:
        "Record multiple directional architectural connections (dependencies, calls, imports, queries) in a single atomic tool call with target parameter contract validation.",
      inputSchema: z.object({
        edges: z
          .array(
            z.object({
              from: z
                .string()
                .describe(
                  "Source node relativePath (must already be registered in the branch)",
                ),
              to: z
                .string()
                .describe(
                  "Target node relativePath (must already be registered in the branch)",
                ),
              connectionType: z
                .string()
                .describe(
                  "Type of relationship, e.g. 'function_call', 'imports', 'depends_on', 'writes_to', 'renders', 'implements'",
                ),
              devNote: z
                .string()
                .nullable()
                .optional()
                .describe(
                  "Optional developer note explaining the purpose, constraints, or flow of this connection",
                ),
              parameter: z
                .union([
                  z.enum(["void", "drop"]),
                  z.record(z.string(), z.unknown()),
                  z.string(),
                ])
                .nullable()
                .optional()
                .describe(
                  "Arguments/parameters passed along this connection matching the target node contract.",
                ),
            }),
          )
          .min(1)
          .max(50)
          .describe("Array of edge activity objects to record (1 to 50 edges)"),
      }),
    },
    async (args) => callRemote("batchAddEdges", args),
  );

  // 4. retract
  server.registerTool(
    "retract",
    {
      description:
        "Undo and permanently delete recent activity entries recorded on the active branch, decrementing the branch activity counter.",
      inputSchema: z.object({
        steps: z
          .number()
          .int()
          .min(1)
          .optional()
          .describe("Number of recent activities to undo (defaults to 1)."),
      }),
    },
    async (args) => callRemote("retract", args),
  );

  // 5. skills
  server.registerTool(
    "skills",
    {
      description:
        "Get comprehensive instructions, workflow rules, node group taxonomy, parameter conventions, and best practices for CartoCode architectural journaling.",
      inputSchema: z.object({}),
    },
    async () => ({
      content: [
        {
          type: "text",
          text: SKILLS_GUIDE,
        },
      ],
    }),
  );

  // Auto-link current working directory path to project
  try {
    const cwd = process.cwd();
    await updateProjectPath(apiKey, projectSlug, cwd);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error("Warning: failed to auto-register project path:", message);
  }

  // Connect stdio transport
  const transport = new StdioServerTransport();
  await server.connect(transport);
}
