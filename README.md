# AllThatNode MCP (Model Context Protocol)

A Model Context Protocol (MCP) implementation for AllThatNode blockchain RPC services. This MCP allows AI assistants like Claude and Cursor AI to interact with various blockchain networks through AllThatNode's reliable RPC endpoints.

## Features

- Seamless access to multiple blockchain networks:
  - Ethereum (Mainnet, Holesky, Sepolia)
  - Arbitrum (One, Sepolia)
  - Optimism (Mainnet, Sepolia)
  - Sui (Mainnet)
- Simple integration with AI assistants that support MCP
- Ready-to-use with pre-configured API keys
- Pre-built JSON-RPC method templates for common blockchain operations

## Installation

### Prerequisites

- Node.js 14 or higher
- npm or npx

### Option 1: Using Cursor AI's mcp.json

The easiest way to use AllThatNode MCP with Cursor AI is to add it directly to your mcp.json file:

1. Open or create the mcp.json file at `~/.cursor/mcp.json` (macOS/Linux) or `%USERPROFILE%\.cursor\mcp.json` (Windows)

2. Add the AllThatNode MCP server to the `mcpServers` section:

```json
{
  "mcpServers": {
    "allthatnode": {
      "command": "npx",
      "args": [
        "-y",
        "@jongkwang/allthatnode-mcp@latest"
      ]
    }
  }
}
```

3. Restart Cursor AI, and the AllThatNode blockchain tools will be automatically available.

### Option 2: Quick Start with npx

If you prefer to run the MCP server manually:

```bash
npx @jongkwang/allthatnode-mcp
```

This will start the MCP server on port 3333 by default.

### Option 3: Installing globally

To install AllThatNode MCP globally:

```bash
npm install -g @jongkwang/allthatnode-mcp
```

Then you can run it from anywhere:

```bash
allthatnode-mcp
```

### Command Line Options

```bash
npx @jongkwang/allthatnode-mcp [options]

Options:
  --port, -p       Specify the port (default: 3333)
  --network, -n    Specify the default network (default: ethereum-mainnet)
  --help, -h       Show help information
```

## Using with Cursor AI

### Method 1: Automatic via mcp.json (recommended)

1. Add the configuration to `~/.cursor/mcp.json` as described above
2. Restart Cursor AI
3. The blockchain RPC tools will be automatically available

### Method 2: Manual Registration

1. Start the MCP server:
   ```bash
   npx @jongkwang/allthatnode-mcp
   ```

2. In Cursor AI, register the MCP tool:
   ```
   /mcp add http://localhost:3333/mcp/tools
   ```

3. Now you can use AllThatNode's blockchain RPC endpoints directly in Cursor AI by referring to the available tools:
   ```
   ethereum_mainnet_rpc
   ethereum_holesky_rpc
   ethereum_sepolia_rpc
   arbitrum_one_rpc
   arbitrum_sepolia_rpc
   optimism_mainnet_rpc
   optimism_sepolia_rpc
   sui_mainnet_rpc
   ```

## Example Usage in Cursor AI

```
Can you get the latest block number on Ethereum Mainnet using the ethereum_mainnet_rpc tool?
```

## Using with Claude for Desktop

1. Edit Claude's configuration file:
   - macOS: `~/Library/Application Support/Claude/claude_desktop_config.json`
   - Windows: `%APPDATA%\Claude\claude_desktop_config.json`

2. Add the following to the configuration file:
   ```json
   {
     "mcpServers": {
       "allthatnode": {
         "command": "npx",
         "args": ["-y", "@jongkwang/allthatnode-mcp@latest"]
       }
     }
   }
   ```

3. Restart Claude Desktop and the MCP tools will be available.

## Available RPC Endpoints

| Network | Endpoint |
|---------|----------|
| Ethereum Mainnet | https://ethereum-mainnet.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6 |
| Ethereum Holesky | https://ethereum-holesky.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6 |
| Ethereum Sepolia | https://ethereum-sepolia.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6 |
| Arbitrum One | https://arbitrum-one.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6 |
| Arbitrum Sepolia | https://arbitrum-sepolia.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6 |
| Optimism Mainnet | https://optimism-mainnet.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6 |
| Optimism Sepolia | https://optimism-mainnet.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6 |
| Sui Mainnet | https://sui-mainnet.g.allthatnode.com/full/json_rpc/3dac05cb886641ba9edbd29e88a1f0d6 |

## Common JSON-RPC Methods

### Ethereum, Arbitrum, Optimism

- `eth_blockNumber`: Returns the latest block number
- `eth_getBalance`: Returns the balance of a given address
- `eth_getTransactionCount`: Returns the number of transactions sent from an address
- `eth_getBlockByNumber`: Returns information about a block by number
- `eth_getTransactionByHash`: Returns information about a transaction by hash
- `eth_call`: Executes a new message call without creating a transaction

### Sui

- `sui_getLatestCheckpointSequenceNumber`: Returns the latest checkpoint sequence number
- `sui_getBalance`: Returns the balance of a given address
- `sui_getTransaction`: Returns information about a transaction
- `sui_getObject`: Returns information about an object

## Development

### Setup local development environment

```bash
git clone https://github.com/jongkwang/allthatnode-mcp.git
cd allthatnode-mcp
npm install
npm run dev
```

### Project Structure

```
allthatnode-mcp/
├── bin/                # Command line interface
├── src/
│   ├── config/         # Configuration files
│   ├── services/       # Blockchain service implementations
│   ├── routes/         # MCP routes
│   ├── utils/          # Utility functions
│   └── index.js        # Main entry point
├── package.json
└── README.md
```

## Publishing

To publish this package to npm:

```bash
npm login
npm publish --access public
```

## License

MIT

## Links

- [AllThatNode Website](https://allthatnode.com)
- [Model Context Protocol Documentation](https://modelcontextprotocol.io)
- [Cursor AI](https://cursor.sh)
