#!/usr/bin/env bun
import { consola } from "consola";
import { colors } from "consola/utils";

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

interface ParsedArgs {
  command?: string;
  subcommand?: string;
  name?: string;
  workspace?: string;
  project?: string;
  branch?: string;
  from?: string;
  path?: string;
  apiKey?: string;
  description?: string;
  readme?: string;
  mcp: boolean;
  help: boolean;
}

function parseCliArgs(argv: string[]): ParsedArgs {
  const parsed: ParsedArgs = { mcp: false, help: false };
  const positionals: string[] = [];

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg === "--help" || arg === "-h" || arg === "help") {
      parsed.help = true;
    } else if (arg === "--mcp") {
      parsed.mcp = true;
    } else if (arg === "--project" || arg === "-p") {
      parsed.project = argv[++i];
    } else if (arg.startsWith("--project=")) {
      parsed.project = arg.slice(10);
    } else if (arg === "--workspace" || arg === "-w") {
      parsed.workspace = argv[++i];
    } else if (arg.startsWith("--workspace=")) {
      parsed.workspace = arg.slice(12);
    } else if (arg === "--branch" || arg === "-b") {
      parsed.branch = argv[++i];
    } else if (arg.startsWith("--branch=")) {
      parsed.branch = arg.slice(9);
    } else if (arg === "--from") {
      parsed.from = argv[++i];
    } else if (arg.startsWith("--from=")) {
      parsed.from = arg.slice(7);
    } else if (arg === "--path") {
      parsed.path = argv[++i];
    } else if (arg.startsWith("--path=")) {
      parsed.path = arg.slice(7);
    } else if (arg === "--api-key" || arg === "-k") {
      parsed.apiKey = argv[++i];
    } else if (arg.startsWith("--api-key=")) {
      parsed.apiKey = arg.slice(10);
    } else if (arg === "--name" || arg === "-n") {
      parsed.name = argv[++i];
    } else if (arg.startsWith("--name=")) {
      parsed.name = arg.slice(7);
    } else if (arg === "--description" || arg === "-d") {
      parsed.description = argv[++i];
    } else if (arg.startsWith("--description=")) {
      parsed.description = arg.slice(14);
    } else if (arg === "--readme") {
      parsed.readme = argv[++i];
    } else if (arg.startsWith("--readme=")) {
      parsed.readme = arg.slice(9);
    } else if (!arg.startsWith("-")) {
      positionals.push(arg);
    }
  }

  if (positionals.length > 0) {
    const first = positionals[0];
    if (["workspace", "ws"].includes(first)) {
      parsed.command = "workspace";
      parsed.subcommand = positionals[1];
      parsed.name = parsed.name || positionals[2];
    } else if (["project", "proj"].includes(first)) {
      parsed.command = "project";
      parsed.subcommand = positionals[1];
      parsed.name = parsed.name || positionals[2];
      parsed.path = parsed.path || positionals[3];
    } else if (["branch", "br"].includes(first)) {
      parsed.command = "branch";
      parsed.subcommand = positionals[1];
      parsed.name = parsed.name || positionals[2];
    } else if (["path"].includes(first)) {
      parsed.command = "path";
      parsed.path = parsed.path || positionals[1];
    } else if (["login", "test", "status"].includes(first)) {
      parsed.command = first === "status" ? "test" : first;
      parsed.name = positionals[1];
    } else {
      parsed.command = first;
    }
  }

  return parsed;
}

function printHelp(): void {
  consola.box(
    `${colors.bold(colors.cyan("@inqlab/code"))} ${colors.dim(`v${CLI_VERSION}`)}\n` +
      `${colors.dim("CartoCode Architecture Graph Engine & Model Context Protocol Gateway")}`,
  );

  console.log(`
${colors.bold("USAGE:")}
  ${colors.green("npx @inqlab/code")} ${colors.cyan("<command>")} ${colors.dim("[options]")}

${colors.bold("AUTHENTICATION:")}
  ${colors.cyan("login")}                             Authenticate via browser and store API key

${colors.bold("WORKSPACES:")}
  ${colors.cyan("workspace list")}                    List accessible workspaces
  ${colors.cyan("workspace create")} ${colors.dim("<name>")}           Create a new workspace

${colors.bold("PROJECTS:")}
  ${colors.cyan("project list")} ${colors.dim("[workspace-slug]")}     List projects (all or filtered by workspace)
  ${colors.cyan("project create")} ${colors.dim("<name> -w <slug>")}   Create a project in a workspace
  ${colors.cyan("project path")} ${colors.dim("<slug> [path]")}        Link local repository path for IDE navigation

${colors.bold("BRANCHES (with active branch tracking):")}
  ${colors.cyan("branch list")} ${colors.dim("-p <slug>")}             List branches and activity counts
  ${colors.cyan("branch create")} ${colors.dim("<name> -p <slug>")}    Fork branch copying state from active branch
  ${colors.cyan("branch switch")} ${colors.dim("<name> -p <slug>")}    Switch active branch

${colors.bold("MCP SERVER & HEALTH:")}
  ${colors.cyan("--mcp -p <slug>")}                   Start stdio MCP server for Cursor / Claude
  ${colors.cyan("test -p <slug>")}                    Verify API key, project access & metrics

${colors.bold("OPTIONS:")}
  ${colors.yellow("--project, -p")} ${colors.dim("<slug>")}     Project slug in CartoCode
  ${colors.yellow("--workspace, -w")} ${colors.dim("<slug>")}   Workspace slug in CartoCode
  ${colors.yellow("--branch, -b")} ${colors.dim("<name>")}      Target branch override (defaults to active branch)
  ${colors.yellow("--from")} ${colors.dim("<name>")}            Source branch to copy from (defaults to active branch)
  ${colors.yellow("--name, -n")} ${colors.dim("<string>")}      Name for workspace, project, or branch
  ${colors.yellow("--path")} ${colors.dim("<path>")}            Local repository path to link (defaults to cwd)
  ${colors.yellow("--api-key, -k")} ${colors.dim("<key>")}      Override API key
  ${colors.yellow("--help, -h")}               Show this help message

${colors.bold("ACTIVE BRANCH WORKFLOW:")}
  Switch your target branch once using:
    ${colors.green("npx @inqlab/code branch switch <branch-name> -p <project-slug>")}

  Subsequent MCP runs and tool calls target this branch automatically without needing ${colors.yellow("--branch")}.
`);
}

async function main(): Promise<void> {
  const argv = process.argv.slice(2);
  const parsed = parseCliArgs(argv);

  // Evaluate 3-level version update policy
  await checkCliVersion({ force: false, isMcp: parsed.mcp });

  if (parsed.help || (argv.length === 0 && !parsed.mcp)) {
    printHelp();
    return;
  }

  // 1. Authentication command (does not require existing API key)
  if (parsed.command === "login") {
    await runLoginCommand();
    return;
  }

  // 2. Resolve API key
  const config = loadConfig();
  const apiKey =
    parsed.apiKey || process.env.CARTOCODE_API_KEY || config.apiKey;

  if (!apiKey) {
    consola.error("Missing API key.");
    consola.info(
      "Please run 'npx @inqlab/code login' to authenticate, or provide --api-key <key>.\n",
    );
    process.exit(1);
  }

  // 3. Model Context Protocol stdio server mode
  if (parsed.mcp) {
    const projectSlug = parsed.project || process.env.CARTOCODE_PROJECT;
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
      branchOverride: parsed.branch || process.env.CARTOCODE_BRANCH,
    });
    return;
  }

  // 4. Workspace commands
  if (parsed.command === "workspace") {
    await runWorkspaceCommand(apiKey, parsed.subcommand || "list", {
      name: parsed.name,
      description: parsed.description,
    });
    return;
  }

  // 5. Project commands
  if (parsed.command === "project") {
    await runProjectCommand(apiKey, parsed.subcommand || "list", {
      name: parsed.name,
      workspaceSlug: parsed.workspace,
      projectSlug: parsed.project || parsed.name,
      targetPath: parsed.path,
      description: parsed.description,
      readme: parsed.readme,
    });
    return;
  }

  // 6. Standalone path command
  if (parsed.command === "path") {
    const projectSlug = parsed.project || parsed.name;
    if (!projectSlug) {
      consola.error("Missing project slug.");
      consola.info(
        "Usage: npx @inqlab/code path [local-path] --project <project-slug>\n",
      );
      process.exit(1);
    }
    await runProjectCommand(apiKey, "path", {
      projectSlug,
      targetPath: parsed.path,
    });
    return;
  }

  // 7. Branch commands
  if (parsed.command === "branch") {
    const projectSlug = parsed.project || process.env.CARTOCODE_PROJECT;
    if (!projectSlug) {
      consola.error("Missing project slug.");
      consola.info(
        "Specify the project using --project <slug> (or -p <slug>).\n",
      );
      process.exit(1);
    }
    await runBranchCommand(apiKey, parsed.subcommand || "list", {
      projectSlug,
      branchName: parsed.name || parsed.branch,
      fromBranch: parsed.from,
    });
    return;
  }

  // 8. Test / Status command
  if (parsed.command === "test") {
    const projectSlug = parsed.project || process.env.CARTOCODE_PROJECT;
    if (!projectSlug) {
      consola.error("Missing project slug.");
      consola.info(
        "Specify the project using --project <slug> (or -p <slug>).\n",
      );
      process.exit(1);
    }
    await runTestCommand(
      apiKey,
      projectSlug,
      parsed.branch || process.env.CARTOCODE_BRANCH,
    );
    return;
  }

  consola.error(`Unknown command: '${parsed.command}'`);
  printHelp();
  process.exit(1);
}

main().catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  consola.error("Fatal CLI error:", message);
  process.exit(1);
});
