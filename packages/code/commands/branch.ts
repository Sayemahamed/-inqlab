import { defineCommand } from "citty";
import { consola } from "consola";

import { createBranch, listBranches } from "../api";
import { setActiveBranch } from "../config";
import { resolveApiKey } from "../utils/auth";

export const branchListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List branches and activity counts",
  },
  args: {
    project: {
      type: "string",
      alias: "p",
      valueHint: "slug",
      description: "Project slug",
      required: true,
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
    const branches = await listBranches(key, args.project);
    if (branches.length === 0) {
      consola.warn(
        `No branches found for project '${args.project}'. Create one with: npx @inqlab/code branch create <name> -p ${args.project}`,
      );
      return;
    }

    consola.info(`Branches for project '${args.project}' (${branches.length}):`);
    for (const b of branches) {
      const parentStr = b.parentBranchId
        ? `[parent: ${b.parentBranchId}]`
        : "";
      console.log(
        `  • ${b.name.padEnd(25)} (${b.activityCount} activities) ${parentStr}`.trimEnd(),
      );
    }
  },
});

export const branchCreateCommand = defineCommand({
  meta: {
    name: "create",
    description: "Fork branch copying state from active branch",
  },
  args: {
    name: {
      type: "positional",
      valueHint: "name",
      description: "Branch name to create",
      required: true,
    },
    project: {
      type: "string",
      alias: "p",
      valueHint: "slug",
      description: "Project slug",
      required: true,
    },
    from: {
      type: "string",
      valueHint: "branch",
      description: "Source branch to copy from (defaults to active branch)",
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
    const result = await createBranch(
      key,
      args.project,
      args.name,
      args.from,
    );
    consola.success(`Branch '${result.branch}' created successfully!`);
    consola.info(`Parent:     ${result.parentBranch}`);
    consola.info(`Activities: ${result.activityCount}`);
    consola.info(
      `Switch to it now:\n  npx @inqlab/code branch switch ${result.branch} -p ${args.project}`,
    );
  },
});

export const branchSwitchCommand = defineCommand({
  meta: {
    name: "switch",
    description: "Switch active branch",
  },
  args: {
    name: {
      type: "positional",
      valueHint: "name",
      description: "Target branch name to switch to",
      required: true,
    },
    project: {
      type: "string",
      alias: "p",
      valueHint: "slug",
      description: "Project slug",
      required: true,
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
    const branches = await listBranches(key, args.project);
    const found = branches.find((b) => b.name === args.name);
    if (!found) {
      consola.warn(
        `Branch '${args.name}' was not found in project '${args.project}'.`,
      );
      consola.info(
        `To create it, run: npx @inqlab/code branch create ${args.name} -p ${args.project}`,
      );
    }

    setActiveBranch(args.project, args.name);
    consola.success(
      `Active branch for '${args.project}' set to '${args.name}'`,
    );
    consola.box(
      `Active branch set to '${args.name}'.\n\nModel Context Protocol sessions targeting '${args.project}' will automatically route to '${args.name}' without restarting your editor.`,
    );
  },
});

export const branchCommand = defineCommand({
  meta: {
    name: "branch",
    description: "Manage CartoCode branches",
  },
  subCommands: {
    list: branchListCommand,
    create: branchCreateCommand,
    switch: branchSwitchCommand,
  },
});
