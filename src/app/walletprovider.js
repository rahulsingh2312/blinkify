// components/WalletProvider.js
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
    ConnectionProvider,
    WalletProvider as AdapterWalletProvider,
} from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-phantom';
import { SolletExtensionWalletAdapter } from '@solana/wallet-adapter-sollet';
import { useMemo } from 'react';
import { clusterApiUrl } from '@solana/web3.js';
import '@solana/wallet-adapter-react-ui/styles.css';

const WalletProvider = ({ children }) => {
    const network = WalletAdapterNetwork.Mainnet;
    const endpoint = useMemo(() => clusterApiUrl(network), [network]);

    const wallets = useMemo(() => [
        new PhantomWalletAdapter(),
        new SolletExtensionWalletAdapter(),
    ], [network]);

    return (
        <ConnectionProvider endpoint={endpoint}>
            <AdapterWalletProvider wallets={wallets} autoConnect>
                <WalletModalProvider>
                    {children}
                </WalletModalProvider>
            </AdapterWalletProvider>
        </ConnectionProvider>
    );
};

export default WalletProvider;
