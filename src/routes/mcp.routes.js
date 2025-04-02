const express = require('express');
const blockchainService = require('../services/blockchain.service');
const { logger } = require('../utils/logger');
const router = express.Router();

/**
 * GET /sse
 * SSE endpoint for events (MCP compatible)
 */
router.get('/sse', (req, res) => {
  logger.debug('Handling GET /mcp/sse request (SSE)');
  logger.debug(`Full URL: ${req.protocol}://${req.get('host')}${req.originalUrl}`);
  logger.debug(`Headers: ${JSON.stringify(req.headers)}`);
  logger.debug(`Query params: ${JSON.stringify(req.query)}`);
  
  // Extract request ID from query parameters if available
  const pathId = req.params.id;
  const queryId = req.query.id || req.query.messageId;
  const headerId = req.headers['x-request-id'] || req.headers['mcp-request-id'] || req.headers['accept'];
  
  // Use requestID from any available source
  const reqId = pathId || queryId || headerId || "1";
  logger.debug(`Request ID extracted: ${reqId}, source: ${pathId ? 'path' : (queryId ? 'query' : (headerId ? 'header' : 'default'))}`);
  
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

/**
 * GET /mcp/events
 * SSE endpoint for MCP events
 */
router.get('/events', (req, res) => {
  logger.debug('Handling GET /mcp/events request (SSE)');
  
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

/**
 * GET /mcp/tools
 * Returns the MCP tools definition
 */
router.get('/tools', (req, res) => {
  logger.debug('Handling GET /mcp/tools request');
  
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
  
  const response = { tools };
  logger.debug(`Responding with: ${JSON.stringify(response)}`);
  
  return res.json(response);
});

/**
 * POST /mcp/rpc/:network
 * Handles RPC requests for a specific network
 */
router.post('/rpc/:network', async (req, res) => {
  try {
    const networkId = req.params.network;
    const { method, params, id } = req.body;
    
    logger.debug(`Handling RPC request for ${networkId}: ${method}`);
    
    if (!method) {
      logger.error('Missing RPC method in request');
      return res.status(400).json({
        error: {
          message: 'Missing RPC method'
        }
      });
    }
    
    const response = await blockchainService.processRpcRequest(
      networkId,
      method,
      params || [],
      id || 1
    );
    
    return res.json(response);
  } catch (error) {
    logger.error(`Error processing RPC request: ${error.message}`);
    return res.status(500).json({
      error: {
        message: error.message
      }
    });
  }
});

/**
 * GET /mcp/networks
 * Returns available networks
 */
router.get('/networks', (req, res) => {
  logger.debug('Handling GET /mcp/networks request');
  
  const networks = blockchainService.getAvailableNetworks();
  return res.json({ networks });
});

/**
 * GET /mcp/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  logger.debug('Handling GET /mcp/health request');
  
  return res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 