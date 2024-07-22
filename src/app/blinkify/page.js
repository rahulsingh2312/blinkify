'use client'
import React, { useState } from 'react';

const App = () => {
  const [toPubkey, setToPubkey] = useState('');
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [emailTo, setEmailTo] = useState('');
  const [url, setUrl] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();

    const encodedToPubkey = encodeURIComponent(toPubkey);
    const encodedAmount = encodeURIComponent(amount);
    const encodedTitle = encodeURIComponent(title);
    const encodedDescription = encodeURIComponent(description);
    const encodedImageUrl = encodeURIComponent(imageUrl);
    const encodedEmailTo = encodeURIComponent(emailTo);

    const baseUrl = "http://localhost:3000/api/actions/blinkify";
    const queryString = `?to=${encodedToPubkey}&amount=${encodedAmount}&title=${encodedTitle}&description=${encodedDescription}&imageUrl=${encodedImageUrl}&emailTo=${encodedEmailTo}`;
    const fullUrl = `${baseUrl}${queryString}`;
    
    const encodedFullUrl = encodeURIComponent(fullUrl);
    const generatedUrl = `https://dial.to/?action=solana-action%3A${encodedFullUrl}`;
    
    setUrl(generatedUrl);
  };

  return (
    <div className="container text-black">
      <h1>Create Solana Action URL</h1>
      <form onSubmit={handleSubmit} className="form">
        <label htmlFor="toPubkey">To PublicKey:</label>
        <input
          type="text"
          id="toPubkey"
          value={toPubkey}
          onChange={(e) => setToPubkey(e.target.value)}
          required
        />
        
        <label htmlFor="amount">Amount (SOL):</label>
        <input
          type="number"
          id="amount"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          step="0.01"
          required
        />
        
        <label htmlFor="title">Title:</label>
        <input
          type="text"
          id="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />
        
        <label htmlFor="description">Description:</label>
        <input
          type="text"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
        />
        
        <label htmlFor="imageUrl">Image URL:</label>
        <input
          type="url"
          id="imageUrl"
          value={imageUrl}
          onChange={(e) => setImageUrl(e.target.value)}
          required
        />
        
        <label htmlFor="emailTo">Email To:</label>
        <input
          type="email"
          id="emailTo"
          value={emailTo}
          onChange={(e) => setEmailTo(e.target.value)}
          required
        />
        
        <button type="submit">Generate URL</button>
      </form>
      {url && (
        <div className="result">
          <p>Generated URL:</p>
          <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
        </div>
      )}
    </div>
  );
};

export default App;
