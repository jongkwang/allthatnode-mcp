const express = require('express');
const blockchainService = require('../services/blockchain.service');
const { logger } = require('../utils/logger');
const router = express.Router();

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
  
  res.json({ tools });
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
    
    res.json(response);
  } catch (error) {
    logger.error(`Error processing RPC request: ${error.message}`);
    res.status(500).json({
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
  res.json({ networks });
});

/**
 * GET /mcp/health
 * Health check endpoint
 */
router.get('/health', (req, res) => {
  logger.debug('Handling GET /mcp/health request');
  
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString()
  });
});

module.exports = router; 