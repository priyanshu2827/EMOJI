import type { Metadata } from 'next';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import Header from '@/components/app/header';
import { cn } from '@/lib/utils';
import FloatingLines from '@/components/app/floating-lines';

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
    <html lang="en" className="h-full">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className={cn(
          'font-body antialiased h-full flex flex-col',
          process.env.NODE_ENV === 'development' ? 'debug-screens' : ''
        )}
      >
        <div className="fixed top-0 left-0 w-full h-full -z-10 bg-background">
          <FloatingLines 
            linesGradient={["#2C3E50", "#3498DB"]}
            lineCount={12}
            lineDistance={0.1}
            animationSpeed={0.3}
            bendStrength={-0.2}
            enabledWaves={['middle', 'bottom']}
          />
        </div>
        <Header />
        <main className="flex-1 flex flex-col">{children}</main>
        <Toaster />
      </body>
    </html>
  );
}
