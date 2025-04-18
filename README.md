# Component MCP Server

# Overview

ローカルにあるリポジトリのコンポーネントを探索し、文脈に適したコンポーネントのソースコードを取得するための MCP Server です。

※ npm にまだ公開していません。

## Installation

1. 依存関係をインストールします。

```bash
npm install
```

2. `.env`ファイルを作成し、リポジトリ内のコンポーネントのパスを指定します。

```
COMPONENTS_PATH=/path/to/your/front/repository/components
```

## Usage

1. サーバーをビルドします。

```bash
npm run build
```

### VSCode

```json
{
  "servers": {
    "component-mcp-server": {
      "command": "node",
      "args": ["./dist/index.js"],
      "env": {
        "COMPONENTS_PATH": "/path/to/your/front/repository/components"
      }
    }
  }
}
```

## Tools

- `getComponents` - ユーザーとの文脈内容から該当のリポジトリのコンポーネントライブラリを探索し、ソースコードを取得します。

## Debug

component-mcp-server をテストおよびデバッグするための開発者ツールが立ち上がります。

```bash
npx @modelcontextprotocol/inspector node ./dist/index.js
```

## 技術スタック

- TypeScript
- Node.js
- [@modelcontextprotocol/sdk](https://github.com/modelcontextprotocol/typescript-sdk) - MCP サーバー実装のための SDK
