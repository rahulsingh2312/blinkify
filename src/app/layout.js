import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Blinkify",
  description: "Create Solana Blink For Your Ecommerce Store!",
};

export default function RootLayout({ children }) {
  return (
    <html className="bg-black" lang="en">
      <body className={`bg-black`}>{children}</body>
    </html>
  );
}
