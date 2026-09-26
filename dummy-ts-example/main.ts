import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";

const server = new McpServer({
  name: "Weather Service",
  version: "1.0.0",
});

server.registerTool(
  "getWeather",
  {
    title: "Get Weather",
    description: "Returns the current weather for a city",
    inputSchema: {
      city: z.string(),
    },
  },
  async ({ city }) => {
    return {
      content: [
        {
          type: "text",
          text: `The weather in ${city} is sunny!`,
        },
      ],
    };
  },
);

const getPrompt = (path: string) =>
  `
Clean up the transcript in the file at ${path}
Do not edit the words,
only the formatting and any incorrect transcriptions.
Turn long-form numbers to short-form:
One hundred and twenty-three -> 123
Add punctuation where necessary.
Wrap any references to code in backticks.
Include links as-is - do not modify links.
`;

server.registerPrompt(
  "cleanTranscription",
  {
    description: "Clean up a transcript file",
    argsSchema: {
      path: z.string(),
    },
  },
  async ({ path }) => {
    return {
      messages: [
        {
          role: "user",
          content: {
            type: "text",
            text: getPrompt(path),
          },
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);
