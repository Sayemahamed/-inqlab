import http from "node:http";

import { consola } from "consola";

import {
  createBranch,
  createProject,
  createWorkspace,
  executeRemoteRpc,
  listBranches,
  listProjects,
  listWorkspaces,
  updateProjectPath,
} from "./api";
import {
  checkCliVersion,
  openBrowser,
  resolveBranch,
  saveConfig,
  setActiveBranch,
} from "./config";
import { BASE_URL, CALLBACK_PORT } from "./constants";

/**
 * Executes browser-based authentication flow with fixed callback port.
 */
export async function runLoginCommand(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(
        req.url || "/",
        `http://localhost:${CALLBACK_PORT}`,
      );

      if (parsedUrl.pathname === "/callback") {
        const key = parsedUrl.searchParams.get("key");

        if (key) {
          saveConfig({ apiKey: key });

          res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
          });
          res.end(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <title>CartoCode CLI — Authenticated</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0b0f19;
                    color: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                  }
                  .card {
                    background-color: #161e2e;
                    border: 1px solid #27354a;
                    border-radius: 16px;
                    padding: 40px;
                    max-width: 420px;
                    text-align: center;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                  }
                  .icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: rgba(34, 197, 94, 0.15);
                    color: #22c55e;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 28px;
                  }
                  h1 { font-size: 20px; margin: 0 0 8px; font-weight: 700; }
                  p { font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 0; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="icon">✓</div>
                  <h1>CLI Authenticated!</h1>
                  <p>Your API key has been stored in <code>~/.cartocode/config.json</code>.<br><br>You can close this tab and return to your terminal.</p>
                </div>
              </body>
            </html>
          `);

          consola.success("Successfully authenticated with CartoCode!");
          consola.info("API key saved successfully.");
          server.close(() => resolve());
          return;
        }

        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Missing 'key' parameter in callback.");
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    });

    server.on("error", (err: unknown) => {
      server.close();
      reject(err);
    });

    server.listen(CALLBACK_PORT, () => {
      const callbackUrl = `http://localhost:${CALLBACK_PORT}/callback`;
      const authUrl = `${BASE_URL}/cli-auth?callback=${encodeURIComponent(callbackUrl)}`;

      consola.start("Starting temporary authentication server on port 9876...");
      consola.info(`Opening browser for CartoCode authorization...`);
      consola.info(`Auth URL: ${authUrl}\n`);
      openBrowser(authUrl);
    });
  });
}

/**
 * Handles workspace listing and creation.
 */
export async function runWorkspaceCommand(
  apiKey: string,
  subcommand: string,
  options: { name?: string; description?: string },
): Promise<void> {
  if (subcommand === "list" || subcommand === "ls") {
    const workspaces = await listWorkspaces(apiKey);
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
    return;
  }

  if (subcommand === "create" || subcommand === "new") {
    if (!options.name) {
      consola.error("Missing workspace name.");
      consola.info("Usage: npx @inqlab/code workspace create <name>");
      process.exit(1);
    }
    const ws = await createWorkspace(apiKey, options.name, options.description);
    consola.success("Workspace created successfully!");
    consola.info(`Name: ${ws.name}`);
    consola.info(`Slug: ${ws.slug}`);
    consola.info(
      `Create your first project in this workspace:\n  npx @inqlab/code project create "My Project" --workspace ${ws.slug}`,
    );
    return;
  }

  consola.error(`Unknown workspace command: '${subcommand}'`);
  consola.info("Available commands: list, create");
  process.exit(1);
}

/**
 * Handles project listing, creation, and path linking.
 */
export async function runProjectCommand(
  apiKey: string,
  subcommand: string,
  options: {
    name?: string;
    workspaceSlug?: string;
    projectSlug?: string;
    targetPath?: string;
    description?: string;
    readme?: string;
  },
): Promise<void> {
  if (subcommand === "list" || subcommand === "ls") {
    const projects = await listProjects(apiKey, options.workspaceSlug);
    if (projects.length === 0) {
      consola.warn("No projects found.");
      if (options.workspaceSlug) {
        consola.info(
          `Create a project in this workspace: npx @inqlab/code project create <name> --workspace ${options.workspaceSlug}`,
        );
      }
      return;
    }

    consola.info(`Projects (${projects.length}):`);
    for (const p of projects) {
      const wsInfo = p.workspaceName
        ? ` [Workspace: ${p.workspaceName} (${p.workspaceSlug})]`
        : p.workspaceSlug
          ? ` [Workspace: ${p.workspaceSlug}]`
          : "";
      console.log(
        `  • ${(p.name || p.slug).padEnd(25)} [slug: ${p.slug}]${wsInfo}`,
      );
    }
    return;
  }

  if (subcommand === "create" || subcommand === "new") {
    if (!options.name) {
      consola.error("Missing project name.");
      consola.info(
        "Usage: npx @inqlab/code project create <name> --workspace <slug>",
      );
      process.exit(1);
    }
    if (!options.workspaceSlug) {
      consola.error("Missing workspace slug.");
      consola.info(
        "Specify target workspace with --workspace <slug> (or -w <slug>).",
      );
      process.exit(1);
    }
    const p = await createProject(
      apiKey,
      options.workspaceSlug,
      options.name,
      options.description,
      options.readme,
    );
    consola.success("Project created successfully!");
    consola.info(`Name:      ${p.name}`);
    consola.info(`Slug:      ${p.slug}`);
    consola.info(`Workspace: ${options.workspaceSlug}`);
    consola.info(
      `To run the MCP server for this project:\n  npx @inqlab/code --mcp --project ${p.slug}`,
    );
    return;
  }

  if (subcommand === "path" || subcommand === "set-path") {
    const projectSlug = options.projectSlug || options.name;
    if (!projectSlug) {
      consola.error("Missing project slug.");
      consola.info(
        "Usage: npx @inqlab/code project path <project-slug> [local-path]",
      );
      process.exit(1);
    }
    const targetPath = options.targetPath || process.cwd();
    const data = await updateProjectPath(apiKey, projectSlug, targetPath);
    consola.success("Local repository path linked!");
    consola.info(`Project: ${data.project}`);
    consola.info(`Path:    ${data.path}`);
    return;
  }

  consola.error(`Unknown project command: '${subcommand}'`);
  consola.info("Available commands: list, create, path");
  process.exit(1);
}

/**
 * Handles branch listing, branch creation, and branch switching with persistent active branch tracking.
 */
export async function runBranchCommand(
  apiKey: string,
  subcommand: string,
  options: {
    projectSlug: string;
    branchName?: string;
    fromBranch?: string;
  },
): Promise<void> {
  const { projectSlug } = options;

  if (subcommand === "list" || subcommand === "ls") {
    const branches = await listBranches(apiKey, projectSlug);
    if (branches.length === 0) {
      consola.warn(`No branches found for project '${projectSlug}'.`);
      return;
    }

    const active = resolveBranch(projectSlug);
    consola.info(`Branches for project '${projectSlug}':`);
    for (const b of branches) {
      const isCurrent = b.name === active;
      const marker = isCurrent ? "* " : "  ";
      const highlight = isCurrent ? "(active)" : "";
      console.log(
        `  ${marker}${b.name.padEnd(25)} ${String(b.activityCount ?? 0).padStart(4)} activities   ${highlight}`,
      );
    }
    return;
  }

  if (subcommand === "create" || subcommand === "new") {
    const branchName = options.branchName;
    if (!branchName) {
      consola.error("Missing new branch name.");
      consola.info(
        "Usage: npx @inqlab/code branch create <name> -p <project> [--from <source>]",
      );
      process.exit(1);
    }
    const fromBranch = options.fromBranch || resolveBranch(projectSlug);
    const result = await createBranch(
      apiKey,
      projectSlug,
      branchName,
      fromBranch,
    );

    setActiveBranch(projectSlug, result.branch);

    consola.success(`Branch '${result.branch}' created successfully!`);
    consola.info(
      `Inherited ${result.activityCount} activities from '${result.parentBranch}'`,
    );
    consola.box(
      `Target this branch with your AI agent:\n  npx @inqlab/code --mcp --project ${projectSlug}\n\nActive branch set to '${result.branch}'.`,
    );
    return;
  }

  if (subcommand === "switch" || subcommand === "checkout") {
    const branchName = options.branchName;
    if (!branchName) {
      consola.error("Missing branch name to switch to.");
      consola.info("Usage: npx @inqlab/code branch switch <name> -p <project>");
      process.exit(1);
    }

    const branches = await listBranches(apiKey, projectSlug);
    const found = branches.find((b) => b.name === branchName);
    if (!found) {
      consola.warn(
        `Branch '${branchName}' was not found in project '${projectSlug}'.`,
      );
      consola.info(
        `To create it, run: npx @inqlab/code branch create ${branchName} -p ${projectSlug}`,
      );
    }

    setActiveBranch(projectSlug, branchName);
    consola.success(
      `Active branch for '${projectSlug}' set to '${branchName}'`,
    );
    consola.box(
      `Active branch set to '${branchName}'.\n\nModel Context Protocol sessions targeting '${projectSlug}' will automatically route to '${branchName}' without restarting your editor.`,
    );
    return;
  }

  consola.error(`Unknown branch command: '${subcommand}'`);
  consola.info("Available commands: list, create, switch");
  process.exit(1);
}

/**
 * Handles connection and project/branch access verification.
 */
export async function runTestCommand(
  apiKey: string,
  projectSlug: string,
  branchOverride?: string,
): Promise<void> {
  const branchName = resolveBranch(projectSlug, branchOverride);

  // Live version verification
  await checkCliVersion({ force: true, isMcp: false });

  consola.start(`Verifying CartoCode MCP Connection...`);
  consola.info(`Project: ${projectSlug}`);
  consola.info(`Branch:  ${branchName}`);
  consola.info(`API Key: ${apiKey.slice(0, 8)}...`);

  const result = await executeRemoteRpc(
    apiKey,
    projectSlug,
    branchName,
    "getArchitectureContext",
    {},
  );

  if (result.isError) {
    consola.error(
      `Server returned an error: ${result.content?.[0]?.text ?? "Unknown error"}`,
    );
    process.exit(1);
  }

  let payload: {
    branchName?: string;
    activityCount?: number;
    nodes?: unknown[];
    edges?: unknown[];
  } = {};

  try {
    const rawText = result.content?.[0]?.text || "{}";
    const parsed: unknown = JSON.parse(rawText);
    if (typeof parsed === "object" && parsed !== null) {
      payload = parsed as typeof payload;
    }
  } catch {
    // Keep empty payload if not JSON
  }

  consola.success("Connected successfully!");
  console.log(`  Active Branch:  ${payload.branchName || branchName}`);
  console.log(`  Activity Count: ${payload.activityCount ?? 0}`);
  console.log(`  Nodes:          ${payload.nodes?.length ?? 0}`);
  console.log(`  Edges:          ${payload.edges?.length ?? 0}\n`);
}
