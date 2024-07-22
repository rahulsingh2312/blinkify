// @ts-nocheck
import { NextRequest, NextResponse } from 'next/server';
import {
  ActionPostResponse,
  ACTIONS_CORS_HEADERS,
  createPostResponse,
  ActionGetResponse,
  ActionPostRequest,
} from "@solana/actions";
import {
  Authorized,
  clusterApiUrl,
  Connection,
  Keypair,
  LAMPORTS_PER_SOL,
  PublicKey,
  StakeProgram,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { DEFAULT_SOL_ADDRESS, DEFAULT_SOL_AMOUNT } from "./const";

import nodemailer from 'nodemailer';

// Function to send email using Nodemailer
const sendEmail = async (data: any) => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.NEXT_PUBLIC_USER,
      pass: process.env.NEXT_PUBLIC_PASS,
    },
  });

  const mailOptions = {
    from: 'Blinkify <your-email@gmail.com>',
    to: data.to_email,
    subject: 'Blink Superteam Merch !!',
    text: `Address: ${data.address}\nSize: ${data.size}\nContact: ${data.contact}\nStatus: ${data.status}`,
    html: `
      <p><strong>Address:</strong> ${data.address}</p>
      <p><strong>Size:</strong> ${data.size}</p>
      <p><strong>Contact:</strong> ${data.contact}</p>
      <p><strong>Wallet:</strong> ${data.wallet}</p>
      <p><strong>Status:</strong> ${data.status}</p>
      <p><strong>Image:</strong> ${data.imageUrl}</p>
      <img src="${data.imageUrl}" alt="Merch Image" />
    `,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    return info.response;
  } catch (error) {
    console.error('Nodemailer Error:', error);
    throw new Error(error.message || 'Nodemailer error occurred');
  }
};

export const GET = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { toPubkey, amount, title, description, imageUrl, emailTo } = validatedQueryParams(requestUrl);

    const baseHref = new URL(
      `/api/actions/blinkify?to=${toPubkey.toBase58()}&amount=${amount}&emailTo=${emailTo}`,
      requestUrl.origin,
    ).toString();

    const payload: ActionGetResponse = {
      title: title || "Buy the SuperteamDE merch 👕",
      icon: imageUrl || new URL("/degif.gif", requestUrl.origin).toString(),
      description: description || "Built with @BlinkifyShop",
      label: "Buy T-Shirt",
      links: {
        actions: [
          {
            label: `Buy with ${amount} SOL`,
            href: `${baseHref}&Contact={Contact}&Address={Address}&Size={Size}`, // this href will have a text input
            parameters: [
              { name: "Contact", label: "Enter Your Email Address or Contact Info", required: true },
              { name: "Address", label: "Enter Your Address With Pincode", required: true },
              { name: "Size", label: "Choose Between S,M,L,XL", required: true },
            ],
          },
        ],
      },
    };

    return new NextResponse(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};

// DO NOT FORGET TO INCLUDE THE `OPTIONS` HTTP METHOD
// THIS WILL ENSURE CORS WORKS FOR BLINKS
export const OPTIONS = GET;

export const POST = async (req: Request) => {
  try {
    const requestUrl = new URL(req.url);
    const { toPubkey, amount, Address, Contact, Size, emailTo, imageUrl } = validatedQueryParams(requestUrl);

    console.log(Address, Size, Contact);
    const body: ActionPostRequest = await req.json();

    // validate the client provided input
    let account: PublicKey;
    try {
      account = new PublicKey(body.account);
    } catch (err) {
      return new Response('Invalid "account" provided', {
        status: 400,
        headers: ACTIONS_CORS_HEADERS,
      });
    }

    const connection = new Connection(
      clusterApiUrl("devnet"),
    );

    // ensure the receiving account will be rent exempt
    const minimumBalance = await connection.getMinimumBalanceForRentExemption(
      0, // note: simple accounts that just store native SOL have `0` bytes of data
    );
    if (amount * LAMPORTS_PER_SOL < minimumBalance) {
      throw `account may not be rent exempt: ${toPubkey.toBase58()}`;
    }

    const transaction = new Transaction();
    transaction.feePayer = account;

    transaction.add(
      SystemProgram.transfer({
        fromPubkey: account,
        toPubkey: toPubkey,
        lamports: amount * LAMPORTS_PER_SOL,
      }),
    );

    // set the end user as the fee payer
    transaction.feePayer = account;

    transaction.recentBlockhash = (
      await connection.getLatestBlockhash()
    ).blockhash;
    console.log('Transaction Parameters:', body);


    // Attempt to send the transaction
    let status = 'failed';
    try {
      const signature = await connection.sendTransaction(transaction, [account]);
      await connection.TransactionConfirmationStrategy(signature, 'processed');
      console.log("hiksjl")
      status = 'completed';
      // Sending email with the received data and transaction status
      const emailData = {
        from_name: 'Blinkify Blink ShopBuilder',
        to_email: emailTo,
        to_name: 'gm dawg',
        address: Address,
        size: Size,
        contact: Contact,
        wallet: body.account,
        status: status,
        imageUrl: imageUrl,
        message: `This is a mail from Blinkify:
        \nAddress: ${Address}
        \nSize: ${Size}
        \nContact: ${Contact}
        \nWallet: ${body.account}
        \nStatus: ${status}
        \nImageUrl: ${imageUrl}`,
      };
      
      await sendEmail(emailData);
    } catch (err) {
      console.error('Transaction Error hi:' , err);
      const emailData = {
        from_name: 'Blinkify Blink ShopBuilder',
        to_email: emailTo,
        to_name: 'gm dawg',
        address: Address,
        size: Size,
        contact: Contact,
        wallet: body.account,
        status: status,
        imageUrl: imageUrl,
        message: `This is a mail from Blinkify:
        \nAddress: ${Address}
        \nSize: ${Size}
        \nContact: ${Contact}
        \nWallet: ${body.account}
        \nStatus: ${status}
        \nImageUrl: ${imageUrl}`,
      };
       await sendEmail(emailData);
    }



   

    const payload: ActionPostResponse = await createPostResponse({
      fields: {
        transaction,
        message: `Send ${amount} SOL to ${toPubkey.toBase58()}`,
      },
      // note: no additional signers are needed
      // signers: [],
    });

    return new NextResponse(JSON.stringify(payload), {
      headers: ACTIONS_CORS_HEADERS,
    });
  } catch (err) {
    console.log(err);
    let message = "An unknown error occurred";
    if (typeof err == "string") message = err;
    return new Response(message, {
      status: 400,
      headers: ACTIONS_CORS_HEADERS,
    });
  }
};

function validatedQueryParams(requestUrl: URL) {
  let toPubkey: PublicKey = DEFAULT_SOL_ADDRESS;
  let amount: number = DEFAULT_SOL_AMOUNT;
  let title: string = "Buy the SuperteamDE merch 👕";
  let description: string = "Built with @BlinkifyShop";
  let imageUrl: string = new URL("/degif.gif", requestUrl.origin).toString();
  let emailTo: string;
  let Address: string;
  let Size: string;
  let Contact: string;

  try {
    if (requestUrl.searchParams.get("to")) {
      toPubkey = new PublicKey(requestUrl.searchParams.get("to")!);
    }
    if (requestUrl.searchParams.get("amount")) {
      amount = parseFloat(requestUrl.searchParams.get("amount")!);
      if (isNaN(amount) || amount <= 0) throw "Invalid amount";
    }
    if (requestUrl.searchParams.get("title")) {
      title = requestUrl.searchParams.get("title")!;
    }
    if (requestUrl.searchParams.get("description")) {
      description = requestUrl.searchParams.get("description")!;
    }
    if (requestUrl.searchParams.get("imageUrl")) {
      imageUrl = requestUrl.searchParams.get("imageUrl")!;
    }
    if (requestUrl.searchParams.get("emailTo")) {
      emailTo = requestUrl.searchParams.get("emailTo")!;
    }
    if (requestUrl.searchParams.get("Address")) {
      Address = requestUrl.searchParams.get("Address")!;
    }
    if (requestUrl.searchParams.get("Size")) {
      Size = requestUrl.searchParams.get("Size")!;
    }
    if (requestUrl.searchParams.get("Contact")) {
      Contact = requestUrl.searchParams.get("Contact")!;
    }
  } catch (err) {
    throw `Invalid input query parameter: ${err}`;
  }

  return {
    amount,
    toPubkey,
    title,
    description,
    imageUrl,
    emailTo,
    Address,
    Size,
    Contact
  };
}
