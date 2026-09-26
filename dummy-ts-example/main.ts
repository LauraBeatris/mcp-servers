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

const transport = new StdioServerTransport();
await server.connect(transport);
