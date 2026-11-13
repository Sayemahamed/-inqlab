import { exec, execSync } from "node:child_process";
import fs from "node:fs";

import { consola } from "consola";

import { type CliVersionPayload, fetchCliVersion } from "./api";
import { CLI_VERSION, CONFIG_DIR, CONFIG_FILE } from "./constants";

export interface ProjectConfig {
  activeBranch?: string;
}

export interface VersionCache {
  lastChecked: number;
  payload: CliVersionPayload;
}

export interface CliConfig {
  apiKey?: string;
  projects?: Record<string, ProjectConfig>;
  versionCache?: VersionCache;
}

/**
 * Loads user configuration from the global config file.
 */
export function loadConfig(): CliConfig {
  try {
    if (fs.existsSync(CONFIG_FILE)) {
      const data = fs.readFileSync(CONFIG_FILE, "utf-8");
      const parsed: unknown = JSON.parse(data);
      if (typeof parsed === "object" && parsed !== null) {
        return parsed as CliConfig;
      }
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Warning: failed to read ${CONFIG_FILE}: ${message}`);
  }
  return {};
}

/**
 * Persists partial updates into the global config file.
 */
export function saveConfig(updates: Partial<CliConfig>): void {
  try {
    if (!fs.existsSync(CONFIG_DIR)) {
      fs.mkdirSync(CONFIG_DIR, { recursive: true });
    }
    const current = loadConfig();
    const updated: CliConfig = {
      ...current,
      ...updates,
      projects: {
        ...(current.projects ?? {}),
        ...(updates.projects ?? {}),
      },
    };
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(updated, null, 2), "utf-8");
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to save configuration: ${message}`);
  }
}

/**
 * Stores the active branch for a specific project slug in global configuration.
 */
export function setActiveBranch(projectSlug: string, branchName: string): void {
  const current = loadConfig();
  const projects = current.projects ?? {};
  projects[projectSlug] = {
    ...projects[projectSlug],
    activeBranch: branchName,
  };
  saveConfig({ projects });
}

/**
 * Retrieves the persisted active branch for a project from global configuration.
 */
export function getActiveBranch(projectSlug: string): string | undefined {
  const config = loadConfig();
  return config.projects?.[projectSlug]?.activeBranch;
}

/**
 * Detects current Git branch if the command is executed within a Git repository.
 */
export function getGitBranch(): string | null {
  try {
    const branch = execSync("git branch --show-current", {
      encoding: "utf-8",
      stdio: ["pipe", "pipe", "ignore"],
    }).trim();
    return branch || null;
  } catch {
    return null;
  }
}

/**
 * Resolves the target branch using the hierarchical fallback chain:
 * 1. Explicit command line argument
 * 2. Active branch from global config for this project
 * 3. Current Git branch
 * 4. "main" default
 */
export function resolveBranch(
  projectSlug: string,
  explicitBranch?: string,
): string {
  if (explicitBranch && explicitBranch.trim().length > 0) {
    return explicitBranch.trim();
  }
  const configured = getActiveBranch(projectSlug);
  if (configured && configured.trim().length > 0) {
    return configured.trim();
  }
  const gitBranch = getGitBranch();
  if (gitBranch && gitBranch.trim().length > 0) {
    return gitBranch.trim();
  }
  return "main";
}

/**
 * Opens a URL in the user's default browser across Darwin, Windows, and Linux.
 */
export function openBrowser(url: string): void {
  const cmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";
  exec(`${cmd} "${url}"`, (err) => {
    if (err) {
      console.log(`\nPlease open this URL in your browser:\n  ${url}\n`);
    }
  });
}

function parseSemver(v: string): [number, number, number] {
  const clean = v.replace(/^v/, "").trim();
  const parts = clean.split(".").map((n) => Number.parseInt(n, 10));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

/**
 * Deterministic semantic version comparator (a vs b).
 * Returns negative if a < b, 0 if a === b, positive if a > b.
 */
export function compareSemver(v1: string, v2: string): number {
  const [a1, a2, a3] = parseSemver(v1);
  const [b1, b2, b3] = parseSemver(v2);
  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2 - b2;
  return a3 - b3;
}

/**
 * Evaluates the 3-level version policy against the hosted server endpoint.
 * Level 1: "There is an update" -> Informational notice.
 * Level 2: "Please update" -> Deprecation warning box.
 * Level 3: "Shut the CLI" -> Hard fatal termination with exit code 1.
 */
export async function checkCliVersion(
  options: {
    force?: boolean;
    isMcp?: boolean;
  } = {},
): Promise<void> {
  const config = loadConfig();
  const now = Date.now();
  const ONE_DAY_MS = 24 * 60 * 60 * 1000;

  let payload: CliVersionPayload | undefined = config.versionCache?.payload;
  const shouldFetch =
    options.force ||
    !config.versionCache ||
    now - config.versionCache.lastChecked > ONE_DAY_MS;

  if (shouldFetch) {
    try {
      payload = await fetchCliVersion();
      saveConfig({
        versionCache: {
          lastChecked: now,
          payload,
        },
      });
    } catch {
      payload = config.versionCache?.payload;
    }
  }

  if (!payload) {
    return;
  }

  // Level 3: Hard Block / Shut the CLI
  if (compareSemver(CLI_VERSION, payload.minSupported) < 0) {
    const notice = payload.message
      ? `\nServer Notice: ${payload.message}\n`
      : "";
    if (options.isMcp) {
      consola.options.stdout = process.stderr;
      consola.error(
        `[CARTOCODE_OUTDATED_ERROR] CLI v${CLI_VERSION} is below minimum supported v${payload.minSupported}.`,
      );
      if (payload.message) {
        consola.error(`Server Notice: ${payload.message}`);
      }
      consola.error("Please update immediately: npx @inqlab/code@latest");
    } else {
      consola.box(
        `✖ OUTDATED CLI VERSION BLOCKED\n\nYour current version (v${CLI_VERSION}) is no longer supported by CartoCode.\nMinimum required version: v${payload.minSupported}\nLatest version: v${payload.latest}${notice}\nPlease update immediately to continue:\n  npx @inqlab/code@latest`,
      );
    }
    process.exit(1);
  }

  // During MCP stdio mode, maintain clean stdout for JSON-RPC; suppress Level 1 / Level 2 notices
  if (options.isMcp) {
    return;
  }

  // Level 2: Deprecation Warning ("Please update")
  if (compareSemver(CLI_VERSION, payload.deprecated) < 0) {
    const notice = payload.message
      ? `\nServer Notice: ${payload.message}\n`
      : "";
    consola.box(
      `⚠ UPDATE RECOMMENDED\n\nYour CLI version (v${CLI_VERSION}) is deprecated and will soon be unsupported.\nLatest version: v${payload.latest}${notice}\nPlease update now:\n  npx @inqlab/code@latest`,
    );
    return;
  }

  // Level 1: Notice ("There is an update")
  if (compareSemver(CLI_VERSION, payload.latest) < 0) {
    consola.info(
      `Update available: v${CLI_VERSION} → v${payload.latest} (run: npx @inqlab/code@latest)`,
    );
  }

  // General server announcement (if provided and not already displayed in Level 2 / 3)
  if (payload.message && payload.message.trim().length > 0) {
    consola.info(`CartoCode Notice: ${payload.message.trim()}`);
  }
}
