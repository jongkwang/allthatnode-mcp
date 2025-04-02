const express = require('express');
const mcpRoutes = require('./mcp.routes');
const { logger } = require('../utils/logger');
const blockchainService = require('../services/blockchain.service');

const router = express.Router();

// MCP routes
router.use('/mcp', mcpRoutes);
router.use('/v1', mcpRoutes); // Add v1 prefix support for MCP compatibility

// MCP root level endpoints for Command-based MCP
router.get('/commands', (req, res) => {
  logger.debug('Handling GET /commands request (root level)');
  logger.debug(`Headers: ${JSON.stringify(req.headers)}`);
  
  const tools = [];
  const networks = blockchainService.getAvailableNetworks();
  
  // Create a tool for each network
  networks.forEach(networkId => {
    // Format networkId as a valid tool name (ethereum-mainnet -> ethereum_mainnet_rpc)
    const toolName = `${networkId.replace(/-/g, '_')}_rpc`;
    
    tools.push({
      name: toolName,
      description: `JSON-RPC API for ${networkId}`,
      parameters: {
        type: 'object',
        required: ['method'],
        properties: {
          method: {
            type: 'string',
            description: 'JSON-RPC method name'
          },
          params: {
            type: 'array',
            description: 'JSON-RPC method parameters',
            items: {
              type: 'object'
            }
          },
          id: {
            type: ['string', 'number'],
            description: 'Request ID',
            default: 1
          }
        }
      }
    });
  });
  
  // Respond with JSON-RPC 2.0 format
  const response = {
    jsonrpc: "2.0",
    id: req.query.id || req.headers['x-request-id'] || "1",
    result: {
      tools: tools
    }
  };
  
  logger.debug(`Responding with: ${JSON.stringify(response)}`);
  return res.json(response);
});

router.post('/commands', async (req, res) => {
  try {
    logger.debug('Handling POST /commands request (root level)');
    logger.debug(`Request body: ${JSON.stringify(req.body)}`);
    
    const { tool, params, id } = req.body;
    
    if (!tool) {
      logger.error('Missing tool name in request');
      return res.status(400).json({
        jsonrpc: "2.0",
        id: id || "1",
        error: {
          code: -32602,
          message: 'Invalid params: Missing tool name'
        }
      });
    }
    
    // Parse tool name to extract network (ethereum_mainnet_rpc -> ethereum-mainnet)
    const match = tool.match(/^(.+)_rpc$/);
    if (!match) {
      logger.error(`Invalid tool name format: ${tool}`);
      return res.status(400).json({
        jsonrpc: "2.0",
        id: id || "1",
        error: {
          code: -32602,
          message: `Invalid tool name format: ${tool}`
        }
      });
    }
    
    const networkId = match[1].replace(/_/g, '-');
    const { method, params: rpcParams } = params || {};
    
    logger.debug(`Processing RPC for ${networkId}: ${method}`);
    
    if (!method) {
      logger.error('Missing RPC method in request');
      return res.status(400).json({
        jsonrpc: "2.0",
        id: id || "1",
        error: {
          code: -32602,
          message: 'Invalid params: Missing method'
        }
      });
    }
    
    const rpcResponse = await blockchainService.processRpcRequest(
      networkId,
      method,
      rpcParams || [],
      id || 1
    );
    
    // Respond with JSON-RPC 2.0 format
    const response = {
      jsonrpc: "2.0",
      id: id || "1",
      result: rpcResponse
    };
    
    logger.debug(`Responding with: ${JSON.stringify(response)}`);
    return res.json(response);
  } catch (error) {
    logger.error(`Error processing command: ${error.message}`);
    return res.status(500).json({
      jsonrpc: "2.0",
      id: req.body.id || "1",
      error: {
        code: -32603,
        message: error.message
      }
    });
  }
});

// Root level /tools endpoint for compatibility
router.get('/tools', (req, res) => {
  logger.debug('Handling GET /tools request (root level)');
  sendToolsResponse(res);
});

// SSE endpoint for Cursor compatibility (restored)
router.get('/sse', (req, res) => {
  logger.debug('Handling GET /sse request (root level SSE)');
  logger.debug(`Headers: ${JSON.stringify(req.headers)}`);
  
  const tools = [];
  const networks = blockchainService.getAvailableNetworks();
  
  // Create a tool for each network
  networks.forEach(networkId => {
    // Format networkId as a valid tool name (ethereum-mainnet -> ethereum_mainnet_rpc)
    const toolName = `${networkId.replace(/-/g, '_')}_rpc`;
    
    tools.push({
      name: toolName,
      description: `JSON-RPC API for ${networkId}`,
      parameters: {
        type: 'object',
        required: ['method'],
        properties: {
          method: {
            type: 'string',
            description: 'JSON-RPC method name'
          },
          params: {
            type: 'array',
            description: 'JSON-RPC method parameters',
            items: {
              type: 'object'
            }
          },
          id: {
            type: ['string', 'number'],
            description: 'Request ID',
            default: 1
          }
        }
      }
    });
  });
  
  // Create JSON-RPC 2.0 compliant response with client's request ID
  const reqId = req.query.id || req.headers['x-request-id'] || "1";
  
  const jsonRpcResponse = {
    jsonrpc: "2.0",
    id: reqId,
    result: {
      tools: tools
    }
  };
  
  logger.debug(`Sending JSON-RPC response with ID ${reqId}: ${JSON.stringify(jsonRpcResponse)}`);
  
  // Setup SSE connection
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial data in JSON-RPC 2.0 format
  res.write(`data: ${JSON.stringify(jsonRpcResponse)}\n\n`);
  
  // Keep connection open with heartbeat
  const intervalId = setInterval(() => {
    const heartbeat = {
      jsonrpc: "2.0",
      method: "heartbeat",
      params: {
        timestamp: new Date().toISOString()
      }
    };
    res.write(`data: ${JSON.stringify(heartbeat)}\n\n`);
  }, 30000);
  
  // Handle client disconnect
  req.on('close', () => {
    clearInterval(intervalId);
    res.end();
    logger.debug('SSE connection closed');
  });
});

// Root route for API
router.get('/', (req, res) => {
  logger.debug('Handling GET / request');
  
  res.json({
    name: 'AllThatNode MCP',
    description: 'Model Context Protocol for AllThatNode blockchain RPC services',
    endpoints: {
      tools: '/mcp/tools',
      networks: '/mcp/networks',
      health: '/mcp/health',
      rpc: '/mcp/rpc/:network',
      commands: '/commands',
      mcp_commands: '/mcp/commands',
      sse: '/sse'
    },
    documentation: 'https://github.com/jongkwang/allthatnode-mcp'
  });
});

// Helper function to create tools response
function sendToolsResponse(res) {
  const tools = [];
  const networks = blockchainService.getAvailableNetworks();
  
  // Create a tool for each network
  networks.forEach(networkId => {
    // Format networkId as a valid tool name (ethereum-mainnet -> ethereum_mainnet_rpc)
    const toolName = `${networkId.replace(/-/g, '_')}_rpc`;
    
    tools.push({
      name: toolName,
      description: `JSON-RPC API for ${networkId}`,
      parameters: {
        type: 'object',
        required: ['method'],
        properties: {
          method: {
            type: 'string',
            description: 'JSON-RPC method name'
          },
          params: {
            type: 'array',
            description: 'JSON-RPC method parameters',
            items: {
              type: 'object'
            }
          },
          id: {
            type: ['string', 'number'],
            description: 'Request ID',
            default: 1
          }
        }
      }
    });
  });
  
  return res.json({ tools });
}

module.exports = router; 