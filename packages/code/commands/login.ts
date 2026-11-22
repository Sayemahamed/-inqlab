import http from "node:http";
import { defineCommand } from "citty";
import { consola } from "consola";

import { openBrowser, saveConfig } from "../config";
import { BASE_URL, CALLBACK_PORT } from "../constants";

export async function runLoginFlow(): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const parsedUrl = new URL(
        req.url || "/",
        `http://localhost:${CALLBACK_PORT}`,
      );

      if (parsedUrl.pathname === "/callback") {
        const key = parsedUrl.searchParams.get("key");

        if (key) {
          saveConfig({ apiKey: key });

          res.writeHead(200, {
            "Content-Type": "text/html; charset=utf-8",
          });
          res.end(`
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="utf-8" />
                <title>CartoCode CLI — Authenticated</title>
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
                  <p>Your API key has been stored in <code>~/.inqlab/code.json</code>.<br><br>You can close this tab and return to your terminal.</p>
                </div>
              </body>
            </html>
          `);

          consola.success("Successfully authenticated with CartoCode!");
          consola.info("API key saved to ~/.inqlab/code.json");
          server.close(() => resolve());
          return;
        }

        res.writeHead(400, { "Content-Type": "text/plain" });
        res.end("Missing 'key' parameter in callback.");
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
      const authUrl = `${BASE_URL}/cli-auth?callback=${encodeURIComponent(callbackUrl)}`;

      consola.start("Starting temporary authentication server on port 9876...");
      consola.info("Opening browser for CartoCode authorization...");
      consola.info(`Auth URL: ${authUrl}\n`);
      openBrowser(authUrl);
    });
  });
}

export const loginCommand = defineCommand({
  meta: {
    name: "login",
    description: "Authenticate via browser and store API key",
  },
  async run() {
    await runLoginFlow();
  },
});
