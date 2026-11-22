#!/usr/bin/env bun
import { apiKeyCommand } from "./commands/api-key";
import { createCommand } from "./commands/create";
import { guideCommand } from "./commands/guide";
import { listCommand } from "./commands/list";
import { loginCommand } from "./commands/login";
import { CLI_VERSION, versionCommand } from "./commands/version";

async function main() {
  const args = process.argv.slice(2);
  const command = args[0] || "help";

  switch (command) {
    case "create":
    case "new":
    case "init":
      await createCommand();
      break;

    case "list":
    case "ls":
      await listCommand();
      break;

    case "api-key":
    case "key":
      await apiKeyCommand(args[1]);
      break;

    case "guide":
    case "agent-guide":
      guideCommand();
      break;

    case "login":
    case "auth":
      await loginCommand(args[1]);
      break;

    case "version":
    case "-v":
    case "--version":
      await versionCommand();
      break;

    case "help":
    case "--help":
    case "-h":
    default:
      console.log(`Intelli CLI v${CLI_VERSION}

Usage:
  intelli <command> [options]

Commands:
  create, init    Interactively create a new Intelli project and generate API key
  list, ls        List all projects owned by the authenticated account
  api-key, key    Generate a scoped API key for an existing project
  guide           Show step-by-step project, architecture and SDK guide for agents
  login           Configure server endpoint and authentication token
  version         Show CLI version and check server version policy
  help            Show this help message
`);
      break;
  }
}

main().catch((err) => {
  console.error("CLI Error:", err);
  process.exit(1);
});
