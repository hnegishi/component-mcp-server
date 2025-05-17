import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import * as fs from "fs";
import * as path from "path";
import { glob } from "glob";
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

server.tool(
  "searchComponents",
  "Search for components and retrieve their names and file paths.",
  { query: z.string().describe("component name") },
  async ({ query }) => {
    try {
      const ignoreFiles = [`${componentsPath}/**/*.test.*`, `${componentsPath}**/*.spec.*`];
      const componentFiles = await glob(`${componentsPath}/**/*.{tsx,jsx,js,ts}`, { ignore: ignoreFiles });
      const components = componentFiles.map((filePath) => {
        const relativePath = path.relative(componentsPath, filePath);
        const fileName = path.basename(filePath, path.extname(filePath));
        return {
          name: fileName,
          path: relativePath
        };
      });
      // queryで部分一致フィルタ（大文字小文字区別なし）
      const filtered = query
        ? components.filter(comp =>
            comp.name.toLowerCase().includes(query.toLowerCase())
          )
        : components;
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(filtered, null, 2)
          }
        ]
      };
    } catch (error: any) {
      console.error("Component search error:", error);
      return {
        content: [
          {
            type: "text",
            text: `An error occurred: ${error.message}`
          }
        ]
      };
    }
  }
);

server.tool(
  "getComponentInfo",
  "Get the component source code of the specified path.",
  { path: z.string().describe("component file path") },
  async ({ path: componentPath }) => {
    try {
      const absPath = path.resolve(componentsPath, componentPath);
      // ファイルが存在するかチェック
      await fs.promises.access(absPath, fs.constants.R_OK);
      const content = await fs.promises.readFile(absPath, "utf-8");
      const fileName = path.basename(absPath);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({
              name: fileName,
              sourceCode: content
            }, null, 2)
          }
        ]
      };
    } catch (error: any) {
      console.error(`Component info error (${componentPath}):`, error);
      return {
        content: [
          {
            type: "text",
            text: `An error occurred: ${error.message}`
          }
        ]
      };
    }
  }
);

const transport = new StdioServerTransport();

server.connect(transport).then(() => {
  console.error("MCP server started.");
}).catch((error) => {
  console.error("MCP server startup error:", error);
});
