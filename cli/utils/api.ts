import type { CliConfig } from "../types";
import { loadConfig } from "./config";

export class ApiClient {
  private config: CliConfig;

  constructor(config?: CliConfig) {
    this.config = config || loadConfig();
  }

  async get<T>(path: string): Promise<T> {
    return this.request<T>(path, { method: "GET" });
  }

  async post<T>(path: string, body?: unknown): Promise<T> {
    return this.request<T>(path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: body ? JSON.stringify(body) : undefined,
    });
  }

  private async request<T>(path: string, init: RequestInit): Promise<T> {
    const url = new URL(path, this.config.endpoint).toString();
    const headers: Record<string, string> = {
      Accept: "application/json",
      ...(init.headers as Record<string, string>),
    };

    if (this.config.token) {
      headers.Authorization = `Bearer ${this.config.token}`;
    }

    const response = await fetch(url, { ...init, headers });

    if (!response.ok) {
      let errMessage = `HTTP ${response.status}: ${response.statusText}`;
      try {
        const errJson = (await response.json()) as {
          message?: string;
          statusMessage?: string;
        };
        errMessage = errJson.message || errJson.statusMessage || errMessage;
      } catch {}
      throw new Error(errMessage);
    }

    return (await response.json()) as T;
  }
}
