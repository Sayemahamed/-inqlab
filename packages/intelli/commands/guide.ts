import { defineCommand } from "citty";

export const guideCommand = defineCommand({
  meta: {
    name: "guide",
    description: "Show step-by-step project, architecture and SDK guide for agents",
  },
  run() {
    const guideContent = `
================================================================================
                    INTELLI AGENT & DEVELOPER GUIDE
================================================================================

1. OVERVIEW
--------------------------------------------------------------------------------
Intelli is the full-stack control plane and real-time backend engine for
autonomous in-browser voice agents.

Hosted Platform: https://intelli.inqlab.dev

2. CLI QUICK START
--------------------------------------------------------------------------------
  $ npx @inqlab/intelli login       # Authenticate CLI with server token
  $ npx @inqlab/intelli create      # Create new project and generate API key
  $ npx @inqlab/intelli list        # List all accessible projects
  $ npx @inqlab/intelli api-key     # Generate scoped API key for project
  $ npx @inqlab/intelli version     # Check local version against update policy

3. CLIENT SDK INTEGRATION
--------------------------------------------------------------------------------
Embed the in-browser voice copilot into host web applications:

  <script type="module">
    import { defaultRuntime } from "https://intelli.inqlab.dev/sdk/index.js";
    const runtime = window.IntelliLayer || defaultRuntime;
    if (runtime) {
      window.IntelliLayer = runtime;
      runtime.init({
        wsUrl: "wss://intelli.inqlab.dev/ws",
        tokenEndpoint: "https://intelli.inqlab.dev/api/projects/YOUR_PROJECT_ID/token",
      });
    }
  </script>
================================================================================
`;
    console.log(guideContent.trim());
  },
});
