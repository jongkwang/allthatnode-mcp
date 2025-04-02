const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const routes = require('./routes');
const { logger, setVerbose } = require('./utils/logger');

// Create Express app
const app = express();

// Apply middleware
app.use(cors());
app.use(bodyParser.json());

// Use routes
app.use('/', routes);

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(`Unhandled error: ${err.stack}`);
  res.status(500).json({
    error: {
      message: 'Internal server error'
    }
  });
});

/**
 * Start the MCP server
 * 
 * @param {Object} options - Server options
 * @param {number} options.port - Port to run on (default: 3333)
 * @param {boolean} options.verbose - Enable verbose logging (default: false)
 * @returns {Object} - The Express app and server instances
 */
function start(options = {}) {
  const { 
    port = process.env.PORT || 3333,
    verbose = false
  } = options;

  // Configure logger verbosity
  setVerbose(verbose);
  
  // Start the server
  const server = app.listen(port, () => {
    logger.info(`AllThatNode MCP server running on port ${port}`);
    
    // Log available endpoints
    logger.info('Available endpoints:');
    logger.info(`- GET  http://localhost:${port}/mcp/tools`);
    logger.info(`- GET  http://localhost:${port}/mcp/networks`);
    logger.info(`- GET  http://localhost:${port}/mcp/health`);
    logger.info(`- POST http://localhost:${port}/mcp/rpc/:network`);
  });
  
  return { app, server };
}

// If this module is run directly
if (require.main === module) {
  start();
}

module.exports = { app, start }; 