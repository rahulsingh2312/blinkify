// pages/pay.js
'use client'
import { useState } from 'react';
import { Connection, PublicKey, Keypair, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import BigNumber from 'bignumber.js';
import WalletProvider from '../walletprovider';
const Pay = () => {
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [token, setToken] = useState('SOL');
  const { connection } = useConnection();
  const { publicKey, sendTransaction } = useWallet();
  const recipient = new PublicKey("93bk5ApDHZ1fedg7FKsqtHUaqd9NvyCoijEEawuu1Cjm")
  const usdcMintAddress = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC Mint Address

  const handlePayment = async () => {
    if (!publicKey) {
      alert('Please connect your wallet first.');
      return;
    }

    const reference = new Keypair().publicKey;
    const amountBN = new BigNumber(amount);

    const transaction = new Transaction();

    if (token === 'USDC') {
      const splTokenTransferIx = {
        keys: [
          { pubkey: publicKey, isSigner: true, isWritable: true },
          { pubkey: recipient, isSigner: false, isWritable: true },
          { pubkey: publicKey, isSigner: false, isWritable: false },
        ],
        programId: new PublicKey('TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA'),
        data: Buffer.from(Uint8Array.of(3, ...amountBN.multipliedBy(1e6).toArray("le", 8))),
      };
      transaction.add(splTokenTransferIx);
    } else {
      const solTransferIx = SystemProgram.transfer({
        fromPubkey: publicKey,
        toPubkey: recipient,
        lamports: amountBN.multipliedBy(LAMPORTS_PER_SOL).toNumber(),
      });
      transaction.add(solTransferIx);
    }

    try {
      const signature = await sendTransaction(transaction, connection);
      setPaymentStatus('pending');

      const confirmed = await connection.confirmTransaction(signature, 'confirmed');
      if (confirmed.value.err) {
        throw new Error('Transaction failed');
      }

      setPaymentStatus('completed');
    } catch (error) {
      setPaymentStatus('failed');
      console.error('Payment failed', error.message);
    }
  };

  return (
    <WalletProvider>
    <div>
      <h1>Pay with Solana</h1>
      <WalletMultiButton />
      <select value={token} onChange={(e) => setToken(e.target.value)}>
        <option value="SOL">SOL</option>
        <option value="USDC">USDC</option>
      </select>
      <input
        type="text"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
      <button onClick={handlePayment}>Pay</button>
      {paymentStatus && <p>Payment Status: {paymentStatus}</p>}
    </div>
    </WalletProvider>
  );
};

export default Pay;
