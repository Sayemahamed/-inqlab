import { writeFileSync } from "node:fs";

import type { CliProject } from "../types";
import { ApiClient } from "../utils/api";
import { askQuestion, selectOption } from "../utils/prompts";

export async function apiKeyCommand(projectIdArg?: string) {
  const api = new ApiClient();

  let projectId = projectIdArg;

  if (!projectId) {
    try {
      const res = await api.get<{ success: boolean; projects: CliProject[] }>(
        "/cli/projects",
      );
      if (!res.projects || res.projects.length === 0) {
        console.error(
          "No projects found. Create one first with: intellilayer create",
        );
        process.exit(1);
      }

      const options = res.projects.map((p) => ({
        label: `${p.name} (${p.id})`,
        value: p.id,
      }));

      projectId = await selectOption(
        "Select project to generate API key for:",
        options,
        0,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      console.error(`Failed to fetch projects: ${message}`);
      process.exit(1);
    }
  }

  const keyName = await askQuestion(
    "Key Name (optional, press enter for default)",
  );

  console.log("\nGenerating API key...");
  try {
    const res = await api.post<{ success: boolean; key: string }>(
      "/cli/api-key",
      {
        projectId,
        name: keyName || undefined,
      },
    );

    console.log(`\nAPI Key generated successfully!`);
    console.log(`  Key: ${res.key}`);

    const writeEnv = await askQuestion(
      "\nWrite API key to local .env file? (y/n)",
      "y",
    );
    if (writeEnv.toLowerCase() === "y") {
      const envContent = `\nINTELLI_PROJECT_ID=${projectId}\nINTELLI_API_KEY=${res.key}\n`;
      writeFileSync(".env", envContent, { flag: "a", encoding: "utf-8" });
      console.log("Appended credentials to .env");
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nFailed to generate API key: ${message}`);
  }
}
