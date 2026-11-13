import { BASE_URL } from "./constants";

export interface WorkspaceItem {
  id?: string;
  name: string;
  slug: string;
  role?: string;
}

export interface ProjectItem {
  id?: string;
  name: string;
  slug: string;
  workspaceSlug?: string;
  workspaceName?: string;
}

export interface BranchItem {
  id?: string;
  name: string;
  activityCount: number;
  parentBranchId?: string;
}

export interface BranchCreateResult {
  success: boolean;
  branch: string;
  parentBranch: string;
  activityCount: number;
  createdAt: string;
}

export interface PathUpdateResult {
  success: boolean;
  project: string;
  path: string;
}

export interface McpContentItem {
  type: string;
  text?: string;
}

export interface McpRpcResponse {
  content?: McpContentItem[];
  isError?: boolean;
}

export interface CliVersionPayload {
  latest: string;
  deprecated: string;
  minSupported: string;
  message?: string | null;
}

/**
 * Custom error class capturing HTTP status and server error messages.
 */
export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function request<T>(
  path: string,
  options: {
    method?: string;
    apiKey: string;
    projectSlug?: string;
    branchName?: string;
    body?: unknown;
  },
): Promise<T> {
  const headers: Record<string, string> = {
    "x-api-key": options.apiKey,
  };

  if (options.projectSlug) {
    headers["x-project"] = options.projectSlug;
  }
  if (options.branchName) {
    headers["x-branch"] = options.branchName;
  }
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  const url = `${BASE_URL}${path}`;
  const res = await fetch(url, {
    method: options.method ?? "GET",
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  if (!res.ok) {
    const errorText = await res.text();
    let message = `Request to ${path} failed with HTTP ${res.status}`;
    try {
      const parsed: unknown = JSON.parse(errorText);
      if (typeof parsed === "object" && parsed !== null) {
        const errorObj = parsed as { message?: string; statusMessage?: string };
        message = errorObj.message || errorObj.statusMessage || errorText;
      }
    } catch {
      if (
        errorText.trim().length > 0 &&
        !errorText.includes("<!DOCTYPE") &&
        !errorText.includes("<html")
      ) {
        message = errorText;
      } else {
        message = `Server returned HTTP ${res.status} (${res.statusText || "Invalid response"})`;
      }
    }
    throw new ApiError(res.status, message);
  }

  return (await res.json()) as T;
}

/**
 * Fetches the version policy payload from the hosted endpoint.
 */
export async function fetchCliVersion(): Promise<CliVersionPayload> {
  const url = `${BASE_URL}/cli/version`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new ApiError(
      res.status,
      `Failed to fetch version policy (HTTP ${res.status})`,
    );
  }
  return (await res.json()) as CliVersionPayload;
}

export async function listWorkspaces(apiKey: string): Promise<WorkspaceItem[]> {
  return request<WorkspaceItem[]>("/cli/workspaces", { apiKey });
}

/**
 * Creates a new workspace.
 */
export async function createWorkspace(
  apiKey: string,
  name: string,
  description?: string,
): Promise<WorkspaceItem> {
  return request<WorkspaceItem>("/cli/workspaces", {
    method: "POST",
    apiKey,
    body: { name, description },
  });
}

/**
 * Lists projects, optionally filtered by workspace slug.
 */
export async function listProjects(
  apiKey: string,
  workspaceSlug?: string,
): Promise<ProjectItem[]> {
  const endpoint = workspaceSlug
    ? `/cli/projects?workspace=${encodeURIComponent(workspaceSlug)}`
    : "/cli/projects";
  return request<ProjectItem[]>(endpoint, { apiKey });
}

/**
 * Creates a project within a workspace.
 */
export async function createProject(
  apiKey: string,
  workspaceSlug: string,
  name: string,
  description?: string,
  readme?: string,
): Promise<ProjectItem> {
  return request<ProjectItem>("/cli/projects", {
    method: "POST",
    apiKey,
    body: { workspace: workspaceSlug, name, description, readme },
  });
}

/**
 * Links a local filesystem repository path to a project.
 */
export async function updateProjectPath(
  apiKey: string,
  projectSlug: string,
  targetPath: string,
): Promise<PathUpdateResult> {
  return request<PathUpdateResult>("/cli/path", {
    method: "POST",
    apiKey,
    body: { project: projectSlug, path: targetPath },
  });
}

/**
 * Lists branches for a project.
 */
export async function listBranches(
  apiKey: string,
  projectSlug: string,
): Promise<BranchItem[]> {
  return request<BranchItem[]>(
    `/cli/branches?project=${encodeURIComponent(projectSlug)}`,
    { apiKey },
  );
}

/**
 * Creates a branch copying active state from a parent branch.
 */
export async function createBranch(
  apiKey: string,
  projectSlug: string,
  branchName: string,
  fromBranch?: string,
): Promise<BranchCreateResult> {
  return request<BranchCreateResult>("/cli/branches", {
    method: "POST",
    apiKey,
    projectSlug,
    body: { project: projectSlug, name: branchName, from: fromBranch },
  });
}

/**
 * Executes a remote Model Context Protocol tool via /mcp/rpc.
 */
export async function executeRemoteRpc(
  apiKey: string,
  projectSlug: string,
  branchName: string,
  tool: string,
  args: Record<string, unknown> = {},
): Promise<McpRpcResponse> {
  return request<McpRpcResponse>("/mcp/rpc", {
    method: "POST",
    apiKey,
    projectSlug,
    branchName,
    body: { tool, arguments: args },
  });
}
