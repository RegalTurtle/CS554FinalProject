import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Link from 'next/link';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "The Web",
  description: "Social Media Platforms",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <header className="bg-gray-800 text-white p-4 shadow-md">
          <h1 className="text-2xl font-bold">The Web</h1>
          <nav className="mt-2">
            <ul className="flex gap-4">
              <li><Link href={'/'}>Home</Link></li>
              <li><Link href={'/user/login'}>Login</Link></li>
              <li><Link href={'/user/register'}>Sign Up</Link></li>
            </ul>
          </nav>
        </header>


        {children}
      </body>
    </html>
  );
}
