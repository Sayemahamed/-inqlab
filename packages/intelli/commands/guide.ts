import { defineCommand } from "citty";
import { consola } from "consola";

export const guideCommand = defineCommand({
  meta: {
    name: "guide",
    description: "Show step-by-step project, architecture and SDK guide for agents",
  },
  run() {
    consola.box(`INTELLI AGENT & DEVELOPER GUIDE

Platform: https://intelli.inqlab.dev

CLI Commands:
  npx @inqlab/intelli login       Authenticate via browser
  npx @inqlab/intelli list        List your projects
  npx @inqlab/intelli create      Create project and generate API key
  npx @inqlab/intelli api-key     Generate scoped API key
  npx @inqlab/intelli version     Verify version update policy

Client SDK:
  https://intelli.inqlab.dev/sdk/index.js`);
  },
});
