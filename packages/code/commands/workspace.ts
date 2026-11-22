import { defineCommand } from "citty";
import { consola } from "consola";

import { createWorkspace, listWorkspaces } from "../api";
import { resolveApiKey } from "../utils/auth";

export const workspaceListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List accessible workspaces",
  },
  args: {
    apiKey: {
      type: "string",
      alias: "k",
      valueHint: "key",
      description: "Override API key",
    },
  },
  async run({ args }) {
    const key = resolveApiKey(args.apiKey);
    const workspaces = await listWorkspaces(key);
    if (workspaces.length === 0) {
      consola.warn(
        "No workspaces found. Create one using: npx @inqlab/code workspace create <name>",
      );
      return;
    }

    consola.info(`Your Workspaces (${workspaces.length}):`);
    for (const w of workspaces) {
      const roleStr = w.role ? `(Role: ${w.role})` : "";
      console.log(
        `  • ${w.name.padEnd(25)} [slug: ${w.slug}]  ${roleStr}`.trimEnd(),
      );
    }
  },
});

export const workspaceCreateCommand = defineCommand({
  meta: {
    name: "create",
    description: "Create a new workspace",
  },
  args: {
    name: {
      type: "positional",
      valueHint: "name",
      description: "Workspace name",
      required: true,
    },
    description: {
      type: "string",
      alias: "d",
      valueHint: "text",
      description: "Workspace description",
    },
    apiKey: {
      type: "string",
      alias: "k",
      valueHint: "key",
      description: "Override API key",
    },
  },
  async run({ args }) {
    const key = resolveApiKey(args.apiKey);
    const ws = await createWorkspace(key, args.name, args.description);
    consola.success("Workspace created successfully!");
    consola.info(`Name: ${ws.name}`);
    consola.info(`Slug: ${ws.slug}`);
    consola.info(
      `Create your first project in this workspace:\n  npx @inqlab/code project create "My Project" --workspace ${ws.slug}`,
    );
  },
});

export const workspaceCommand = defineCommand({
  meta: {
    name: "workspace",
    description: "Manage CartoCode workspaces",
  },
  subCommands: {
    list: workspaceListCommand,
    create: workspaceCreateCommand,
  },
});
