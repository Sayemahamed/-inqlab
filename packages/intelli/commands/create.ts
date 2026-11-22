import { writeFileSync } from "node:fs";
import { defineCommand } from "citty";
import { consola } from "consola";

import type {
  CliLanguage,
  CliProject,
  CreateProjectCliPayload,
} from "../types";
import { ApiClient } from "../utils/api";
import { askQuestion, confirmAction, selectOption } from "../utils/prompts";

export const createCommand = defineCommand({
  meta: {
    name: "create",
    description: "Interactively create a new Intelli project and generate API key",
  },
  args: {
    name: {
      type: "string",
      valueHint: "name",
      description: "Project name",
      required: false,
    },
    language: {
      type: "string",
      valueHint: "id",
      description: "Primary language ID",
      required: false,
    },
    instructor: {
      type: "string",
      valueHint: "model",
      description: "Instructor model",
      options: [
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
        "gemini-2.5-flash",
      ],
      required: false,
    },
    background: {
      type: "string",
      valueHint: "model",
      description: "Background model",
      options: [
        "gemini-3.5-flash-lite",
        "gemini-3.8-flash",
        "gemini-2.5-flash",
      ],
      required: false,
    },
    apiKey: {
      type: "string",
      valueHint: "key",
      description: "Custom Gemini API key",
      required: false,
    },
  },
  async run({ args }) {
    const api = new ApiClient();

    consola.box("Create New Intelli Project");

    let name = args.name;
    if (!name) {
      name = await askQuestion("Project Name");
    }
    if (!name) {
      consola.error("Project name is required.");
      process.exit(1);
    }

    let languageId: string | null = args.language || null;
    if (!languageId) {
      try {
        const langRes = await api.get<{
          success: boolean;
          languages: CliLanguage[];
        }>("/cli/languages");
        if (langRes.languages?.length) {
          const options = [
            { label: "None / Default", value: "" },
            ...langRes.languages.map((l) => ({ label: l.name, value: l.id })),
          ];
          const selected = await selectOption(
            "Select Primary Language:",
            options,
            0,
          );
          languageId = selected || null;
        }
      } catch {
        // Continue if languages endpoint fails
      }
    }

    const modelOptions = [
      {
        label: "gemini-3.5-flash-lite (Recommended)",
        value: "gemini-3.5-flash-lite",
      },
      { label: "gemini-3.8-flash", value: "gemini-3.8-flash" },
      { label: "gemini-2.5-flash", value: "gemini-2.5-flash" },
    ];

    const instructorModel =
      args.instructor ||
      (await selectOption("Instructor Model:", modelOptions, 0));
    const backgroundModel =
      args.background ||
      (await selectOption("Background Model:", modelOptions, 0));

    let geminiApiKey: string | null = args.apiKey || null;
    if (geminiApiKey === null) {
      const apiKeyInput = await askQuestion(
        "Gemini API Key (leave blank for platform default)",
      );
      geminiApiKey = apiKeyInput.trim() || null;
    }

    const payload: CreateProjectCliPayload = {
      name,
      languageId,
      instructorModel,
      backgroundModel,
      geminiApiKey,
    };

    consola.start("Creating project on Intelli...");
    try {
      const res = await api.post<{
        success: boolean;
        project: CliProject;
        apiKey: string;
      }>("/cli/projects", payload);

      consola.success("Project created successfully!");
      consola.info(`Project Name: ${res.project.name}`);
      consola.info(`Project ID:   ${res.project.id}`);
      consola.info(`API Key:      ${res.apiKey}`);

      const writeEnv = await confirmAction(
        "Write API key to local .env file?",
        true,
      );
      if (writeEnv) {
        const envContent = `\nINTELLI_PROJECT_ID=${res.project.id}\nINTELLI_API_KEY=${res.apiKey}\n`;
        writeFileSync(".env", envContent, { flag: "a", encoding: "utf-8" });
        consola.success("Appended credentials to local .env file");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      consola.error(`Failed to create project: ${message}`);
    }
  },
});
