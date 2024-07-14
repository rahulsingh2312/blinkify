import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

// Function to send email using Nodemailer
const sendEmail = async (data) => {
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
    text: `Address: ${data.address}\nSize: ${data.size}\nContact: ${data.contact}`,
    html: `
      <p><strong>Address:</strong> ${data.address}</p>
      <p><strong>Size:</strong> ${data.size}</p>
      <p><strong>Contact:</strong> ${data.contact}</p>
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

// Define the GET request handler
export async function GET(req) {
  try {
    const { searchParams } = req.nextUrl;
    const address = searchParams.get('address');
    const size = searchParams.get('size');
    const contact = searchParams.get('contact');

    if (!address || !size || !contact) {
      return new NextResponse('Missing required query parameters', { status: 400 });
    }

    const emailData = {
      from_name: 'Blinkify Blink ShopBuilder',
      to_email: 'rahulsinghhh2312@gmail.com',
      to_name: 'gm dawg',
      address: address,
      size: size,
      contact: contact,
      message: `This is a mail from Blinkify:
      \nAddress: ${address}
      \nSize: ${size}
      \nContact: ${contact}`
    };

    console.log('Sending email with data:', emailData);

    const resultText = await sendEmail(emailData);
    console.log('Email sent successfully:', resultText);

    return NextResponse.json({ message: 'Email sent successfully', result: resultText });
  } catch (error) {
    console.error('Error sending email:', error);
    return new NextResponse('Error sending email', { status: 500 });
  }
}
