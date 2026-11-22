import { defineCommand } from "citty";

import type { CliUser } from "../types";
import { ApiClient } from "../utils/api";
import { loadConfig, saveConfig } from "../utils/config";
import { askQuestion } from "../utils/prompts";

export const loginCommand = defineCommand({
  meta: {
    name: "login",
    description: "Configure server endpoint and authentication token",
  },
  args: {
    token: {
      type: "positional",
      description: "Session token or API key",
      required: false,
    },
    endpoint: {
      type: "string",
      description: "Intelli server endpoint",
      required: false,
    },
  },
  async run({ args }) {
    const currentConfig = loadConfig();
    const endpoint =
      args.endpoint ||
      (await askQuestion("Server Endpoint", currentConfig.endpoint));
    saveConfig({ endpoint });

    let token = args.token;
    if (!token) {
      token = await askQuestion("Session Token or API Key");
    }

    if (!token) {
      console.error("Error: Token is required to login.");
      process.exit(1);
    }

    saveConfig({ token });

    try {
      const api = new ApiClient({ endpoint, token });
      const res = await api.get<{ success: boolean; user: CliUser }>("/cli/auth");
      console.log(
        `\nLogged in successfully as ${res.user.email} (${res.user.id})`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`\nLogin verification failed: ${message}`);
    }
  },
});
