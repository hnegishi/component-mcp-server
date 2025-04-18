import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import * as dotenv from "dotenv";

dotenv.config();

const componentsPath = process.env.COMPONENTS_PATH;

if (!componentsPath) {
  console.error("ERROR: COMPONENTS_PATH environment variable is not set.");
  process.exit(1);
}

const server = new McpServer({
  name: "component-mcp-server",
  version: "1.0.0"
});

const transport = new StdioServerTransport();

server.connect(transport).then(() => {
  console.error("MCP server started.");
}).catch((error) => {
  console.error("MCP server startup error:", error);
});
