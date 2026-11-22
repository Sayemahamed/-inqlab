<div align="center">

# Inqlab Monorepo

**The Developer Platform and CLI Suite for Inqlab Technologies**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node: >=18](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)
[![Bun: Ready](https://img.shields.io/badge/bun-ready-black.svg?style=flat-square)](https://bun.sh/)
[![Author: Sayem Ahamed](https://img.shields.io/badge/author-Sayem%20Ahamed-black.svg?style=flat-square)](https://github.com/Sayemahamed)

</div>

---

## 📦 Packages in this Repository

| Package | Version | Description | Platform |
| :--- | :--- | :--- | :--- |
| **[@inqlab/code](file:///home/sayem/Source/Nuxt/@inqlab/packages/code/README.md)** | `1.0.3` | CartoCode Architecture Graph Engine & Model Context Protocol (MCP) CLI | [cartocode.inqlab.dev](https://cartocode.inqlab.dev) |
| **[@inqlab/intelli](file:///home/sayem/Source/Nuxt/@inqlab/packages/intelli/README.md)** | `1.0.1` | Intelli Autonomous In-Browser Voice Agent Control Plane & CLI | [intelli.inqlab.dev](https://intelli.inqlab.dev) |

---

## ⚡ Quick Start

Run both CLIs directly with **bunx** (or **npx**):

### 1. CartoCode Architecture CLI (`@inqlab/code`)

```bash
# Authenticate and launch stdio MCP gateway for Cursor & Claude
bunx @inqlab/code login
bunx @inqlab/code --mcp -p <project-slug>
```

### 2. Intelli Voice Agent Control Plane (`@inqlab/intelli`)

```bash
# Authenticate and interactively bootstrap in-browser voice projects
bunx @inqlab/intelli login
bunx @inqlab/intelli create
bunx @inqlab/intelli api-key
```

---

## 🛠️ Monorepo Development & Workspaces

This repository is powered by **Bun** workspaces:

```bash
# Install workspace dependencies
bun install

# Build all packages simultaneously
bun run build

# Run test suites and help commands across all packages
bun run test

# Typecheck workspace TypeScript files
bunx tsc --noEmit
```

All user configurations are stored under `~/.inqlab/*.json` (`code.json` and `intelli.json`).

---

## 📄 License

[MIT](file:///home/sayem/Source/Nuxt/@inqlab/LICENSE) © [Sayem Ahamed](https://github.com/Sayemahamed)
