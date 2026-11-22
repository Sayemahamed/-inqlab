<div align="center">

# @inqlab/intelli

**Intelli Autonomous In-Browser Voice Agent Control Plane & CLI**

[![npm version](https://img.shields.io/npm/v/@inqlab/intelli.svg?style=flat-square)](https://www.npmjs.com/package/@inqlab/intelli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node: >=18](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)
[![Bun: Ready](https://img.shields.io/badge/bun-ready-black.svg?style=flat-square)](https://bun.sh/)
[![Platform](https://img.shields.io/badge/platform-intelli.inqlab.dev-purple.svg?style=flat-square)](https://intelli.inqlab.dev)

</div>

---

## ⚡ Overview

`@inqlab/intelli` is the official command-line interface for **[Intelli](https://intelli.inqlab.dev)**, the full-stack control plane and real-time backend engine for autonomous in-browser voice agents.

---

## 🚀 Quick Start

Run directly using `npx` or `bunx`:

```bash
# 1. Authenticate with your token
npx @inqlab/intelli login

# 2. List your projects
npx @inqlab/intelli list

# 3. Create a project
npx @inqlab/intelli create

# 4. Generate an API key
npx @inqlab/intelli api-key
```

---

## 🛠️ CLI Command Reference

| Command | Description |
| :--- | :--- |
| `npx @inqlab/intelli login` | Authenticate CLI with server token |
| `npx @inqlab/intelli list` | List all projects for authenticated user |
| `npx @inqlab/intelli create` | Create a new Intelli project interactively |
| `npx @inqlab/intelli api-key` | Generate scoped API key for project |
| `npx @inqlab/intelli guide` | Print agent setup and SDK guide |
| `npx @inqlab/intelli version` | Check local version against server policy |

---

## 📄 License

MIT © [Sayem Ahamed](https://github.com/Sayemahamed)
