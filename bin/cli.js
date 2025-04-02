#!/usr/bin/env node

const { program } = require('commander');
const package = require('../package.json');
const server = require('../src/index');
const net = require('net');
const { logger } = require('../src/utils/logger');
const readline = require('readline');

// Check if running in stdio mode (Cursor MCP)
function isStdioMode() {
  return process.argv.includes('--stdio');
}

// Handle stdin/stdout communication for Cursor MCP
function handleStdioMode() {
  logger.info('Running in stdio mode for Cursor MCP');
  
  // Disable console.log to prevent interfering with JSON communication
  const originalConsoleLog = console.log;
  console.log = function() {};
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  
  // Create an object with available blockchain tools
  const { getToolsList } = require('../src/services/blockchain.service');
  const tools = getToolsList();
  
  // Send initial response with tool list
  const initialResponse = {
    jsonrpc: "2.0",
    id: "1",
    result: { tools }
  };
  
  // Send the response as a single line
  process.stdout.write(JSON.stringify(initialResponse) + '\n');
  
  // Handle commands from stdin
  rl.on('line', async (line) => {
    try {
      if (!line || line.trim() === '') return;
      
      const request = JSON.parse(line);
      logger.debug(`Received request: ${JSON.stringify(request)}`);
      
      const { id, method, params } = request;
      
      if (method === 'execute') {
        const { tool, params: toolParams } = params;
        
        if (!tool) {
          const errorResponse = {
            jsonrpc: "2.0",
            id: id || "1",
            error: {
              code: -32602,
              message: 'Missing tool name'
            }
          };
          process.stdout.write(JSON.stringify(errorResponse) + '\n');
          return;
        }
        
        // Parse tool name to extract network
        const match = tool.match(/^(.+)_rpc$/);
        if (!match) {
          const errorResponse = {
            jsonrpc: "2.0", 
            id: id || "1",
            error: {
              code: -32602,
              message: `Invalid tool name: ${tool}`
            }
          };
          process.stdout.write(JSON.stringify(errorResponse) + '\n');
          return;
        }
        
        const networkId = match[1].replace(/_/g, '-');
        const { method: rpcMethod, params: rpcParams } = toolParams || {};
        
        if (!rpcMethod) {
          const errorResponse = {
            jsonrpc: "2.0",
            id: id || "1",
            error: {
              code: -32602,
              message: 'Missing method'
            }
          };
          process.stdout.write(JSON.stringify(errorResponse) + '\n');
          return;
        }
        
        try {
          const blockchainService = require('../src/services/blockchain.service');
          const result = await blockchainService.processRpcRequest(
            networkId,
            rpcMethod,
            rpcParams || [],
            id || 1
          );
          
          const response = {
            jsonrpc: "2.0",
            id: id || "1",
            result
          };
          
          process.stdout.write(JSON.stringify(response) + '\n');
        } catch (error) {
          const errorResponse = {
            jsonrpc: "2.0",
            id: id || "1",
            error: {
              code: -32603,
              message: error.message
            }
          };
          process.stdout.write(JSON.stringify(errorResponse) + '\n');
        }
      } else if (method === 'exit' || method === 'shutdown') {
        logger.info('Received exit command, shutting down');
        process.exit(0);
      } else {
        const errorResponse = {
          jsonrpc: "2.0",
          id: id || "1",
          error: {
            code: -32601,
            message: `Method not found: ${method}`
          }
        };
        process.stdout.write(JSON.stringify(errorResponse) + '\n');
      }
    } catch (error) {
      logger.error(`Error handling request: ${error.message}`);
      const errorResponse = {
        jsonrpc: "2.0",
        id: "1",
        error: {
          code: -32700,
          message: `Parse error: ${error.message}`
        }
      };
      process.stdout.write(JSON.stringify(errorResponse) + '\n');
    }
  });
}

// Check if a port is in use
function isPortInUse(port) {
  return new Promise((resolve) => {
    const server = net.createServer()
      .once('error', () => resolve(true))
      .once('listening', () => {
        server.close();
        resolve(false);
      })
      .listen(port);
  });
}

// Find available port
async function findAvailablePort(startPort) {
  let port = startPort;
  while (await isPortInUse(port)) {
    port++;
    if (port > startPort + 100) {
      throw new Error('Could not find an available port');
    }
  }
  return port;
}

program
  .name('allthatnode-mcp')
  .description('AllThatNode Model Context Protocol (MCP) Server')
  .version(package.version)
  .option('-p, --port <port>', 'Port to run the server on', '3333')
  .option('-n, --network <network>', 'Default blockchain network', 'ethereum-mainnet')
  .option('-v, --verbose', 'Enable verbose logging')
  .option('--stdio', 'Run in stdio mode for Cursor MCP')
  .parse(process.argv);

const options = program.opts();

// Check if running in stdio mode
if (isStdioMode() || options.stdio) {
  handleStdioMode();
} else {
  // Start the MCP server in HTTP mode
  (async () => {
    try {
      // Find available port if specified port is in use
      const requestedPort = parseInt(options.port);
      const port = await findAvailablePort(requestedPort);
      
      if (port !== requestedPort) {
        logger.info(`Port ${requestedPort} is in use, using port ${port} instead`);
      }
      
      // Start the server with the available port
      server.start({
        port,
        defaultNetwork: options.network,
        verbose: options.verbose
      });
    } catch (error) {
      logger.error(`Failed to start server: ${error.message}`);
      process.exit(1);
    }
  })();
} 