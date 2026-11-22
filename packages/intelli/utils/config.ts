import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
import { consola } from "consola";

import { CLI_VERSION, DEFAULT_ENDPOINT } from "../constants";
import type { CliConfig, CliVersionPayload } from "../types";

export const CONFIG_DIR = join(homedir(), ".inqlab");
export const CONFIG_FILE = join(CONFIG_DIR, "intelli.json");

const DEFAULT_CONFIG: CliConfig = {
  endpoint: DEFAULT_ENDPOINT,
};

export function loadConfig(): CliConfig {
  try {
    if (existsSync(CONFIG_FILE)) {
      const raw = readFileSync(CONFIG_FILE, "utf-8");
      return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
    }
    return { ...DEFAULT_CONFIG };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

export function saveConfig(updates: Partial<CliConfig>): CliConfig {
  if (!existsSync(CONFIG_DIR)) {
    mkdirSync(CONFIG_DIR, { recursive: true });
  }
  const current = loadConfig();
  const merged = { ...current, ...updates };
  writeFileSync(CONFIG_FILE, JSON.stringify(merged, null, 2), "utf-8");
  return merged;
}

function parseSemver(v: string): [number, number, number] {
  const clean = v.replace(/^v/, "").trim();
  const parts = clean.split(".").map((n) => Number.parseInt(n, 10));
  return [parts[0] || 0, parts[1] || 0, parts[2] || 0];
}

export function compareSemver(v1: string, v2: string): number {
  const [a1, a2, a3] = parseSemver(v1);
  const [b1, b2, b3] = parseSemver(v2);
  if (a1 !== b1) return a1 - b1;
  if (a2 !== b2) return a2 - b2;
  return a3 - b3;
}

export async function fetchCliVersion(endpoint = DEFAULT_ENDPOINT): Promise<CliVersionPayload> {
  const base = endpoint.replace(/\/$/, "");
  const res = await fetch(`${base}/cli/version`, {
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`HTTP ${res.status}`);
  }
  return (await res.json()) as CliVersionPayload;
}

export async function checkCliVersion(options: { force?: boolean } = {}): Promise<void> {
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
      payload = await fetchCliVersion(config.endpoint);
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
    const notice = payload.message ? `\nServer Notice: ${payload.message}\n` : "";
    consola.box(
      `✖ OUTDATED CLI VERSION BLOCKED\n\nYour current version (v${CLI_VERSION}) is no longer supported by Intelli.\nMinimum required version: v${payload.minSupported}\nLatest version: v${payload.latest}${notice}\nPlease update immediately to continue:\n  bunx @inqlab/intelli@latest`,
    );
    process.exit(1);
  }

  // Level 2: Warning
  if (compareSemver(CLI_VERSION, payload.deprecated) < 0) {
    const notice = payload.message ? `\nServer Notice: ${payload.message}\n` : "";
    consola.box(
      `⚠ CLI DEPRECATION WARNING\n\nYour current version (v${CLI_VERSION}) is deprecated and will soon stop functioning.\nRecommended latest: v${payload.latest}${notice}\nPlease update soon:\n  bunx @inqlab/intelli@latest`,
    );
    return;
  }

  // Level 1: Update Notice
  if (compareSemver(CLI_VERSION, payload.latest) < 0) {
    consola.info(
      `Update available: v${CLI_VERSION} -> v${payload.latest} (run: bunx @inqlab/intelli@latest)`,
    );
  }
}
