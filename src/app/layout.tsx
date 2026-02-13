import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/app/header';
import { cn } from '@/lib/utils';
import FloatingLines from '@/components/app/floating-lines';

import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'INVISIFY',
  description: 'A Steganography Detection System',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn('h-full', inter.variable)}>
      <body
        className={cn(
          'font-body antialiased h-full flex flex-col bg-black overflow-x-hidden p-0 m-0',
          process.env.NODE_ENV === 'development' ? 'debug-screens' : ''
        )}
      >
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}