# Logging in a stdio MCP server (and why `console.log` breaks everything)

This example shows how to log safely from an MCP server that uses the
**stdio transport** and why the obvious approach, `console.log`, corrupts
the connection.

## The setup: who talks to whom

When you register this server with a client like Claude Code:

```sh
claude mcp add logging-example -- npx tsx ./main.ts
```

the **client (Claude Code)** launches `main.ts` as a child process and talks
to it through the process's standard pipes:

- It writes requests into the server's **stdin**.
- It reads responses from the server's **stdout**.

### What's a pipe?

A pipe is a one-way channel the operating system gives two programs to pass
text to each other: one program writes into it, the other reads out of it,
like a physical tube between them. Every process is born with three standard
ones:

| Pipe | Direction | Written by | Node API |
| --- | --- | --- | --- |
| **stdin** ("standard input") | into the program | whoever launched it | `process.stdin` |
| **stdout** ("standard output") | out of the program | `console.log` | `process.stdout` |
| **stderr** ("standard error") | out of the program | `console.error` | `process.stderr` |

When you run a program in a terminal, the terminal holds the other end of all
three: what you type goes to stdin, and both stdout and stderr get printed to
your screen which is why `console.log` and `console.error` *look* identical
there. But they are two physically separate channels, and a program that
launches another one (like Claude Code launching this server) can read each
end separately and treat them completely differently. That difference is the
whole story below.

The messages are **JSON-RPC**: one JSON object per line, like

```json
{"jsonrpc":"2.0","id":3,"method":"tools/call","params":{"name":"rollDice","arguments":{"sides":6}}}
```

That's the entire transport. No network — just two programs sharing pipes.

## The footgun

`console.log` writes to **stdout** - the same pipe the client is parsing as
JSON-RPC. One innocent log line:

```ts
console.log("rolling dice...");
```

lands in the middle of the protocol stream. The client tries to parse
`rolling dice...` as JSON and fails. Depending on the client, your logs get
silently swallowed, requests hang, or the connection drops entirely. The
symptom usually looks like "my server fails to connect" with no obvious cause.

```
Claude Code ──(JSON requests)──▶ stdin  ┐
Claude Code ◀──(JSON responses)─ stdout ├─ main.ts   ← console.log pollutes this!
Claude Code ◀··(logs, captured)· stderr ┘            ← console.error is safe
```

## The fix: two safe channels

`logger.ts` in this folder demonstrates both, at once:

1. **stderr** — a *separate* pipe that is not part of the transport. Clients
   capture it as debug output (Claude Code saves it under
   `~/Library/Caches/claude-cli-nodejs/`). In a pinch, just swap
   `console.log` → `console.error`.

2. **A log file** — `logger` appends every line to `mcp-server.log` next to
   the server, so you can watch logs live while the client runs the server:

   ```sh
   tail -f mcp-server.log
   ```

## Try it

```sh
pnpm install
printf '%s\n%s\n%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"debug","version":"1.0"}}}' \
  '{"jsonrpc":"2.0","method":"notifications/initialized"}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"rollDice","arguments":{"sides":6}}}' \
  | npx tsx main.ts
```

You'll see clean JSON responses on stdout, the log lines on stderr, and the
same log lines appended to `mcp-server.log`. Now uncomment the `console.log`
in `main.ts` and run it again to see the polluted stdout stream a real client
would choke on.

## Notes

- **HTTP-based transports don't have this problem.** With Streamable HTTP (or
  the older SSE transport), messages travel over a network connection, so
  stdout is a normal terminal again and `console.log` is harmless.
- **MCP logging notifications** (`sendLoggingMessage`) used to be the
  in-protocol alternative, but they were deprecated by SEP-2577. The official
  guidance today is exactly what this example does: log to **stderr** for
  stdio servers.
