// pages/pay.js
'use client'
// pages/pay.js
import { useState } from 'react';
import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
import { encodeURL, createQR, findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';

const Pay = () => {
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [token, setToken] = useState('SOL');
  const recipient = new PublicKey("93bk5ApDHZ1fedg7FKsqtHUaqd9NvyCoijEEawuu1Cjm");
  const usdcMintAddress = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC Mint Address

  const handlePayment = async () => {
    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');
    const reference = new Keypair().publicKey;
    
    let url;
    if (token === 'USDC') {
      url = encodeURL({
        recipient,
        amount: new BigNumber(amount),
        splToken: usdcMintAddress,
        reference,
        label: 'Your Store',
        message: 'Payment for order',
        memo: 'Order #123',
      });
    } else {
      url = encodeURL({
        recipient,
        amount: new BigNumber(amount),
        reference,
        label: 'Your Store',
        message: 'Payment for order',
        memo: 'Order #123',
      });
    }

    const qrCode = createQR(url);
    const element = document.getElementById('qr-code');
    element.innerHTML = '';
    qrCode.append(element);

    setPaymentStatus('pending');

    try {
      let signatureInfo;
      const maxRetries = 10;
      for (let i = 0; i < maxRetries; i++) {
        try {
          signatureInfo = await findReference(connection, reference, { finality: 'confirmed' });
          break; // Exit loop if transaction is found
        } catch (error) {
          if (i === maxRetries - 1) throw error; // Rethrow error if max retries reached
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before retrying
        }
      }

      await validateTransfer(connection, signatureInfo.signature, {
        recipient,
        amount: new BigNumber(amount),
        splToken: token === 'USDC' ? usdcMintAddress : undefined,
      });

      setPaymentStatus('completed');
    } catch (error) {
      setPaymentStatus('failed');
      console.error('Payment failed', error.message);
    }
  };

  return (
    <div className='text-black'>
      <h1 className='text-white'>Pay with Solana</h1>
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
      <button className='text-white' onClick={handlePayment}>Pay</button>
      <div className='' id="qr-code"></div>
      {paymentStatus && <p className='text-white'>Payment Status: {paymentStatus}</p>}
    </div>
  );
};

export default Pay;
