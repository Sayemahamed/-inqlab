import { defineCommand } from "citty";
import { consola } from "consola";

import { executeRemoteRpc } from "../api";
import { checkCliVersion, resolveBranch } from "../config";
import { resolveApiKey } from "../utils/auth";

export const testCommand = defineCommand({
  meta: {
    name: "test",
    description: "Verify API key, project access & metrics",
  },
  args: {
    project: {
      type: "string",
      alias: "p",
      valueHint: "slug",
      description: "Project slug",
      required: true,
    },
    branch: {
      type: "string",
      alias: "b",
      valueHint: "name",
      description: "Branch override",
    },
    apiKey: {
      type: "string",
      alias: "k",
      valueHint: "key",
      description: "Override API key",
    },
  },
  async run({ args }) {
    const key = resolveApiKey(args.apiKey);
    const branchName = resolveBranch(args.project, args.branch);

    // Live version verification
    await checkCliVersion({ force: true, isMcp: false });

    consola.start("Verifying CartoCode MCP Connection...");
    consola.info(`Project: ${args.project}`);
    consola.info(`Branch:  ${branchName}`);
    consola.info(`API Key: ${key.slice(0, 8)}...`);

    const result = await executeRemoteRpc(
      key,
      args.project,
      branchName,
      "getArchitectureContext",
      {},
    );

    if (result.isError) {
      consola.error(
        `Server returned an error: ${result.content?.[0]?.text ?? "Unknown error"}`,
      );
      process.exit(1);
    }

    let payload: {
      branchName?: string;
      activityCount?: number;
      nodes?: unknown[];
      edges?: unknown[];
    } = {};

    try {
      const rawText = result.content?.[0]?.text || "{}";
      const parsed: unknown = JSON.parse(rawText);
      if (typeof parsed === "object" && parsed !== null) {
        payload = parsed as typeof payload;
      }
    } catch {
      // Keep empty payload if not JSON
    }

    consola.success("Connected successfully!");
    console.log(`  Active Branch:  ${payload.branchName || branchName}`);
    console.log(`  Activity Count: ${payload.activityCount ?? 0}`);
    console.log(`  Nodes:          ${payload.nodes?.length ?? 0}`);
    console.log(`  Edges:          ${payload.edges?.length ?? 0}\n`);
  },
});
