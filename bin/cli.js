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
  // Log to stderr instead of stdout to avoid interfering with JSON communication
  console.error('Running in stdio mode for Cursor MCP');
  
  // Redirect all logger output to stderr
  logger.transports.forEach(transport => {
    transport.stderrLevels = Object.keys(logger.levels);
    transport.consoleWarnLevels = [];
  });
  
  // Disable console.log to prevent interfering with JSON communication
  console.log = function() {};
  
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
  
  // Create an object with available blockchain tools
  const blockchainService = require('../src/services/blockchain.service');
  const tools = blockchainService.getToolsList();
  
  // Helper function for safe logging to stderr
  function stdErrLog(message) {
    process.stderr.write(`${message}\n`);
  }
  
  // Helper function to safely send JSON responses
  function sendJSONResponse(data) {
    try {
      const jsonStr = JSON.stringify(data);
      stdErrLog(`Sending response: ${jsonStr}`);
      process.stdout.write(jsonStr + '\n');
    } catch (err) {
      stdErrLog(`Error serializing response: ${err.message}`);
    }
  }
  
  // No longer send initial response - wait for initialize request from Cursor
  
  // Handle commands from stdin
  rl.on('line', async (line) => {
    try {
      if (!line || line.trim() === '') return;
      
      stdErrLog(`Received line: ${line}`);
      
      let request;
      try {
        request = JSON.parse(line);
      } catch (parseError) {
        stdErrLog(`JSON parse error: ${parseError.message}`);
        sendJSONResponse({
          jsonrpc: "2.0",
          id: null,
          error: {
            code: -32700,
            message: `Parse error: ${parseError.message}`
          }
        });
        return;
      }
      
      stdErrLog(`Parsed request: ${JSON.stringify(request)}`);
      
      const { id, method, params } = request;
      
      // Handle initialize method for Cursor MCP
      if (method === 'initialize') {
        sendJSONResponse({
          jsonrpc: "2.0",
          id: id,
          result: {
            capabilities: {}
          }
        });
        return;
      } else if (method === 'tools') {
        // Return available tools
        sendJSONResponse({
          jsonrpc: "2.0",
          id: id,
          result: {
            tools: tools
          }
        });
        return;
      } else if (method === 'execute') {
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
          sendJSONResponse(errorResponse);
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
          sendJSONResponse(errorResponse);
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
          sendJSONResponse(errorResponse);
          return;
        }
        
        try {
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
          
          sendJSONResponse(response);
        } catch (error) {
          const errorResponse = {
            jsonrpc: "2.0",
            id: id || "1",
            error: {
              code: -32603,
              message: error.message
            }
          };
          sendJSONResponse(errorResponse);
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
        sendJSONResponse(errorResponse);
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
      sendJSONResponse(errorResponse);
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