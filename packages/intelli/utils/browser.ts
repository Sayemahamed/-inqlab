import { exec } from "node:child_process";
import { consola } from "consola";

/**
 * Opens a URL in the user's default browser across Darwin, Windows, and Linux.
 */
export function openBrowser(url: string): void {
  const cmd =
    process.platform === "darwin"
      ? "open"
      : process.platform === "win32"
        ? "start"
        : "xdg-open";

  exec(`${cmd} "${url}"`, (err) => {
    if (err) {
      consola.info(`Please open this URL in your browser:\n  ${url}\n`);
    }
  });
}
