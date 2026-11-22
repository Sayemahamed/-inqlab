export interface CliConfig {
  endpoint: string;
  token?: string;
  versionCache?: {
    lastChecked: number;
    payload: CliVersionPayload;
  };
}

export interface CliUser {
  id: string;
  email: string;
  name?: string;
}

export interface CliLanguage {
  id: string;
  name: string;
}

export interface CliProject {
  id: string;
  name: string;
  languageId?: string | null;
  projectDetails?: string | null;
  instructorModel?: string | null;
  backgroundModel?: string | null;
  anonymousTokenLimit?: number;
  createdAt: string;
}

export interface CreateProjectCliPayload {
  name: string;
  languageId?: string | null;
  projectDetails?: string | null;
  instructorModel?: string | null;
  backgroundModel?: string | null;
  initialMessage?: string | null;
  siteMap?: Record<string, string> | null;
  geminiApiKey?: string | null;
  anonymousTokenLimit?: number;
}

export interface CliVersionPayload {
  latest: string;
  deprecated: string;
  minSupported: string;
  message?: string | null;
}

export interface CliVersionResponse extends CliVersionPayload {}
