import type { CliProject } from "../types";
import { ApiClient } from "../utils/api";

export async function listCommand() {
  const api = new ApiClient();
  try {
    const res = await api.get<{ success: boolean; projects: CliProject[] }>(
      "/cli/projects",
    );
    if (!res.projects || res.projects.length === 0) {
      console.log("No projects found. Create one with: intellilayer create");
      return;
    }

    console.log("\nYour Intelli Projects:\n");
    res.projects.forEach((p, idx) => {
      console.log(`${idx + 1}. ${p.name} (ID: ${p.id})`);
      console.log(
        `   Instructor: ${p.instructorModel || "default"} | Background: ${p.backgroundModel || "default"}`,
      );
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`Failed to list projects: ${message}`);
  }
}
