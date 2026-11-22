export function guideCommand() {
  const guideContent = `
================================================================================
                    INTELLI AGENT & DEVELOPER GUIDE
================================================================================

1. OVERVIEW
--------------------------------------------------------------------------------
Intelli is the full-stack control plane and real-time backend engine for
autonomous in-browser voice agents.

Core Stack:
  - Runtime:       Bun (v1.2+)
  - Backend:       Nuxt 4 / Nitro Engine
  - Database:      PostgreSQL with Drizzle ORM
  - Auth:          Better-Auth (session cookies & scoped API keys)
  - AI Models:     Google Gemini (@google/genai 2.x)
  - Real-Time:     WebSocket Gateway (/ws)

2. STEP-BY-STEP SETUP
--------------------------------------------------------------------------------
Step 1: Install dependencies
  $ bun install

Step 2: Configure environment variables (.env in workspace root)
  DATABASE_URL="postgresql://user:password@localhost:5432/intellilayer"
  CORE_DATABASE_URL="postgresql://user:password@localhost:5432/inqlab_core"
  BETTER_AUTH_SECRET="your-secure-random-secret"
  BETTER_AUTH_URL="http://localhost:3000"
  GEMINI_API_KEY="your-google-gemini-api-key"

Step 3: Database migrations & automated triggers
  $ bun run db:mig        # Run Drizzle migrations
  $ bun run db:triggers   # Apply automated updated_at PostgreSQL triggers

Step 4: Launch development server
  $ bun run dev           # Serves application at http://localhost:3000

Step 5: Production build
  $ bun run build
  $ bun run preview

3. REPOSITORY LAYOUT
--------------------------------------------------------------------------------
  intellilayer/
  ├── app/                  # Frontend Application (Nuxt 4 / Vue 3 / TanStack Query)
  ├── server/
  │   ├── agent/            # Gemini reasoning, audio streams & tool buffers
  │   ├── api/              # Core REST API (projects, auth, tokens, costs)
  │   ├── routes/
  │   │   ├── cli/          # CLI API endpoints (/cli/version, /cli/projects, etc.)
  │   │   └── ws.ts         # High-throughput real-time WebSocket gateway
  │   ├── db/               # Drizzle schemas, migrations & PostgreSQL triggers
  │   ├── services/         # Business logic layer
  │   └── validation/       # Zod schemas with sound typing
  ├── cli/                  # IntelliLayer CLI Tooling
  └── README.md             # Full architecture documentation

4. CLIENT SDK INTEGRATION
--------------------------------------------------------------------------------
Embed the in-browser voice copilot into host web applications:

  <script type="module">
    import { defaultRuntime } from "https://intellilayer.inqlab.dev/sdk/index.js";
    const runtime = window.IntelliLayer || defaultRuntime;
    if (runtime) {
      window.IntelliLayer = runtime;
      runtime.init({
        wsUrl: "wss://intellilayer.inqlab.dev/ws",
        tokenEndpoint: "https://intellilayer.inqlab.dev/api/projects/YOUR_PROJECT_ID/token",
      });
    }
  </script>

5. CLI COMMAND REFERENCE
--------------------------------------------------------------------------------
  $ intellilayer create       # Interactively create a project & generate API key
  $ intellilayer list         # List your projects
  $ intellilayer api-key      # Generate scoped API key for existing project
  $ intellilayer login        # Authenticate CLI with server token / API key
  $ intellilayer version      # Check local version against server update policy
  $ intellilayer guide        # Print this autonomous agent setup guide

================================================================================
`;

  console.log(guideContent.trim());
}
