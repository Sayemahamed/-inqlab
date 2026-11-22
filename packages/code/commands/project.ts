import { defineCommand } from "citty";
import { consola } from "consola";

import { createProject, listProjects, updateProjectPath } from "../api";
import { resolveApiKey } from "../utils/auth";

export const projectListCommand = defineCommand({
  meta: {
    name: "list",
    description: "List projects (all or filtered by workspace)",
  },
  args: {
    workspace: {
      type: "string",
      alias: "w",
      valueHint: "slug",
      description: "Filter by workspace slug",
      required: false,
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
    const projects = await listProjects(key, args.workspace);
    if (projects.length === 0) {
      consola.warn(
        "No projects found. Create one using: npx @inqlab/code project create <name> --workspace <slug>",
      );
      return;
    }

    consola.info(`Your Projects (${projects.length}):`);
    for (const p of projects) {
      const wsStr = p.workspaceName
        ? `[workspace: ${p.workspaceName}]`
        : p.workspaceSlug
          ? `[workspace: ${p.workspaceSlug}]`
          : "";
      console.log(
        `  • ${p.name.padEnd(25)} [slug: ${p.slug}]  ${wsStr}`.trimEnd(),
      );
    }
  },
});

export const projectCreateCommand = defineCommand({
  meta: {
    name: "create",
    description: "Create a project in a workspace",
  },
  args: {
    name: {
      type: "positional",
      valueHint: "name",
      description: "Project name",
      required: true,
    },
    workspace: {
      type: "string",
      alias: "w",
      valueHint: "slug",
      description: "Target workspace slug",
      required: true,
    },
    description: {
      type: "string",
      alias: "d",
      valueHint: "text",
      description: "Project description",
    },
    readme: {
      type: "string",
      valueHint: "text",
      description: "Project README text",
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
    const proj = await createProject(
      key,
      args.workspace,
      args.name,
      args.description,
      args.readme,
    );
    consola.success("Project created successfully!");
    consola.info(`Name: ${proj.name}`);
    consola.info(`Slug: ${proj.slug}`);
    consola.info(
      `Link your local repo to this project:\n  npx @inqlab/code project path ${proj.slug} /path/to/repo`,
    );
  },
});

export const projectPathCommand = defineCommand({
  meta: {
    name: "path",
    description: "Link local repository path for IDE navigation",
  },
  args: {
    project: {
      type: "string",
      alias: "p",
      valueHint: "slug",
      description: "Project slug",
      required: true,
    },
    path: {
      type: "positional",
      valueHint: "path",
      description: "Local repository path (defaults to current working directory)",
      required: false,
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
    const targetPath = args.path || process.cwd();
    const result = await updateProjectPath(key, args.project, targetPath);
    consola.success("Repository path linked successfully!");
    consola.info(`Project: ${result.project}`);
    consola.info(`Path:    ${result.path}`);
  },
});

export const projectCommand = defineCommand({
  meta: {
    name: "project",
    description: "Manage CartoCode projects",
  },
  subCommands: {
    list: projectListCommand,
    create: projectCreateCommand,
    path: projectPathCommand,
  },
});
