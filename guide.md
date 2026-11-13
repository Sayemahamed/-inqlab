# Publishing & Monorepo Guide for `@inqlab` Packages

This guide provides complete instructions for maintaining and publishing multiple npm packages under the `@inqlab` scope (such as `@inqlab/code`, `@inqlab/sdk`, etc.) from a single repository using standard workspaces.

---

## 1. Monorepo Overview

- **npm Scope / Organization:** `@inqlab`
- **Primary Package:** `@inqlab/code` (CartoCode Architecture Graph Engine & MCP CLI)
- **Hosted Platform:** `https://cartocode.inqlab.dev`
- **Supported Workspaces:** Bun, npm, pnpm

---

## 2. Directory Layout for Multiple Packages

In your standalone repository (e.g. `inqlab`), organize packages into a `packages/` directory:

```
inqlab/
├── package.json              # Root workspace manifest (private)
├── tsconfig.json             # Root TypeScript base configuration
├── .gitignore
└── packages/
    ├── code/                 # Published to npm as: @inqlab/code
    │   ├── package.json      # Manifest for @inqlab/code
    │   ├── tsconfig.json     # Package TypeScript config
    │   ├── api.ts            # Authenticated HTTP client
    │   ├── commands.ts       # CLI command handlers
    │   ├── config.ts         # Global config (~/.cartocode/config.json) & active branch store
    │   ├── constants.ts      # Immutable endpoints and server metadata
    │   ├── index.ts          # Executable binary entrypoint (zero exports)
    │   ├── mcp.ts            # Stdio Model Context Protocol gateway
    │   └── skills.ts         # Architectural journaling reference guide
    │
    ├── sdk/                  # (Optional future package: @inqlab/sdk)
    │   ├── package.json      # Manifest for @inqlab/sdk
    │   └── ...
    │
    └── <other-package>/      # (Optional future package: @inqlab/<name>)
        ├── package.json
        └── ...
```

To initialize `@inqlab/code`, copy all files from this Nuxt project's `./cli/*` directory into `packages/code/`.

---

## 3. Root Workspace Configuration (`inqlab/package.json`)

The root `package.json` links all subpackages together and is marked `"private": true` so the root repository itself is never accidentally published:

```json
{
  "name": "inqlab-monorepo",
  "private": true,
  "type": "module",
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build:code": "cd packages/code && bun run build",
    "build": "bun run --filter \"*\" build",
    "test": "cd packages/code && bun run ./index.ts --help"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0"
  }
}
```

---

## 4. Subpackage Manifest (`packages/code/package.json`)

Inside `packages/code/package.json`, define the package name, executable binaries, build scripts, and dependencies:

```json
{
  "name": "@inqlab/code",
  "version": "1.0.0",
  "description": "CartoCode Architecture Graph Engine & Model Context Protocol (MCP) CLI",
  "type": "module",
  "main": "./dist/index.js",
  "bin": {
    "inqlab-code": "./dist/index.js",
    "cartocode": "./dist/index.js"
  },
  "files": [
    "dist"
  ],
  "engines": {
    "node": ">=18.0.0"
  },
  "scripts": {
    "build": "bun build ./index.ts --target=node --outfile=dist/index.js && chmod +x dist/index.js",
    "prepublishOnly": "bun run build",
    "test": "bun run ./index.ts --help"
  },
  "dependencies": {
    "@modelcontextprotocol/server": "^2.3.1",
    "consola": "^3.4.0",
    "zod": "^4.6.7"
  },
  "devDependencies": {
    "@types/node": "^22.0.0",
    "typescript": "^5.6.0"
  },
  "keywords": [
    "cartocode",
    "inqlab",
    "mcp",
    "model-context-protocol",
    "architecture-graph",
    "ai-agent",
    "cursor",
    "claude"
  ],
  "author": "Inqlab",
  "license": "MIT",
  "publishConfig": {
    "access": "public"
  }
}
```

---

## 5. Adding Future Packages (e.g. `@inqlab/sdk`)

To add a new package under the same `@inqlab` scope:
1. Create a new directory under `packages/` (e.g. `packages/sdk/`).
2. Add a `package.json` with `"name": "@inqlab/sdk"` and `"publishConfig": { "access": "public" }`.
3. You can publish each package independently without affecting other packages.

---

## 6. Build & Bundling Process

Using Bun, the CLI in `packages/code` compiles into a standalone, zero-dependency distribution file targeting Node.js and Bun:

```bash
# In packages/code (or from root via workspace script):
bun run build
```

This generates `dist/index.js` containing the executable shebang `#!/usr/bin/env node`.

---

## 7. npm Organization Setup & Publishing

### Prerequisite: Register the `@inqlab` Scope on npmjs.com
1. Log in to your npm account at [npmjs.com](https://www.npmjs.com).
2. Click your profile icon $\rightarrow$ **Add Organization**.
3. Organization Name: `inqlab` (Select the free public plan).
4. In your terminal, authenticate:
   ```bash
   npm login
   ```

### Publishing `@inqlab/code`
Navigate to the package folder and publish:

```bash
cd packages/code
npm publish --access public
```

> **Important on Scoped Packages:** By default, npm treats `@scope/package` as private (which requires a paid plan). The `"publishConfig": { "access": "public" }` setting in `package.json` (or the `--access public` flag) ensures it publishes for free as a public package.

---

## 8. End-User Workflow & Editor Integration

Once published, developers run commands using `npx` (or `bunx`):

```bash
# 1. Authenticate via browser:
npx @inqlab/code login

# 2. View workspaces & projects:
npx @inqlab/code workspace list
npx @inqlab/code project list

# 3. Switch active branch context (saved in global config):
npx @inqlab/code branch switch feat/my-branch -p <project-slug>

# 4. Run Model Context Protocol stdio server:
npx @inqlab/code --mcp --project <project-slug>
```

### Cursor MCP Configuration (`.cursor/mcp.json`)
```json
{
  "mcpServers": {
    "cartocode": {
      "command": "npx",
      "args": [
        "-y",
        "@inqlab/code",
        "--mcp",
        "--project",
        "my-project-slug"
      ]
    }
  }
}
```

> **Dynamic Branch Resolution:** The active branch is dynamically resolved from global configuration on every tool call. Developers never need to specify `--branch` in `.cursor/mcp.json`. Running `npx @inqlab/code branch switch <name> -p <slug>` in any terminal immediately routes the running MCP server to the new branch with zero editor reloads.

---

## 9. Version Policy & 3-Level Governance

The CLI communicates with `https://cartocode.inqlab.dev/cli/version` on a 24-hour cache:

1. **Level 1 (Notice - There is an update):**
   When `currentVersion < latest` but above `deprecated`. The CLI prints an informational note (`ℹ Update available: v1.0.0 → v1.0.1 (run: npx @inqlab/code@latest)`) without blocking execution.
2. **Level 2 (Warning - Please update):**
   When `currentVersion < deprecated` but above `minSupported`. The CLI displays a prominent warning box urging the developer to upgrade before their version becomes unsupported.
3. **Level 3 (Hard Block - Shut the CLI):**
   When `currentVersion < minSupported`. Breaking changes prevent execution. The CLI displays an error box and immediately terminates with exit code `1`. During MCP stdio mode, this error routes strictly to `stderr` before exit.
