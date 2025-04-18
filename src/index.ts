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
  "getComponents",
  "Search for components and retrieve their source code.",
  { query: z.string().describe("component name") },
  async ({ query }) => {
    try {
      const componentFiles = await glob(`${componentsPath}/**/*.{tsx,jsx,js,ts}`);

      // ファイルの内容を読み込む
      const components = await Promise.all(
        componentFiles.map(async (filePath) => {
          try {
            const content = await fs.promises.readFile(filePath, "utf-8");
            const relativePath = path.relative(componentsPath, filePath);
            const fileName = path.basename(filePath, path.extname(filePath));

            return {
              path: relativePath,
              name: fileName,
              content
            };
          } catch (error: any) {
            console.error(`File reading error (${filePath}):`, error);
            return null;
          }
        })
      );

      // nullでないコンポーネントのみをフィルタリング
      const validComponents = components.filter((comp): comp is { path: string; name: string; content: string } => comp !== null);

      // queryパラメータに基づいてコンポーネントをフィルタリング
      // 大文字小文字を区別せず、部分一致で検索
      const filteredComponents = query
        ? validComponents.filter(comp =>
            comp.name.toLowerCase().includes(query.toLowerCase()) ||
            comp.path.toLowerCase().includes(query.toLowerCase())
          )
        : validComponents;

      // ソースコードのみの配列を返す
      const sourceCodeArray = filteredComponents.map(comp => comp.content);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(sourceCodeArray, null, 2)
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

const transport = new StdioServerTransport();

server.connect(transport).then(() => {
  console.error("MCP server started.");
}).catch((error) => {
  console.error("MCP server startup error:", error);
});
