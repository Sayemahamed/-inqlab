import { writeFileSync } from "node:fs";

import type {
  CliLanguage,
  CliProject,
  CreateProjectCliPayload,
} from "../types";
import { ApiClient } from "../utils/api";
import { askQuestion, selectOption } from "../utils/prompts";

export async function createCommand() {
  const api = new ApiClient();

  console.log("\n--- Create New Intelli Project ---\n");

  const name = await askQuestion("Project Name");
  if (!name) {
    console.error("Project name is required.");
    process.exit(1);
  }

  let languageId: string | null = null;
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
  } catch {}

  const modelOptions = [
    {
      label: "gemini-3.5-flash-lite (Default)",
      value: "gemini-3.5-flash-lite",
    },
    { label: "gemini-3.8-flash", value: "gemini-3.8-flash" },
    { label: "gemini-2.5-flash", value: "gemini-2.5-flash" },
  ];

  const instructorModel = await selectOption(
    "Instructor Model:",
    modelOptions,
    0,
  );
  const backgroundModel = await selectOption(
    "Background Model:",
    modelOptions,
    0,
  );

  const apiKeyInput = await askQuestion(
    "Gemini API Key (leave blank for platform default)",
  );
  const geminiApiKey = apiKeyInput.trim() || null;

  const payload: CreateProjectCliPayload = {
    name,
    languageId,
    instructorModel,
    backgroundModel,
    geminiApiKey,
  };

  console.log("\nCreating project on Intelli...");
  try {
    const res = await api.post<{
      success: boolean;
      project: CliProject;
      apiKey: string;
    }>("/cli/projects", payload);

    console.log(`\nProject created successfully!`);
    console.log(`  Project ID: ${res.project.id}`);
    console.log(`  API Key:    ${res.apiKey}`);

    const writeEnv = await askQuestion(
      "\nWrite API key to local .env file? (y/n)",
      "y",
    );
    if (writeEnv.toLowerCase() === "y") {
      const envContent = `\nINTELLI_PROJECT_ID=${res.project.id}\nINTELLI_API_KEY=${res.apiKey}\n`;
      writeFileSync(".env", envContent, { flag: "a", encoding: "utf-8" });
      console.log("Appended credentials to .env");
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.error(`\nFailed to create project: ${message}`);
  }
}
