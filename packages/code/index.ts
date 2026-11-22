#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import { consola } from "consola";

import { branchCommand } from "./commands/branch";
import { loginCommand } from "./commands/login";
import { projectCommand, projectPathCommand } from "./commands/project";
import { testCommand } from "./commands/test";
import { workspaceCommand } from "./commands/workspace";
import { checkCliVersion } from "./config";
import { CLI_VERSION } from "./constants";
import { startMcpServer } from "./mcp";
import { resolveApiKey } from "./utils/auth";

const main = defineCommand({
  meta: {
    name: "cartocode",
    version: CLI_VERSION,
    description:
      "CartoCode Architecture Graph Engine & Model Context Protocol Gateway",
  },
  args: {
    mcp: {
      type: "boolean",
      description: "Start stdio MCP server for Cursor / Claude",
    },
    project: {
      type: "string",
      alias: "p",
      valueHint: "slug",
      description: "Project slug in CartoCode",
    },
    workspace: {
      type: "string",
      alias: "w",
      valueHint: "slug",
      description: "Workspace slug in CartoCode",
    },
    branch: {
      type: "string",
      alias: "b",
      valueHint: "name",
      description: "Target branch override (defaults to active branch)",
    },
    apiKey: {
      type: "string",
      alias: "k",
      valueHint: "key",
      description: "Override API key",
    },
  },
  subCommands: {
    login: loginCommand,
    workspace: workspaceCommand,
    ws: workspaceCommand,
    project: projectCommand,
    proj: projectCommand,
    branch: branchCommand,
    br: branchCommand,
    path: projectPathCommand,
    test: testCommand,
    status: testCommand,
  },
  async setup({ args }) {
    await checkCliVersion({ force: false, isMcp: args.mcp });
  },
  async run({ args }) {
    if (args.mcp) {
      const apiKey = resolveApiKey(args.apiKey);
      const projectSlug = args.project || process.env.CARTOCODE_PROJECT;
      if (!projectSlug) {
        consola.error("Missing project slug.");
        consola.info(
          "Specify the project using --project <slug> (or -p <slug>).\n",
        );
        process.exit(1);
      }

      await startMcpServer({
        apiKey,
        projectSlug,
        branchOverride: args.branch || process.env.CARTOCODE_BRANCH,
      });
    }
  },
});

runMain(main);
