import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

import type { CliConfig } from "../types";

export const CONFIG_DIR = join(homedir(), ".inqlab");
export const CONFIG_FILE = join(CONFIG_DIR, "intelli.json");

const DEFAULT_CONFIG: CliConfig = {
  endpoint: "https://intelli.inqlab.dev/",
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
