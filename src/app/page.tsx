import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DecryptedText from '@/components/app/decrypted-text';
import { StegoShieldLogo } from '@/components/app/icons';
import { ArrowRight } from 'lucide-react';
import LetterGlitch from '@/components/app/letter-glitch';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center min-h-screen flex-1 relative bg-black overflow-hidden">
      <div className="absolute inset-0 z-0 opacity-80">
        <LetterGlitch
          glitchSpeed={50}
          centerVignette={true}
          outerVignette={true}
          smooth={true}
        />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full max-w-4xl mx-auto px-6 py-12 transition-all duration-1000">
        <div className="relative mb-6 drop-shadow-[0_0_15px_rgba(255,255,255,0.3)]">
          <StegoShieldLogo className="h-24 w-24 text-white" />
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 font-headline drop-shadow-[0_4px_12px_rgba(0,0,0,0.9)]">
          <DecryptedText
            text="INVISIFY"
            speed={50}
            maxIterations={20}
            animateOn="view"
            sequential={true}
            revealDirection="center"
            className="text-white"
            encryptedClassName="text-accent"
          />
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-neutral-200 mb-8 drop-shadow-[0_2px_8px_rgba(0,0,0,1)] font-medium">
          An advanced steganography detection system designed to uncover hidden data in text, images, and more.
        </p>
        <Button asChild size="lg">
          <Link href="/scan">
            Start Scanning <ArrowRight className="ml-2" />
          </Link>
        </Button>
      </div>
    </div>
  );
}
