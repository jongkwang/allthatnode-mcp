/**
 * Blockchain network configurations
 */
const networks = {
  'ethereum-mainnet': {
    name: 'Ethereum Mainnet',
    url: 'https://ethereum-mainnet.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6',
    type: 'evm',
    chainId: 1,
    symbol: 'ETH',
    explorer: 'https://etherscan.io'
  },
  'ethereum-holesky': {
    name: 'Ethereum Holesky',
    url: 'https://ethereum-holesky.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6',
    type: 'evm',
    chainId: 17000,
    symbol: 'ETH',
    explorer: 'https://holesky.etherscan.io'
  },
  'ethereum-sepolia': {
    name: 'Ethereum Sepolia',
    url: 'https://ethereum-sepolia.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6',
    type: 'evm',
    chainId: 11155111,
    symbol: 'ETH',
    explorer: 'https://sepolia.etherscan.io'
  },
  'arbitrum-one': {
    name: 'Arbitrum One',
    url: 'https://arbitrum-one.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6',
    type: 'evm',
    chainId: 42161,
    symbol: 'ETH',
    explorer: 'https://arbiscan.io'
  },
  'arbitrum-sepolia': {
    name: 'Arbitrum Sepolia',
    url: 'https://arbitrum-sepolia.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6',
    type: 'evm',
    chainId: 421614,
    symbol: 'ETH',
    explorer: 'https://sepolia.arbiscan.io'
  },
  'optimism-mainnet': {
    name: 'Optimism Mainnet',
    url: 'https://optimism-mainnet.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6',
    type: 'evm',
    chainId: 10,
    symbol: 'ETH',
    explorer: 'https://optimistic.etherscan.io'
  },
  'optimism-sepolia': {
    name: 'Optimism Sepolia',
    url: 'https://optimism-mainnet.g.allthatnode.com/full/evm/3dac05cb886641ba9edbd29e88a1f0d6',
    type: 'evm',
    chainId: 11155420,
    symbol: 'ETH',
    explorer: 'https://sepolia-optimism.etherscan.io'
  },
  'sui-mainnet': {
    name: 'Sui Mainnet',
    url: 'https://sui-mainnet.g.allthatnode.com/full/json_rpc/3dac05cb886641ba9edbd29e88a1f0d6',
    type: 'sui',
    symbol: 'SUI',
    explorer: 'https://explorer.sui.io'
  }
};

module.exports = networks; 