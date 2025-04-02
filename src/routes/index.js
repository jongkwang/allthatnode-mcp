const express = require('express');
const mcpRoutes = require('./mcp.routes');
const { logger } = require('../utils/logger');
const blockchainService = require('../services/blockchain.service');

const router = express.Router();

// MCP routes
router.use('/mcp', mcpRoutes);
router.use('/v1', mcpRoutes); // Add v1 prefix support for MCP compatibility

// Root level /sse endpoint for Cursor compatibility
router.get('/sse', (req, res) => {
  logger.debug('Handling GET /sse request (root level SSE)');
  
  // Extract request ID from query parameters if available
  const reqId = req.query.id || "1";
  logger.debug(`Request ID from client: ${reqId}`);
  
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

// Root SSE endpoint for Cursor compatibility
router.get('/events', (req, res) => {
  logger.debug('Handling GET /events request (SSE at root level)');
  sendSSEResponse(req, res);
});

// Root level /tools endpoint for Cursor compatibility
router.get('/tools', (req, res) => {
  logger.debug('Handling GET /tools request (root level)');
  sendToolsResponse(res);
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
      events: '/events',
      mcp_events: '/mcp/events',
      sse: '/mcp/sse'
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

// Helper function to setup SSE response
function sendSSEResponse(req, res) {
  // Extract request ID from query parameters if available
  const reqId = req.query.id || "1";
  logger.debug(`Request ID from client: ${reqId}`);

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
}

module.exports = router; 