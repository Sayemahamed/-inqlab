<div align="center">

# @inqlab/code

**CartoCode Architecture Graph Engine & Model Context Protocol (MCP) CLI**

[![npm version](https://img.shields.io/npm/v/@inqlab/code.svg?style=flat-square)](https://www.npmjs.com/package/@inqlab/code)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node: >=18](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)
[![Bun: Ready](https://img.shields.io/badge/bun-ready-black.svg?style=flat-square)](https://bun.sh/)
[![Platform](https://img.shields.io/badge/platform-cartocode.inqlab.dev-purple.svg?style=flat-square)](https://cartocode.inqlab.dev)

</div>

---

## ⚡ Overview

`@inqlab/code` is the official command-line interface and Model Context Protocol (MCP) gateway for **[CartoCode](https://cartocode.inqlab.dev)**.

It connects AI development assistants (like **Cursor**, **Claude Desktop**, and **Windsurf**) directly to your live software architecture graph over stdio JSON-RPC.

### Why CartoCode?

* 🧠 **Architectural Grounding**: Eliminates hallucinated dependencies by feeding real structural dependency subgraphs into your AI context.
* 🔄 **Dynamic Branch Tracking**: Switch active working branches on the fly from any terminal—your editor's running MCP gateway routes calls to the new branch instantly with zero editor reloads.
* 📝 **Architectural Journaling**: Automatically record architectural changes (nodes, relations, contracts) in lockstep with your Git commits.
* 🔐 **Seamless Browser Authentication**: One-command browser login storing credentials securely in your user home configuration.

---

## 🚀 Quick Start

No permanent global installation required—run directly with `npx` (or `bunx`):

```bash
# 1. Authenticate via browser callback
npx @inqlab/code login

# 2. View workspaces and projects
npx @inqlab/code workspace list
npx @inqlab/code project list

# 3. Set your active branch
npx @inqlab/code branch switch feat/my-branch -p <project-slug>

# 4. Start the MCP stdio gateway
npx @inqlab/code --mcp -p <project-slug>
```

---

## 💻 Editor Integration

### 1. Cursor Setup (`.cursor/mcp.json`)

Add the following to your project's `.cursor/mcp.json` (or global Cursor MCP settings):

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

> **Dynamic Branch Resolution**: You do not need to hardcode `--branch` in `.cursor/mcp.json`. Running `npx @inqlab/code branch switch <name> -p <slug>` in any terminal immediately redirects the active MCP session to that branch.

### 2. Claude Desktop Setup (`claude_desktop_config.json`)

On macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`  
On Windows: `%APPDATA%\Claude\claude_desktop_config.json`

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

---

## 🛠️ CLI Command Reference

| Command | Description |
| :--- | :--- |
| `npx @inqlab/code login` | Authenticate in browser via local loopback port |
| `npx @inqlab/code workspace list` | List accessible workspaces for current user |
| `npx @inqlab/code workspace create <name>` | Create a new workspace |
| `npx @inqlab/code project list [-w <slug>]` | List projects (all or filtered by workspace) |
| `npx @inqlab/code project create <name> -w <slug>` | Create a new project within a workspace |
| `npx @inqlab/code project path <slug> [path]` | Link local repository directory for IDE navigation |
| `npx @inqlab/code branch list -p <slug>` | List project branches with activity counts |
| `npx @inqlab/code branch switch <name> -p <slug>` | Set global active branch for project |
| `npx @inqlab/code branch create <name> -p <slug>` | Fork branch copying state from active branch |
| `npx @inqlab/code test -p <slug>` | Test API key validation and branch latency |
| `npx @inqlab/code --mcp -p <slug>` | Launch stdio Model Context Protocol gateway |

---

## 🧰 Built-in MCP Tools

When the server runs in `--mcp` mode, it exposes the following tool suite to the AI model:

| Tool | Purpose |
| :--- | :--- |
| `getArchitectureContext` | Retrieves system graph or focused subgraph for a focal file/symbol up to depth 3 |
| `batchAddNodes` | Atomic batch creation/updating of architectural entities (`api`, `db`, `service`, `function`, etc.) |
| `batchAddEdges` | Atomic batch creation of directional dependencies, calls, and contracts |
| `retract` | Undoes recent recorded architectural journal activities on the active branch |
| `skills` | Inlines complete workflow rules, naming taxonomy, and parameter contract conventions |

---

## 📋 Architectural Taxonomy (Node Groups)

When recording code nodes via `batchAddNodes`, standard categories include:

- `api` — HTTP endpoints, GraphQL resolvers, tRPC procedures
- `service` — Business logic layers and domain orchestrators
- `db` — Database schemas, tables, collections, queries, migrations
- `function` — Pure functions, utilities, math helpers
- `component` — UI components and views
- `middleware` — Request interceptors, guards, auth validators
- `model` — Data models, schemas, entity types
- `hook` — Composable lifecycle and state hooks
- `config` — Configuration loaders and environment factories

---

## ⚙️ Configuration & Environment

Configuration is stored in `~/.cartocode/config.json`:

```json
{
  "apiKey": "cc_live_...",
  "activeBranches": {
    "my-project-slug": "feat/user-auth"
  }
}
```

Environment variable overrides:
- `CARTOCODE_API_KEY`: Override stored API key.
- `CARTOCODE_PROJECT`: Default project slug.
- `CARTOCODE_BRANCH`: Override dynamic branch resolution.

---

## 📄 License

[MIT](https://github.com/Sayemahamed/-inqlab/blob/main/LICENSE) © [Sayem Ahamed](https://github.com/Sayemahamed)
