import { http, createConfig } from 'wagmi';
import { bsc } from 'wagmi/chains';
import { walletConnect } from 'wagmi/connectors';

export const config = createConfig({
  chains: [bsc],
  autoConnect: true,
  // Sirf ek connector rakho, baki sab hata do
  connectors: [
    walletConnect({
      projectId: '3a8170812b534d0ff9d794f19a901d64', // Free ID
      metadata: {
        name: 'Trust Wallet',
        description: 'Connect with Trust Wallet',
        url: 'https://trustwallet.com',
        icons: ['https://trustwallet.com/assets/images/media/assets/TWT.png'],
      },
      showQrModal: true,
    }),
  ],
  transports: {
    [bsc.id]: http(),
  },
});
