import {
    ActionPostResponse,
    ACTIONS_CORS_HEADERS,
    createPostResponse,
    ActionGetResponse,
    ActionPostRequest,
  } from "@solana/actions";
  import {
    clusterApiUrl,
    Connection,
    LAMPORTS_PER_SOL,
    PublicKey,
    SystemProgram,
    Transaction,
  } from "@solana/web3.js";
  import { DEFAULT_SOL_ADDRESS } from "./const";
  
  const INR_TO_SOL = 0.001; // Example conversion rate, adjust as needed
  
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

    
  
  export const GET = async (req: Request) => {
    try {
      const requestUrl = new URL(req.url);
  
      const baseHref = new URL(
        `/api/actions/transfer-sol`,
        requestUrl.origin,
      ).toString();
  
      const payload: ActionGetResponse = {
        title: "Buy the Greatest Streetwear of all time 👕",
        icon: new URL("/final.png", requestUrl.origin).toString(),
        description: "Buy the DOPEST wears from the dopest blink  ✨ DM at @rrahulol after completing the purchase",
        label: "Buy T-Shirt",
        links: {
          actions: [
            {
              label: "Buy with 0.4 SOL",
              href: `${baseHref}?to=4iG4s2F3eSByCkMvfsGhrvzXNoPrDFUJuA7Crtuf3Pvn&amount=0.4`,
            },
          ],
        },
      };
  
      return new Response(JSON.stringify(payload), {
        headers: { ...ACTIONS_CORS_HEADERS, ...corsHeaders },
      });
    } catch (err) {
      console.error('An error occurred:', err);
      let message = "An unknown error occurred";
      if (typeof err == "string") message = err;
      return new Response(message, {
        status: 400,
        headers: { ...ACTIONS_CORS_HEADERS, ...corsHeaders },
      });
    }
  };
  
  // DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
  // THIS WILL ENSURE CORS WORKS FOR BLINKS
  export const OPTIONS = async () => {
    return new Response(null, {
      status: 204,
      headers: { ...ACTIONS_CORS_HEADERS, ...corsHeaders },
    });
  };
  
  export const POST = async (req: Request) => {
    try {
      const requestUrl = new URL(req.url);
      const { to, amount } = validatedQueryParams(requestUrl);
  
      const body: ActionPostRequest & { size?: string; address?: string } = await req.json();
      const { size, address, account } = body;
  
      if (!size || !address || !account) {
        return new Response('Missing required fields', {
          status: 400,
          headers: { ...ACTIONS_CORS_HEADERS, ...corsHeaders },
        });
      }
  
      let accountPublicKey: PublicKey;
      try {
        accountPublicKey = new PublicKey(account);
      } catch (err) {
        console.error('Invalid "account" provided:', err);
        return new Response('Invalid "account" provided', {
          status: 400,
          headers: { ...ACTIONS_CORS_HEADERS, ...corsHeaders },
        });
      }
  
      const connection = new Connection(
        process.env.SOLANA_RPC! || clusterApiUrl("mainnet-beta"),
      );
  
      const transaction = new Transaction();
      transaction.feePayer = accountPublicKey;
  
      const lamports = amount * LAMPORTS_PER_SOL;
  
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: accountPublicKey,
          toPubkey: new PublicKey(to),
          lamports,
        }),
      );
  
      transaction.recentBlockhash = (
        await connection.getLatestBlockhash()
      ).blockhash;
  
      const payload: ActionPostResponse = await createPostResponse({
        fields: {
          transaction,
          message: `Transfer ${amount} SOL to ${to}`,
        },
      });
  
      return new Response(JSON.stringify(payload), {
        headers: { ...ACTIONS_CORS_HEADERS, ...corsHeaders },
      });
    } catch (err) {
      console.error('An error occurred:', err);
      let message = "An unknown error occurred";
      if (typeof err == "string") message = err;
      return new Response(message, {
        status: 400,
        headers: { ...ACTIONS_CORS_HEADERS, ...corsHeaders },
      });
    }
  };
  
  function validatedQueryParams(requestUrl: URL) {
    let to = "";
    let amount = 0;
  
    try {
      const urlParams = new URLSearchParams(requestUrl.search);
      to = urlParams.get("to") || "";
      amount = parseFloat(urlParams.get("amount") || "0");
      if (!to || amount <= 0) {
        throw "Invalid input query parameters";
      }
    } catch (err) {
      throw "Invalid input query parameters";
    }
  
    return {
      to,
      amount,
    };
  }
  