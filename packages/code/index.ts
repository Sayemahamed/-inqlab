#!/usr/bin/env node
import { defineCommand, runMain } from "citty";
import { consola } from "consola";

import {
  runBranchCommand,
  runLoginCommand,
  runProjectCommand,
  runTestCommand,
  runWorkspaceCommand,
} from "./commands";
import { checkCliVersion, loadConfig } from "./config";
import { CLI_VERSION } from "./constants";
import { startMcpServer } from "./mcp";

function resolveApiKey(overrideKey?: string): string {
  const config = loadConfig();
  const apiKey =
    overrideKey || process.env.CARTOCODE_API_KEY || config.apiKey;

  if (!apiKey) {
    consola.error("Missing API key.");
    consola.info(
      "Please run 'npx @inqlab/code login' to authenticate, or provide --api-key <key>.\n",
    );
    process.exit(1);
  }
  return apiKey;
}

const loginCmd = defineCommand({
  meta: {
    name: "login",
    description: "Authenticate via browser and store API key",
  },
  async run() {
    await runLoginCommand();
  },
});

const workspaceListCmd = defineCommand({
  meta: {
    name: "list",
    description: "List accessible workspaces",
  },
  args: {
    apiKey: {
      type: "string",
      alias: "k",
      description: "Override API key",
    },
  },
  async run({ args }) {
    const key = resolveApiKey(args.apiKey);
    await runWorkspaceCommand(key, "list", {});
  },
});

const workspaceCreateCmd = defineCommand({
  meta: {
    name: "create",
    description: "Create a new workspace",
  },
  args: {
    name: {
      type: "positional",
      description: "Workspace name",
      required: true,
    },
    description: {
      type: "string",
      alias: "d",
      description: "Workspace description",
    },
    apiKey: {
      type: "string",
      alias: "k",
      description: "Override API key",
    },
  },
  async run({ args }) {
    const key = resolveApiKey(args.apiKey);
    await runWorkspaceCommand(key, "create", {
      name: args.name,
      description: args.description,
    });
  },
});

const workspaceCmd = defineCommand({
  meta: {
    name: "workspace",
    description: "Manage CartoCode workspaces",
  },
  subCommands: {
    list: workspaceListCmd,
    create: workspaceCreateCmd,
  },
});

const projectListCmd = defineCommand({
  meta: {
    name: "list",
    description: "List projects (all or filtered by workspace)",
  },
  args: {
    workspace: {
      type: "positional",
      description: "Workspace slug (optional filter)",
      required: false,
    },
    apiKey: {
      type: "string",
      alias: "k",
      description: "Override API key",
    },
  },
  async run({ args }) {
    const key = resolveApiKey(args.apiKey);
    await runProjectCommand(key, "list", {
      workspaceSlug: args.workspace,
    });
  },
});

const projectCreateCmd = defineCommand({
  meta: {
    name: "create",
    description: "Create a project in a workspace",
  },
  args: {
    name: {
      type: "positional",
      description: "Project name",
      required: true,
    },
    workspace: {
      type: "string",
      alias: "w",
      description: "Target workspace slug",
      required: true,
    },
    description: {
      type: "string",
      alias: "d",
      description: "Project description",
    },
    readme: {
      type: "string",
      description: "Project README text",
    },
    apiKey: {
      type: "string",
      alias: "k",
      description: "Override API key",
    },
  },
  async run({ args }) {
    const key = resolveApiKey(args.apiKey);
    await runProjectCommand(key, "create", {
      name: args.name,
      workspaceSlug: args.workspace,
      description: args.description,
      readme: args.readme,
    });
  },
});

const projectPathCmd = defineCommand({
  meta: {
    name: "path",
    description: "Link local repository path for IDE navigation",
  },
  args: {
    project: {
      type: "string",
      alias: "p",
      description: "Project slug",
      required: true,
    },
    path: {
      type: "positional",
      description: "Local repository path (defaults to cwd)",
      required: false,
    },
    apiKey: {
      type: "string",
      alias: "k",
      description: "Override API key",
    },
  },
  async run({ args }) {
    const key = resolveApiKey(args.apiKey);
    await runProjectCommand(key, "path", {
      projectSlug: args.project,
      targetPath: args.path,
    });
  },
});

const projectCmd = defineCommand({
  meta: {
    name: "project",
    description: "Manage CartoCode projects",
  },
  subCommands: {
    list: projectListCmd,
    create: projectCreateCmd,
    path: projectPathCmd,
  },
});

const branchListCmd = defineCommand({
  meta: {
    name: "list",
    description: "List branches and activity counts",
  },
  args: {
    project: {
      type: "string",
      alias: "p",
      description: "Project slug",
      required: true,
    },
    apiKey: {
      type: "string",
      alias: "k",
      description: "Override API key",
    },
  },
  async run({ args }) {
    const key = resolveApiKey(args.apiKey);
    await runBranchCommand(key, "list", {
      projectSlug: args.project,
    });
  },
});

const branchCreateCmd = defineCommand({
  meta: {
    name: "create",
    description: "Fork branch copying state from active branch",
  },
  args: {
    name: {
      type: "positional",
      description: "Branch name to create",
      required: true,
    },
    project: {
      type: "string",
      alias: "p",
      description: "Project slug",
      required: true,
    },
    from: {
      type: "string",
      description: "Source branch to copy from",
    },
    apiKey: {
      type: "string",
      alias: "k",
      description: "Override API key",
    },
  },
  async run({ args }) {
    const key = resolveApiKey(args.apiKey);
    await runBranchCommand(key, "create", {
      projectSlug: args.project,
      branchName: args.name,
      fromBranch: args.from,
    });
  },
});

const branchSwitchCmd = defineCommand({
  meta: {
    name: "switch",
    description: "Switch active branch",
  },
  args: {
    name: {
      type: "positional",
      description: "Target branch name to switch to",
      required: true,
    },
    project: {
      type: "string",
      alias: "p",
      description: "Project slug",
      required: true,
    },
    apiKey: {
      type: "string",
      alias: "k",
      description: "Override API key",
    },
  },
  async run({ args }) {
    const key = resolveApiKey(args.apiKey);
    await runBranchCommand(key, "switch", {
      projectSlug: args.project,
      branchName: args.name,
    });
  },
});

const branchCmd = defineCommand({
  meta: {
    name: "branch",
    description: "Manage CartoCode branches",
  },
  subCommands: {
    list: branchListCmd,
    create: branchCreateCmd,
    switch: branchSwitchCmd,
  },
});

const testCmd = defineCommand({
  meta: {
    name: "test",
    description: "Verify API key, project access & metrics",
  },
  args: {
    project: {
      type: "string",
      alias: "p",
      description: "Project slug",
      required: true,
    },
    branch: {
      type: "string",
      alias: "b",
      description: "Branch override",
    },
    apiKey: {
      type: "string",
      alias: "k",
      description: "Override API key",
    },
  },
  async run({ args }) {
    const key = resolveApiKey(args.apiKey);
    await runTestCommand(
      key,
      args.project,
      args.branch || process.env.CARTOCODE_BRANCH,
    );
  },
});

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
      description: "Project slug in CartoCode",
    },
    workspace: {
      type: "string",
      alias: "w",
      description: "Workspace slug in CartoCode",
    },
    branch: {
      type: "string",
      alias: "b",
      description: "Target branch override (defaults to active branch)",
    },
    apiKey: {
      type: "string",
      alias: "k",
      description: "Override API key",
    },
  },
  subCommands: {
    login: loginCmd,
    workspace: workspaceCmd,
    ws: workspaceCmd,
    project: projectCmd,
    proj: projectCmd,
    branch: branchCmd,
    br: branchCmd,
    path: projectPathCmd,
    test: testCmd,
    status: testCmd,
  },
  async run({ args }) {
    // Evaluate 3-level version update policy
    await checkCliVersion({ force: false, isMcp: args.mcp });

    // Model Context Protocol stdio server mode
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
      return;
    }
  },
});

runMain(main);
