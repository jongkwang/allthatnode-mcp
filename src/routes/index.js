const express = require('express');
const mcpRoutes = require('./mcp.routes');
const { logger } = require('../utils/logger');

const router = express.Router();

// MCP routes
router.use('/mcp', mcpRoutes);

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
      rpc: '/mcp/rpc/:network'
    },
    documentation: 'https://github.com/jongkwang/allthatnode-mcp'
  });
});

module.exports = router; 