import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod"

const server = new McpServer({
  name: "Prompt Directory",
  version: "1.0.0",
});

const getPrompt = (path: string) =>
  `
Clean up the transcript in the file at ${path}
Do not edit the words,
only the formatting and any incorrect transcriptions.
Turn long-form numbers to short-form:
One hundred and twenty-three -> 123
Three hundred thousand, four hundred and twenty-two -> 300,422
Add punctuation where necessary.
Wrap any references to code in backticks.
Include links as-is - do not modify links.

Common terms:
LLM-as-a-judge
ReAct
Reflexion
RAG
Vercel
`;

server.registerPrompt("cleanTranscription", {
  description: `Clean up a transcript file`,
  argsSchema: {
    path: z.string()
  },
}, async ({ path }) => {
  return {
    messages: [
      {
        role: "user",
        content: {
          type: "text",
          text: getPrompt(path)
        }
      }
    ]
  }
});

const transport = new StdioServerTransport();
await server.connect(transport);
