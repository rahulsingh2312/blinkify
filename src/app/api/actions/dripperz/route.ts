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
import nodemailer from "nodemailer";

// Define a new type that extends ActionPostRequest with additional fields
interface ExtendedActionPostRequest extends ActionPostRequest {
  size?: string;
  address?: string;
  contact?: string;
}

const INR_TO_SOL = 0.001; // Example conversion rate, adjust as needed

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

// Set up nodemailer transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,  // Moved to environment variables
    pass: process.env.EMAIL_PASS,  // Moved to environment variables
  },
});

export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const baseHref = new URL(
      `/api/actions/transfer-sol`,
      requestUrl.origin,
    ).toString();

    const payload: ActionGetResponse = {
      title: "Buy the SuperteamDE merch 👕",
      icon: new URL("/degif.gif", requestUrl.origin).toString(),
      description: "Built with @BlinkifyShop",
      label: "Buy T-Shirt",
      links: {
        actions: [
          {
            label: "Buy with 0.083 SOL",
            href: `${baseHref}?to=4iG4s2F3eSByCkMvfsGhrvzXNoPrDFUJuA7Crtuf3Pvn&amount=0.1`,
            parameters: [
              { name: "Contact", label: "Enter Your Email Address or Contact Info", required: true },
              { name: "Address", label: "Enter Your Address With Pincode", required: true },
              { name: "Size", label: "Choose Between S,M,L,XL", required: true },
            ],
          },
        ],
      },
    };

    return new Response(JSON.stringify(payload), {
      headers: { ...ACTIONS_CORS_HEADERS, ...corsHeaders },
    });
  } catch (err) {
    console.error('An error occurred:', err);
    const message = typeof err === "string" ? err : "An unknown error occurred";
    return new Response(message, {
      status: 400,
      headers: { ...ACTIONS_CORS_HEADERS, ...corsHeaders },
    });
  }
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { to, amount } = validatedQueryParams(requestUrl);

    const body: ExtendedActionPostRequest = await req.json();
    const { size, address, contact, account } = body;

    if (!size || !address || !contact || !account) {
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

    const connection = new Connection(clusterApiUrl('mainnet-beta'), 'confirmed');

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

    // Send email with the user's data
    const mailOptions = {
      from: process.env.EMAIL_USER,  // Moved to environment variables
      to: 'rahulolblockchain@gmail.com',
      subject: 'New Purchase',
      text: `A new purchase has been made:\n\nContact: ${contact}\nAddress: ${address}\nSize: ${size}\nAmount: ${amount} SOL\nTo: ${to}\nAccount: ${account}`
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      console.error('Error sending email:', mailErr);
    }

    return new Response(JSON.stringify(payload), {
      headers: { ...ACTIONS_CORS_HEADERS, ...corsHeaders },
    });
  } catch (err) {
    console.error('An error occurred:', err);
    const message = typeof err === "string" ? err : "An unknown error occurred";
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
      throw new Error("Invalid input query parameters");
    }
  } catch (err) {
    throw new Error("Invalid input query parameters");
  }

  return {
    to,
    amount,
  };
}
