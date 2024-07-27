"use client";

import React, { useState, useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const formSchema = z.object({
  toPubkey: z.string().min(1, { message: "Public Key is required." }),
  amount: z.string().min(1, { message: "Amount is required." }),
  title: z.string().min(1, { message: "Title is required." }),
  description: z.string().min(1, { message: "Description is required." }),
  imageUrl: z.string().url({ message: "Invalid URL." }),
  emailTo: z.string().email({ message: "Invalid email." }),
});

const App = () => {
  const [url, setUrl] = useState("");
  const [copyStatus, setCopyStatus] = useState("Copy");
  const [iframe, setIframe] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    control,
  } = useForm({
    resolver: zodResolver(formSchema),
  });

  const watchedValues = useWatch({ control });

  useEffect(() => {
    const { toPubkey, amount, title, description, imageUrl, emailTo } = watchedValues;
if(toPubkey, amount, title, description, imageUrl, emailTo){
  setIframe(true);
}
    if (true) {
      const encodedToPubkey = encodeURIComponent(toPubkey);
      const encodedAmount = encodeURIComponent(amount);
      const encodedTitle = encodeURIComponent(title);
      const encodedDescription = encodeURIComponent(description);
      const encodedImageUrl = encodeURIComponent(imageUrl);
      const encodedEmailTo = encodeURIComponent(emailTo);

      const baseUrl = "https://pay.rahulol.me/api/actions/blinkify";
      const queryString = `?to=${encodedToPubkey}&amount=${encodedAmount}&title=${encodedTitle}&description=${encodedDescription}&imageUrl=${encodedImageUrl}&emailTo=${encodedEmailTo}`;
      const fullUrl = `${baseUrl}${queryString}`;

      const encodedFullUrl = encodeURIComponent(fullUrl);
      const generatedUrl = `https://dial.to/?action=solana-action%3A${encodedFullUrl}`;

      setUrl(generatedUrl);
      setCopyStatus("Copy");

    }
  }, [watchedValues]);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(url);
    setCopyStatus("Copied");
    setTimeout(() => setCopyStatus("Copy"), 2000);
  };

  const shareOnTwitter = () => {
    const tweetUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=Check%20out%20this!`;
    window.open(tweetUrl, "_blank");
  };

  return (
    <div className="container mx-auto p-4 bg-black text-white">
      <h1 className="text-4xl mt-40 flex justify-center yellowtext text-center items-center mb-10">Create Solana Blink For Your Ecommerce Store!</h1>
      <div className="flex flex-col md:flex-row">
        <div className="md:w-1/3 border border-solid rounded-md border-white p-10">
          <form onSubmit={handleSubmit()} className="space-y-4">
            <div>
              <label htmlFor="toPubkey" className="block mb-1">Your Solana Wallet Addr. (where you want the payment):</label>
              <input
                type="text"
                id="toPubkey"
                placeholder="4iG4s2F3eSByCkMvfsGhrvzXNoPrDFUJuA7Crtuf3Pvn"
                {...register("toPubkey")}
                className="w-full p-2 border rounded"
              />
              {errors.toPubkey && <p className="text-red-500">{errors.toPubkey.message}</p>}
            </div>

            <div>
              <label htmlFor="amount" className="block mb-1">Amount (SOL):</label>
              <input
                type="number"
                id="amount"
                placeholder="1"
                {...register("amount")}
                className="w-full text-black p-2 border rounded"
                step="0.01"
              />
              {errors.amount && <p className="text-red-500">{errors.amount.message}</p>}
            </div>

            <div>
              <label htmlFor="title" className="block mb-1">Title:</label>
              <input
                type="text"
                placeholder="Superteam Germany Merch"
                id="title"
                {...register("title")}
                className="w-full p-2 border rounded text-black"
              />
              {errors.title && <p className="text-red-500">{errors.title.message}</p>}
            </div>

            <div>
              <label htmlFor="description" className="block mb-1">Description:</label>
              <input
                type="text"
                id="description"
                placeholder="Superteam Limited Edition Cap"
                {...register("description")}
                className="w-full p-2 border rounded text-black"
              />
              {errors.description && <p className="text-red-500">{errors.description.message}</p>}
            </div>

            <div>
              <label htmlFor="imageUrl" className="block mb-1">Image URL:</label>
              <input
                type="url"
                id="imageUrl"
                placeholder="https://rahulol.me/static/media/kcode2.ccfd3878b3f3278c4fa6.jpg"
                {...register("imageUrl")}
                className="w-full p-2 border rounded"
              />
              {errors.imageUrl && <p className="text-red-500">{errors.imageUrl.message}</p>}
            </div>

            <div>
              <label htmlFor="emailTo" className="block mb-1">Email To:</label>
              <input
                type="email"
                placeholder="rahulsinghhh2312@gmail.com"
                id="emailTo"
                {...register("emailTo")}
                className="w-full p-2 border rounded"
              />
              {errors.emailTo && <p className="text-red-500">{errors.emailTo.message}</p>}
            </div>

            <button type="submit"                   className=" px-4 py-2 rounded-md bg-black  border border-solid border-gray-200 text-white "
>Generate URL</button>
          </form>
        </div>

        {true && (
          <div className="md:w-1/2 ml-32 md:pl-4 mt-4 md:mt-0">
            <div className="mb-4">
              <p className="text-lg">Generated URL:</p>
              <div className="p-2 border rounded copybox text-white break-words">
                <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
                <br/>     
                <button
                  onClick={copyToClipboard}
                  className="m-2 px-4 py-2 rounded-md bg-black text-white"
                >
                  {copyStatus}
                </button>
                <button
                  onClick={shareOnTwitter}
                  className="m-2 px-4 py-2 rounded-md bg-black text-white"
                >
                  Share on X
                </button>
              </div>
            </div>
            {iframe && 
            <div className="mt-4">
              <iframe src={url} className="w-full h-[400px]" />
            </div>}
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
