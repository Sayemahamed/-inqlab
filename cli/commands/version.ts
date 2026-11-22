import type { CliVersionResponse } from "../types";
import { ApiClient } from "../utils/api";

export const CLI_VERSION = "1.0.0";

export async function versionCommand() {
  console.log(`Intelli CLI v${CLI_VERSION}`);
  try {
    const api = new ApiClient();
    const policy = await api.get<CliVersionResponse>("/cli/version");
    console.log(`Server latest: ${policy.latest}`);
    if (policy.message) {
      console.log(`Notice: ${policy.message}`);
    }
  } catch {
    console.log("(Could not connect to server to verify update policy)");
  }
}
