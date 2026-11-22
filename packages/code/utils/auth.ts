import { consola } from "consola";

import { loadConfig } from "../config";

export function resolveApiKey(overrideKey?: string): string {
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
