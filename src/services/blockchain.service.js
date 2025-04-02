const networks = require('../config/networks');
const EvmService = require('./evm.service');
const SuiService = require('./sui.service');
const { logger } = require('../utils/logger');

/**
 * BlockchainService factory to create appropriate service instances
 * for different blockchain networks
 */
class BlockchainService {
  constructor() {
    this.services = {};
    this.initializeServices();
    logger.debug('BlockchainService initialized');
  }

  /**
   * Initialize service instances for all supported networks
   */
  initializeServices() {
    Object.keys(networks).forEach(networkId => {
      const network = networks[networkId];
      this.services[networkId] = this.createServiceForNetwork(network);
    });
  }

  /**
   * Create a service instance for a specific network
   * 
   * @param {Object} network - The network configuration
   * @returns {Object} - The appropriate service instance
   */
  createServiceForNetwork(network) {
    switch (network.type) {
      case 'evm':
        return new EvmService(network);
      case 'sui':
        return new SuiService(network);
      default:
        logger.error(`Unsupported network type: ${network.type}`);
        throw new Error(`Unsupported network type: ${network.type}`);
    }
  }

  /**
   * Get a service instance for a specific network
   * 
   * @param {string} networkId - The network identifier
   * @returns {Object} - The service instance
   */
  getService(networkId) {
    if (!this.services[networkId]) {
      logger.error(`Unknown network: ${networkId}`);
      throw new Error(`Unknown network: ${networkId}`);
    }
    
    return this.services[networkId];
  }

  /**
   * Get all available network IDs
   * 
   * @returns {Array<string>} - Array of network IDs
   */
  getAvailableNetworks() {
    return Object.keys(this.services);
  }

  /**
   * Process a generic RPC request for a specific network
   * 
   * @param {string} networkId - The network identifier
   * @param {string} method - The RPC method to call
   * @param {Array} params - The parameters for the RPC call
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response
   */
  async processRpcRequest(networkId, method, params, id) {
    const service = this.getService(networkId);
    return service.processRpcRequest(method, params, id);
  }

  /**
   * Get all available networks as a list of tools
   * 
   * @returns {Array<Object>} - Array of tool objects
   */
  getToolsList() {
    const tools = [];
    const networks = this.getAvailableNetworks();
    
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
    
    return tools;
  }
}

// Export a singleton instance
module.exports = new BlockchainService(); 