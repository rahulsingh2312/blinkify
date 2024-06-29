// pages/pay.js
'use client'
// pages/pay.js
import { useState } from 'react';
import { Connection, PublicKey, clusterApiUrl, Keypair } from '@solana/web3.js';
import { encodeURL, createQR, findReference, validateTransfer } from '@solana/pay';
import BigNumber from 'bignumber.js';
import { HiOutlineChevronDown } from 'react-icons/hi'; // Importing ChevronDown icon

const Pay = () => {
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('');
  const [qrcode, setQrcode] = useState('');
  
  const [showDropdown, setShowDropdown] = useState(false); // Dropdown visibility state

  const [token, setToken] = useState('SOL');
  const recipient = new PublicKey("4iG4s2F3eSByCkMvfsGhrvzXNoPrDFUJuA7Crtuf3Pvn");
  const usdcMintAddress = new PublicKey('EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'); // USDC Mint Address
  const handleTokenChange = (selectedToken) => {
    setToken(selectedToken);
    setShowDropdown(false); // Close dropdown after selecting a token
  };

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown); // Toggle dropdown visibility
  };
  const handlePayment = async () => {
    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');
    const reference = new Keypair().publicKey;
    
    let url;
    if (token === 'USDC') {
      url = encodeURL({
        recipient,
        amount: new BigNumber(amount),
        splToken: usdcMintAddress,
        reference,
        label: 'Pay Rahul Greatest Dev of All time 🚀',
        message: '✨rahul loves usdc pls keep sending usdc✨',
        memo: '#69420',
      });
    } else {
      url = encodeURL({
        recipient,
        amount: new BigNumber(amount),
        reference,
        label: 'Pay Rahul Greatest Dev of All time 🚀',
        message: '✨rahul loves sol pls keep sending sol✨',
        memo: '#69420',
      });
    }

    const qrCode = createQR(url, 256  ); 
    setQrcode(qrCode);
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
    <div className='text-black  bg-black'>
       <div className="bg-black mx-auto text-white text-center text-7xl max-sm:text-5xl max-md:text-6xl font-bold mt-32 leading-relaxed">
         Pay Rahul with <span className="yellowtext">"Solana"</span> 
        </div>
        <p className="text-sm max-sm:text-xs text-gray-400 mt-4 mx-auto text-center">
      Choose Your Preferred Token!!
        </p>
        <div className='w-full flex items-center justify-center mt-10'>
        <div className="relative">
          <div
            className="w-40 text-white bgc py-3 mx-5 px-5 rounded-md leading-relaxed text-xl text-center cursor-pointer"
            onClick={toggleDropdown}
          >
            {token === 'SOL' ? 'SOL' : 'USDC'}
            <HiOutlineChevronDown className="absolute right-10 top-1/2 transform -translate-y-1/2 text-xl text-white" />
          </div>
          {showDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-black border border-gray-700 rounded-md shadow-lg z-10">
              <div
                className="py-1 px-3 cursor-pointer text-white hover:bg-gray-800"
                onClick={() => handleTokenChange('SOL')}
              >
                SOL
              </div>
              <div
                className="py-1 px-3 cursor-pointer text-white hover:bg-gray-800"
                onClick={() => handleTokenChange('USDC')}
              >
                USDC
              </div>
            </div>
          )}
        </div>
      </div>
<p className="text-sm flex items-center justify-center max-sm:text-xs text-gray-400 mt-4 md:mt-10 mx-auto text-center">
<input
className='text-white  bgb py-3 mx-5 px-5 rounded-md'
        type="text"
        placeholder="Enter amount"
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
      />
       
 <button className='text-white   bgb py-3  mx-5 px-5 rounded-md' onClick={handlePayment}>Pay Now</button>
        </p> 
     
     
        <div className="flex flex-col items-center mt-10">
        <div className="" id="qr-code">
          {/* Your QR code component or image */}
          
        </div>
        {paymentStatus && (
          <p className="mt-4 text-white">Payment Status: {paymentStatus}</p>
        )}
      </div>
      

    </div>
  );
};

export default Pay;
