#!/usr/bin/env node

const { program } = require('commander');
const package = require('../package.json');
const server = require('../src/index');
const net = require('net');
const { logger } = require('../src/utils/logger');

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
  .parse(process.argv);

const options = program.opts();

// Start the MCP server
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