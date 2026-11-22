import { writeFileSync } from "node:fs";
import { defineCommand } from "citty";
import { consola } from "consola";

import type { CliProject } from "../types";
import { ApiClient } from "../utils/api";
import { askQuestion, confirmAction, selectOption } from "../utils/prompts";

export const apiKeyCommand = defineCommand({
  meta: {
    name: "api-key",
    description: "Generate a scoped API key for an existing project",
  },
  args: {
    projectId: {
      type: "positional",
      valueHint: "id",
      description: "Target project ID",
      required: false,
    },
    name: {
      type: "string",
      valueHint: "name",
      description: "Key name or label",
      required: false,
    },
  },
  async run({ args }) {
    const api = new ApiClient();
    let projectId = args.projectId;

    if (!projectId) {
      try {
        const res = await api.get<{ success: boolean; projects: CliProject[] }>(
          "/cli/projects",
        );
        if (!res.projects || res.projects.length === 0) {
          consola.error(
            "No projects found. Create one first with: npx @inqlab/intelli create",
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
        consola.error(`Failed to fetch projects: ${message}`);
        process.exit(1);
      }
    }

    let keyName = args.name;
    if (!keyName) {
      keyName = await askQuestion(
        "Key Name (optional, press enter for default)",
      );
    }

    consola.start("Generating API key...");
    try {
      const res = await api.post<{ success: boolean; key: string }>(
        "/cli/api-key",
        {
          projectId,
          name: keyName || undefined,
        },
      );

      consola.success("API Key generated successfully!");
      consola.info(`Project: ${projectId}`);
      consola.info(`Key:     ${res.key}`);

      const writeEnv = await confirmAction(
        "Write API key to local .env file?",
        true,
      );
      if (writeEnv) {
        const envContent = `\nINTELLI_PROJECT_ID=${projectId}\nINTELLI_API_KEY=${res.key}\n`;
        writeFileSync(".env", envContent, { flag: "a", encoding: "utf-8" });
        consola.success("Appended credentials to local .env file");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      consola.error(`Failed to generate API key: ${message}`);
    }
  },
});
