<div align="center">

# @inqlab/intelli

**Intelli Autonomous In-Browser Voice Agent Control Plane & CLI**

[![npm version](https://img.shields.io/npm/v/@inqlab/intelli.svg?style=flat-square)](https://www.npmjs.com/package/@inqlab/intelli)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg?style=flat-square)](https://opensource.org/licenses/MIT)
[![Node: >=18](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg?style=flat-square)](https://nodejs.org/)
[![Bun: Ready](https://img.shields.io/badge/bun-ready-black.svg?style=flat-square)](https://bun.sh/)
[![Platform](https://img.shields.io/badge/platform-intelli.inqlab.dev-purple.svg?style=flat-square)](https://intelli.inqlab.dev)
[![Author](https://img.shields.io/badge/author-Sayem%20Ahamed-black.svg?style=flat-square)](https://github.com/Sayemahamed)

</div>

---

## ⚡ Overview

`@inqlab/intelli` is the official command-line interface for **[Intelli](https://intelli.inqlab.dev)**, the full-stack control plane and real-time backend engine for autonomous in-browser voice agents.

It streamlines agent creation, model configuration, API key provisioning, and local environment setup directly from your terminal.

### Key Capabilities

* 🎙️ **Real-Time Speech-to-Speech Control**: Configure low-latency in-browser voice agents powered by Gemini models.
* 🔐 **Loopback Browser Authentication**: One-click browser login storing session tokens securely in `~/.inqlab/intelli.json`.
* 🛠️ **Interactive Project Bootstrapping**: Interactively select instructor and background models (`gemini-3.5-flash-lite`, `gemini-3.8-flash`, `gemini-2.5-flash`), primary languages, and custom keys.
* 🔑 **Scoped API Key Generation**: Generate project-scoped credentials and automatically append them to local `.env` files.
* 🔄 **Governance & Version Policy**: Automated 3-level version checking against the hosted Intelli platform with 24-hour cache.

---

## 🚀 Quick Start

Run directly without global installation using **bunx** (or **npx**):

```bash
# 1. Authenticate via browser loopback
bunx @inqlab/intelli login

# 2. List your projects
bunx @inqlab/intelli list

# 3. Interactively create a new project
bunx @inqlab/intelli create

# 4. Generate a scoped API key and append to .env
bunx @inqlab/intelli api-key
```

---

## 🛠️ CLI Command Reference

| Command | Aliases | Description | Key Options / Arguments |
| :--- | :--- | :--- | :--- |
| `login` | `auth` | Authenticate via browser loopback port 9877 | `[token]`, `--endpoint` |
| `list` | `ls` | List all projects owned by authenticated account | |
| `create` | `init` | Interactively create project and generate API key | `--name`, `--language`, `--instructor`, `--background`, `--apiKey` |
| `api-key` | `key` | Generate scoped API key for existing project | `[projectId]`, `--name` |
| `guide` | | Display agent setup and Client SDK integration guide | |
| `version` | | Show local CLI version and inspect platform version policy | |

### Non-Interactive Project Creation Example

```bash
bunx @inqlab/intelli create \
  --name "Customer Support Agent" \
  --instructor gemini-3.5-flash-lite \
  --background gemini-3.5-flash-lite
```

---

## 📦 In-Browser Client SDK Integration

Once your project and API key are generated, embed the Intelli Voice Agent in any client web application:

```html
<script type="module">
  import { IntelliAgent } from "https://intelli.inqlab.dev/sdk/index.js";

  const agent = new IntelliAgent({
    projectId: "your-project-id",
    apiKey: "your-api-key",
  });

  await agent.connect();
</script>
```

---

## ⚙️ Configuration & Environment

User configuration and session tokens are stored in `~/.inqlab/intelli.json`:

```json
{
  "endpoint": "https://intelli.inqlab.dev",
  "token": "itl_live_..."
}
```

Environment variable overrides:
- `INTELLI_ENDPOINT`: Custom hosted backend endpoint.
- `INTELLI_PROJECT_ID`: Default project ID.
- `INTELLI_API_KEY`: Scoped project API key.

---

## 📄 License

[MIT](https://github.com/Sayemahamed/-inqlab/blob/main/LICENSE) © [Sayem Ahamed](https://github.com/Sayemahamed)
