import os from "node:os";
import path from "node:path";

/**
 * Immutable production hosted server endpoint.
 */
export const BASE_URL = "https://cartocode.inqlab.dev";

/**
 * Immutable authentication callback port.
 */
export const CALLBACK_PORT = 9876;

/**
 * Global configuration directory and file locations.
 */
export const CONFIG_DIR = path.join(os.homedir(), ".cartocode");
export const CONFIG_FILE = path.join(CONFIG_DIR, "config.json");

/**
 * Package release version for @inqlab/code.
 */
export const CLI_VERSION = "1.0.0";

/**
 * Model Context Protocol server metadata.
 */
export const MCP_SERVER_NAME = "cartocode";
export const MCP_SERVER_VERSION = "2.0.0";
