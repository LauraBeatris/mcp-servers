import { appendFileSync } from "fs";
import { join } from "path";

const LOG_FILE = join(import.meta.dirname, "mcp-server.log");

function formatMessage(level: string, message: string, data?: unknown): string {
  const timestamp = new Date().toISOString();
  const dataStr = data ? ` ${JSON.stringify(data)}` : "";
  return `[${timestamp}] [${level}] ${message}${dataStr}\n`;
}

function write(level: string, message: string, data?: unknown) {
  const line = formatMessage(level, message, data);

  // Technique 1: stderr. stdout is the MCP transport, but stderr is a
  // separate pipe — clients like Claude Code capture it into their logs.
  process.stderr.write(line);

  // Technique 2: a local log file, so logs survive independently of the
  // client and you can `tail -f mcp-server.log` while developing.
  appendFileSync(LOG_FILE, line);
}

export const logger = {
  info: (message: string, data?: unknown) => write("INFO", message, data),
  warn: (message: string, data?: unknown) => write("WARN", message, data),
  error: (message: string, data?: unknown) => write("ERROR", message, data),
};
