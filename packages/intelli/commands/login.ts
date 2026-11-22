import http from "node:http";
import { defineCommand } from "citty";
import { consola } from "consola";

import { CALLBACK_PORT, DEFAULT_ENDPOINT } from "../constants";
import type { CliUser } from "../types";
import { ApiClient } from "../utils/api";
import { openBrowser } from "../utils/browser";
import { loadConfig, saveConfig } from "../utils/config";

export async function runLoginFlow(tokenArg?: string, endpointArg?: string): Promise<void> {
  const currentConfig = loadConfig();
  const endpoint = endpointArg || currentConfig.endpoint || DEFAULT_ENDPOINT;
  saveConfig({ endpoint });

  if (tokenArg) {
    saveConfig({ token: tokenArg });
    try {
      const api = new ApiClient({ endpoint, token: tokenArg });
      const res = await api.get<{ success: boolean; user: CliUser }>("/cli/auth");
      consola.success(
        `Logged in successfully as ${res.user.email} (${res.user.id})`,
      );
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err);
      consola.error(`Login verification failed: ${message}`);
    }
    return;
  }

  return new Promise<void>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(
        req.url || "/",
        `http://localhost:${CALLBACK_PORT}`,
      );

      if (parsedUrl.pathname === "/callback") {
        const token =
          parsedUrl.searchParams.get("token") ||
          parsedUrl.searchParams.get("key");

        if (token) {
          saveConfig({ token });

          res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
          });
          res.end(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <title>Intelli CLI — Authenticated</title>
                <style>
                  body {
                    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                    background-color: #0b0f19;
                    color: #f1f5f9;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    height: 100vh;
                    margin: 0;
                  }
                  .card {
                    background-color: #161e2e;
                    border: 1px solid #27354a;
                    border-radius: 16px;
                    padding: 40px;
                    max-width: 420px;
                    text-align: center;
                    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                  }
                  .icon {
                    width: 56px;
                    height: 56px;
                    border-radius: 50%;
                    background: rgba(34, 197, 94, 0.15);
                    color: #22c55e;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin: 0 auto 20px;
                    font-size: 28px;
                  }
                  h1 { font-size: 20px; margin: 0 0 8px; font-weight: 700; }
                  p { font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 0; }
                </style>
              </head>
              <body>
                <div class="card">
                  <div class="icon">✓</div>
                  <h1>CLI Authenticated!</h1>
                  <p>Your authentication token has been stored in <code>~/.inqlab/intelli.json</code>.<br><br>You can close this tab and return to your terminal.</p>
                </div>
              </body>
            </html>
          `);

          consola.success("Successfully authenticated with Intelli!");
          consola.info("Token saved to ~/.inqlab/intelli.json");
          server.close(() => resolve());
          return;
        }

        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Missing 'token' or 'key' parameter in callback.");
        return;
      }

      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    });

    server.on("error", (err: unknown) => {
      server.close();
      reject(err);
    });

    server.listen(CALLBACK_PORT, () => {
      const callbackUrl = `http://localhost:${CALLBACK_PORT}/callback`;
      const base = endpoint.replace(/\/$/, "");
      const authUrl = `${base}/cli-auth?callback=${encodeURIComponent(callbackUrl)}`;

      consola.start(`Starting temporary authentication server on port ${CALLBACK_PORT}...`);
      consola.info("Opening browser for Intelli authorization...");
      consola.info(`Auth URL: ${authUrl}\n`);
      openBrowser(authUrl);
    });
  });
}

export const loginCommand = defineCommand({
  meta: {
    name: "login",
    description: "Authenticate via browser and store API token",
  },
  args: {
    token: {
      type: "positional",
      description: "Direct session token or API key",
      required: false,
    },
    endpoint: {
      type: "string",
      description: "Custom Intelli server endpoint",
      required: false,
    },
  },
  async run({ args }) {
    await runLoginFlow(args.token, args.endpoint);
  },
});
