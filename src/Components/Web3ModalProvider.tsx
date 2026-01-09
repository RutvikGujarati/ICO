import { createWeb3Modal, defaultConfig } from '@web3modal/ethers/react'

const projectId = 'c0fd1378367c559475f44bce63d47a8a'

const bsc = {
  chainId: 56,
  name: 'BNB Smart Chain',
  currency: 'BNB',
  explorerUrl: 'https://bscscan.com',
  rpcUrl: 'https://binance.llamarpc.com'
}

const metadata = {
  name: 'Dominix Presale',
  description: 'Dominix Presale Protocol',
  url: 'https://dominix.cloud',
  icons: ['https://avatars.dominix.com/'],
  redirect: {
    native: 'dominix://', 
    universal: 'https://dominix.cloud'
  }
}

const ethersConfig = defaultConfig({
  metadata,
  enableEIP6963: true,
  enableInjected: true,
  enableCoinbase: false,
  defaultChainId: 56
})

createWeb3Modal({
  ethersConfig,
  chains: [bsc],
  projectId,
  enableAnalytics: true,
  enableOnramp: false,
  enableSwaps: false,
  allWallets: 'HIDE',
  featuredWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  ],
  includeWalletIds: [
    'c57ca95b47569778a828d19178114f4db188b89b763c899ba0be274e97267d96', // MetaMask
    '4622a2b2d6af1c9844944291e5e7351a6aa24cd7b23099efac1b2fd875da31a0', // Trust Wallet
  ],
  themeMode: 'dark',
  themeVariables: {
    '--w3m-font-family': 'Inter, system-ui, sans-serif',
    '--w3m-accent': '#0dcaf0',
    '--w3m-color-mix': '#000000',
    '--w3m-color-mix-strength': 40,
    '--w3m-border-radius-master': '2px',
    '--w3m-z-index': 9999
  }
})

export function Web3ModalProvider({ children }: { children: React.ReactNode }) {
  return children
}