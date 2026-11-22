#!/usr/bin/env node
import { defineCommand, runMain } from "citty";

import { apiKeyCommand } from "./commands/api-key";
import { createCommand } from "./commands/create";
import { guideCommand } from "./commands/guide";
import { listCommand } from "./commands/list";
import { loginCommand } from "./commands/login";
import { CLI_VERSION, versionCommand } from "./commands/version";

const main = defineCommand({
  meta: {
    name: "intelli",
    version: CLI_VERSION,
    description: "Intelli Autonomous In-Browser Voice Agent Control Plane & CLI",
  },
  subCommands: {
    create: createCommand,
    init: createCommand,
    list: listCommand,
    ls: listCommand,
    "api-key": apiKeyCommand,
    key: apiKeyCommand,
    guide: guideCommand,
    login: loginCommand,
    auth: loginCommand,
    version: versionCommand,
  },
});

runMain(main);
