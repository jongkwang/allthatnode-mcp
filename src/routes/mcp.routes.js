const express = require('express');
const blockchainService = require('../services/blockchain.service');
const { logger } = require('../utils/logger');
const router = express.Router();

/**
 * GET /events
 * SSE endpoint for events (root level)
 */
router.get('/sse', (req, res) => {
  logger.debug('Handling GET /sse request (SSE)');
  
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
  
  // Setup SSE connection
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial data
  res.write(`data: ${JSON.stringify(response)}\n\n`);
  
  // Keep connection open
  const intervalId = setInterval(() => {
    res.write(': ping\n\n');
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
  
  // Setup SSE connection
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  
  // Send initial data
  res.write(`data: ${JSON.stringify(response)}\n\n`);
  
  // Keep connection open
  const intervalId = setInterval(() => {
    res.write(': ping\n\n');
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