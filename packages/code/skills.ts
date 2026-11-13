/**
 * Hardcoded CartoCode Architectural Journaling & MCP Skills Guide for @inqlab/code.
 */
export const SKILLS_GUIDE = `# CartoCode MCP Architectural Journaling Reference & Skills Guide (@inqlab/code)

CartoCode transforms your local coding actions into an event-sourced, living architecture graph. As an AI Agent, you journal code entities, contracts, and connections in real time.

---

## 1. Standard Agent Lifecycle Workflow

Follow this sequence during software tasks:

\`\`\`
1. Load Architecture Context ──► 2. Code & Batch Journal ──► 3. Verify / Retract
   (getArchitectureContext)         (batchAddNodes + batchAddEdges)   (retract if needed)
\`\`\`

1. **Load Architecture Context:**
   - **Global Overview:** Call \`getArchitectureContext({})\` to inspect all nodes, existing parameter contracts, and directional dependency edges across the active branch before modifying code.
   - **Focused Blast Radius:** Call \`getArchitectureContext({ node: 'server/api/users.get.ts', depth: 1 })\` to inspect only the immediate callers and callees connected to a focal node.
2. **Isolated Feature Branches:** Call \`getArchitectureContext({ branchName: 'feat/my-feature' })\` or run \`npx @inqlab/code branch switch feat/my-feature -p <project>\` to target or switch branches. New branches automatically duplicate the complete baseline architecture so you can journal feature additions against the full existing graph.
3. **Journal As You Code (Batch Ingestion):**
   - When creating or refactoring code units (files, functions, routes, components), call \`batchAddNodes\`.
   - When linking callers to callees (imports, function calls, queries, renders), call \`batchAddEdges\`.
4. **Revert Mistakes:** Call \`retract({ steps: N })\` to roll back recent activity entries and decrement the branch counter.

---

## 2. Node Path Conventions (relativePath)

Use consistent and unambiguous identifiers:
- **File-Level Node:** \`src/services/auth.ts\` or \`server/api/users.get.ts\`
- **Symbol / Function Level Node:** \`src/services/auth.ts#login\` or \`src/controllers/auth.ts#handleLogin\`
- **Component Level Node:** \`app/components/Navbar.vue\` or \`src/components/UserCard.tsx#UserCard\`
- **Database Schema Node:** \`server/db/schemas/user.ts#usersTable\`

---

## 3. Node Classification & Group Taxonomy (data.group)

**CRITICAL FOR VISUALIZATION:** Always include \`group\` in the \`data\` object of \`batchAddNodes\` to enable automated clustering, color-coding, and layered layouts in the Web UI:

| Group | Purpose & Scope | Examples |
| :--- | :--- | :--- |
| **\`api\`** | HTTP endpoints, REST/GraphQL routes, RPC controllers, route handlers | \`server/api/login.post.ts\`, \`routes/user.ts#getUser\` |
| **\`service\`** | Domain business logic, core application services, orchestrators | \`services/auth.service.ts\`, \`services/payment.ts#charge\` |
| **\`function\`** | Pure utility functions, helper algorithms, calculation routines | \`utils/format.ts#formatDate\`, \`helpers/crypto.ts#hash\` |
| **\`db\`** | Database tables, ORM schemas (Drizzle/Prisma), raw SQL repositories | \`db/schemas/user.ts#users\`, \`queries/orders.ts#getOrders\` |
| **\`component\`** | Frontend UI components, Vue/React templates, visual widgets | \`components/Navbar.vue\`, \`views/Dashboard.vue\` |
| **\`middleware\`** | Auth guards, request interceptors, rate limiters, session checkers | \`middleware/auth.ts\`, \`guards/permission.ts\` |
| **\`model\`** | Domain data types, TypeScript interfaces, Zod/Valibot validation schemas | \`types/user.ts#User\`, \`schemas/login.ts#LoginInput\` |
| **\`hook\`** | React hooks, Vue composables, state accessors | \`composables/useUser.ts\`, \`hooks/useCart.ts\` |
| **\`config\`** | Configuration modules, environment settings, service clients | \`config/db.ts\`, \`utils/redis.ts#redisClient\` |

### Node Metadata & IDE Start Line (data.line / data.lines)
- **Start Line Number:** Provide \`line\` (or \`lines\`) as a 1-based integer representing the starting line of the function, component, or symbol in the source file (e.g. \`{ line: 42, group: 'service' }\`).
- **Purpose:** Used for editor deep-linking (\`vscode://file/...:line\`) to jump directly to the entity's definition. It is **NOT** the total lines of code count.

---

## 4. Parameter Contract Specification

MCP clients frequently strip empty objects \`{}\` or \`null\` values. CartoCode uses explicit conventions:

### Parameter Formats
- **Simple Types:** \`{ "userId": "string", "isAdmin": "boolean", "limit": "number" }\`
- **Detailed Schema Objects (with defaults & optionality):**
  \`\`\`json
  {
    "limit": { "type": "number", "default": 10 },
    "cursor": { "type": "string", "optional": true },
    "filters": { "type": "FilterPayload" }
  }
  \`\`\`

### Lifecycle Rules
- **First Registration:** \`parameter\` is **REQUIRED**. Pass the parameter definitions object, or \`'void'\` if the node takes no parameters.
- **Metadata Update Only (No Parameter Changes):** Pass \`'void'\` (or omit). The server preserves the existing parameter contract and avoids false breaking change alerts.
- **Remove/Drop Parameters:** Pass \`'drop'\`. Persists \`null\` in the database.
- **Modify Parameter Types:** Pass the updated parameters object. The server compares against the merged history, detects breaking changes, and **automatically returns a list of affected caller edges**!

---

## 5. Edge Relationship Taxonomy & Contract Enforcement

When calling \`batchAddEdges\`:

### Rules
1. Both \`from\` and \`to\` nodes **must already be registered** with \`batchAddNodes\`.
2. \`connectionType\` identifies the nature of the link:
   - \`'function_call'\` — Direct method invocation or function execution.
   - \`'imports'\` — Module or symbol import dependency.
   - \`'depends_on'\` — Structural, service, or architectural dependency.
   - \`'writes_to'\` / \`'reads_from'\` — Database or storage access.
   - \`'renders'\` — UI component rendering a child component.
   - \`'implements'\` — Class implementing an interface or abstract contract.
   - \`'routes_to'\` — Gateway/Router directing traffic to a handler.
3. \`parameter\` validation:
   - Pass arguments sent across this connection (e.g. \`{ "userId": "string" }\`).
   - The server validates that all passed keys match declared parameters on the target \`to\` node.
   - Optional/default parameters on the target node **can be safely omitted** by the caller.
   - Pass \`'void'\` if no parameters are passed or if keeping previous connection parameters.
   - Pass \`'drop'\` to clear connection parameters.

---

## 6. Batching Guidelines

- **Atomic Registration:** When creating or analyzing a module, register all nodes via \`batchAddNodes\` (1 to 50 items), then link connections via \`batchAddEdges\` (1 to 50 items).
- **Dependency Order:** Always register nodes before registering the edges connecting them.
- **Undo Actions:** Call \`retract({ steps: N })\` to undo recent activity entries on the branch.
`;
