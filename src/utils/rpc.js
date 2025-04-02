const axios = require('axios');
const { logger } = require('./logger');

/**
 * Make a JSON-RPC request to the blockchain node
 * 
 * @param {string} url - The RPC endpoint URL
 * @param {string} method - The RPC method to call
 * @param {Array} params - The parameters for the RPC call
 * @param {number|string} id - The request ID
 * @returns {Promise<Object>} - The JSON-RPC response
 */
async function makeRpcRequest(url, method, params = [], id = 1) {
  try {
    logger.debug(`Making RPC request: ${method} to ${url}`);
    
    const response = await axios.post(url, {
      jsonrpc: '2.0',
      method,
      params,
      id
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    logger.debug(`RPC response received for ${method}`);
    return response.data;
  } catch (error) {
    logger.error(`RPC request failed: ${error.message}`);
    
    // If we have an API error response, return it
    if (error.response && error.response.data) {
      return error.response.data;
    }
    
    // Otherwise, format a JSON-RPC error
    return {
      jsonrpc: '2.0',
      id,
      error: {
        code: -32000,
        message: error.message || 'Unknown error'
      }
    };
  }
}

module.exports = {
  makeRpcRequest
}; 