import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { logger } from "./logger.js";

const server = new McpServer({
  name: "Logging Example",
  version: "1.0.0",
});

server.registerTool(
  "rollDice",
  {
    title: "Roll Dice",
    description: "Rolls a dice with the given number of sides",
    inputSchema: {
      sides: z.number().int().min(2),
    },
  },
  async ({ sides }) => {
    logger.info("rollDice called", { sides });

    const result = Math.floor(Math.random() * sides) + 1;
    logger.info("rollDice result", { result });

    return {
      content: [
        {
          type: "text",
          text: `You rolled a ${result} on a ${sides}-sided dice!`,
        },
      ],
    };
  },
);

const transport = new StdioServerTransport();
await server.connect(transport);

logger.info("server connected, waiting for requests");
