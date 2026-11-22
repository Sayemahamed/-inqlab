import { defineCommand } from "citty";
import { consola } from "consola";

import { CLI_VERSION } from "../constants";
import type { CliVersionResponse } from "../types";
import { ApiClient } from "../utils/api";

export const versionCommand = defineCommand({
  meta: {
    name: "version",
    description: "Show CLI version and check server version policy",
  },
  async run() {
    consola.info(`Intelli CLI v${CLI_VERSION}`);
    try {
      const api = new ApiClient();
      const policy = await api.get<CliVersionResponse>("/cli/version");
      consola.info(`Server latest: ${policy.latest}`);
      if (policy.message) {
        consola.box(`Server Notice: ${policy.message}`);
      }
    } catch {
      consola.warn("Could not connect to server to verify update policy");
    }
  },
});
