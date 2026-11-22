import { defineCommand } from "citty";
import { consola } from "consola";

import type { CliProject } from "../types";
import { ApiClient } from "../utils/api";

export const listCommand = defineCommand({
  meta: {
    name: "list",
    description: "List all projects owned by the authenticated account",
  },
  async run() {
    const api = new ApiClient();
    try {
      const res = await api.get<{ success: boolean; projects: CliProject[] }>(
        "/cli/projects",
      );
      if (!res.projects || res.projects.length === 0) {
        consola.warn(
          "No projects found. Create one with: npx @inqlab/intelli create",
        );
        return;
      }

      consola.info(`Your Intelli Projects (${res.projects.length}):`);
      for (const p of res.projects) {
        console.log(
          `  • ${p.name.padEnd(25)} [ID: ${p.id}]`.trimEnd(),
        );
        console.log(
          `    Instructor: ${p.instructorModel || "default"} | Background: ${p.backgroundModel || "default"}`,
        );
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      consola.error(`Failed to list projects: ${message}`);
    }
  },
});
