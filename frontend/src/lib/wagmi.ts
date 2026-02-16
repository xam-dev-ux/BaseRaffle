import { http, createConfig } from 'wagmi';
import { base, baseSepolia } from 'wagmi/chains';
import { coinbaseWallet, injected, walletConnect } from 'wagmi/connectors';
import { Attribution } from 'ox/erc8021';

const projectId = import.meta.env.VITE_WALLETCONNECT_PROJECT_ID || '';

// Builder Code from base.dev for transaction attribution
const DATA_SUFFIX = Attribution.toDataSuffix({
  codes: ['bc_5kmzmvir'],
});

export const config = createConfig({
  chains: [base, baseSepolia],
  connectors: [
    injected(),
    coinbaseWallet({
      appName: 'BaseRaffle',
      appLogoUrl: 'https://baseraffle.app/images/icon.svg',
    }),
    walletConnect({ projectId }),
  ],
  transports: {
    [base.id]: http(import.meta.env.VITE_BASE_RPC_URL || 'https://mainnet.base.org'),
    [baseSepolia.id]: http(import.meta.env.VITE_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'),
  },
  dataSuffix: DATA_SUFFIX,
});

declare module 'wagmi' {
  interface Register {
    config: typeof config;
  }
}
