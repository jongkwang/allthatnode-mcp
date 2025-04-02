const express = require('express');
const mcpRoutes = require('./mcp.routes');
const { logger } = require('../utils/logger');
const blockchainService = require('../services/blockchain.service');

const router = express.Router();

// MCP routes
router.use('/mcp', mcpRoutes);

// Root SSE endpoint for Cursor compatibility
router.get('/events', (req, res) => {
  logger.debug('Handling GET /events request (SSE at root level)');
  
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

module.exports = router; 