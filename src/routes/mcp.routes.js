const express = require('express');
const blockchainService = require('../services/blockchain.service');
const { logger } = require('../utils/logger');
const router = express.Router();

/**
 * GET /sse
 * SSE endpoint for MCP (modified to Command-based API for Cursor)
 */
router.get('/sse', (req, res) => {
  logger.debug('Handling GET /mcp/sse request (Command-based API for Cursor)');
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
  
  logger.debug(`Responding with Command-based data: ${JSON.stringify(jsonRpcResponse)}`);
  
  res.setHeader('Content-Type', 'application/json');
  return res.json(jsonRpcResponse);
});

/**
 * GET /commands
 * Returns the MCP commands definition (Command-based MCP)
 */
router.get('/commands', (req, res) => {
  logger.debug('Handling GET /mcp/commands request');
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

/**
 * POST /commands
 * Execute a MCP command (Command-based MCP)
 */
router.post('/commands', async (req, res) => {
  try {
    logger.debug('Handling POST /mcp/commands request');
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