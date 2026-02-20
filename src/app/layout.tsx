import type { Metadata } from 'next';
import { Inter, Outfit } from 'next/font/google';

import '@/app/globals.css';
import { ReactNode } from "react";

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Role Report AI',
  description: 'AI-Powered Role Fit & Deep Research',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${outfit.variable} antialiased`}>{children}</body>
    </html>
  );
}
