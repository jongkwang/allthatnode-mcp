const { makeRpcRequest } = require('../utils/rpc');
const { logger } = require('../utils/logger');

/**
 * Service for Sui blockchain network
 */
class SuiService {
  /**
   * Create a Sui service for the network
   * 
   * @param {Object} network - The network configuration object
   */
  constructor(network) {
    this.network = network;
    this.url = network.url;
    logger.debug(`SuiService created for ${network.name}`);
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
   * Get the latest checkpoint sequence number
   * 
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response
   */
  async getLatestCheckpointSequenceNumber(id = 1) {
    return this.processRpcRequest('sui_getLatestCheckpointSequenceNumber', [], id);
  }

  /**
   * Get the balance of an address
   * 
   * @param {string} owner - The owner address
   * @param {string} coinType - The coin type (optional)
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with the balance
   */
  async getBalance(owner, coinType = null, id = 1) {
    const params = coinType ? [owner, coinType] : [owner];
    return this.processRpcRequest('sui_getBalance', params, id);
  }

  /**
   * Get all coins owned by an address
   * 
   * @param {string} owner - The owner address
   * @param {string} coinType - The coin type (optional)
   * @param {string} cursor - Pagination cursor (optional)
   * @param {number} limit - Result limit (optional)
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with coins
   */
  async getAllCoins(owner, coinType = null, cursor = null, limit = null, id = 1) {
    const params = [owner];
    if (coinType) params.push(coinType);
    if (cursor) params.push(cursor);
    if (limit !== null) params.push(limit);
    
    return this.processRpcRequest('sui_getAllCoins', params, id);
  }

  /**
   * Get transaction by digest
   * 
   * @param {string} digest - The transaction digest
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with transaction data
   */
  async getTransaction(digest, id = 1) {
    return this.processRpcRequest('sui_getTransaction', [digest], id);
  }

  /**
   * Get object by ID
   * 
   * @param {string} objectId - The object ID
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with object data
   */
  async getObject(objectId, id = 1) {
    return this.processRpcRequest('sui_getObject', [objectId], id);
  }

  /**
   * Get multiple objects by ID
   * 
   * @param {Array<string>} objectIds - The object IDs
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with object data
   */
  async getObjects(objectIds, id = 1) {
    return this.processRpcRequest('sui_multiGetObjects', [objectIds], id);
  }

  /**
   * Get total transaction number
   * 
   * @param {number|string} id - The request ID
   * @returns {Promise<Object>} - The JSON-RPC response with the total number
   */
  async getTotalTransactionNumber(id = 1) {
    return this.processRpcRequest('sui_getTotalTransactionNumber', [], id);
  }
}

module.exports = SuiService; 