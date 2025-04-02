const { makeRpcRequest } = require('../utils/rpc');
const { logger } = require('../utils/logger');

/**
 * Service for EVM-compatible blockchain networks (Ethereum, Arbitrum, Optimism)
 */
class EvmService {
  /**
   * Create an EVM service for the specified network
   * 
   * @param {Object} network - The network configuration object
   */
  constructor(network) {
    this.network = network;
    this.url = network.url;
    logger.debug(`EvmService created for ${network.name}`);
  }

  /**
   * Process a generic RPC request
   * 
   * @param {string} method - The RPC method to call
   * @param {Array} params - The parameters for the RPC call
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response
   */
  async processRpcRequest(method, params, id) {
    return makeRpcRequest(this.url, method, params, id);
  }

  /**
   * Get the latest block number
   * 
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with the block number
   */
  async getBlockNumber(id = 1) {
    return this.processRpcRequest('eth_blockNumber', [], id);
  }

  /**
   * Get the balance of an address
   * 
   * @param {string} address - The address to check
   * @param {string} blockTag - The block tag (latest, pending, etc.)
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with the balance
   */
  async getBalance(address, blockTag = 'latest', id = 1) {
    return this.processRpcRequest('eth_getBalance', [address, blockTag], id);
  }

  /**
   * Get chain ID
   * 
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with the chain ID
   */
  async getChainId(id = 1) {
    return this.processRpcRequest('eth_chainId', [], id);
  }

  /**
   * Get transaction by hash
   * 
   * @param {string} txHash - The transaction hash
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with the transaction
   */
  async getTransaction(txHash, id = 1) {
    return this.processRpcRequest('eth_getTransactionByHash', [txHash], id);
  }

  /**
   * Get block by number
   * 
   * @param {string|number} blockNumber - The block number (hex or decimal)
   * @param {boolean} includeTransactions - Whether to include transaction details
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with the block
   */
  async getBlockByNumber(blockNumber, includeTransactions = false, id = 1) {
    // Convert decimal block number to hex if needed
    if (typeof blockNumber === 'number') {
      blockNumber = '0x' + blockNumber.toString(16);
    }
    
    return this.processRpcRequest('eth_getBlockByNumber', [blockNumber, includeTransactions], id);
  }

  /**
   * Get the transaction count for an address
   * 
   * @param {string} address - The address to check
   * @param {string} blockTag - The block tag (latest, pending, etc.)
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with the nonce
   */
  async getTransactionCount(address, blockTag = 'latest', id = 1) {
    return this.processRpcRequest('eth_getTransactionCount', [address, blockTag], id);
  }

  /**
   * Execute a call without creating a transaction
   * 
   * @param {Object} callObject - The call object with to, data, etc.
   * @param {string} blockTag - The block tag (latest, pending, etc.)
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with the result
   */
  async call(callObject, blockTag = 'latest', id = 1) {
    return this.processRpcRequest('eth_call', [callObject, blockTag], id);
  }
}

module.exports = EvmService; 