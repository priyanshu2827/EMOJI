import Link from 'next/link';
import { Button } from '@/components/ui/button';
import DecryptedText from '@/components/app/decrypted-text';
import { StegoShieldLogo } from '@/components/app/icons';
import { ArrowRight } from 'lucide-react';
import LetterGlitch from '@/components/app/letter-glitch';

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center text-center flex-1 relative bg-black">
      <div className="absolute inset-0 z-0">
          <LetterGlitch 
            glitchSpeed={50}
            centerVignette={true}
            outerVignette={true}
            smooth={true}
          />
      </div>
      <div className="relative z-10 flex flex-col items-center justify-center h-full">
        <div className="relative mb-6">
          <StegoShieldLogo className="h-24 w-24 text-primary" />
        </div>
        <h1 className="text-6xl md:text-8xl font-bold tracking-tighter mb-4 font-headline">
          <DecryptedText
            text="INVISIFY"
            speed={50}
            maxIterations={20}
            animateOn="view"
            sequential={true}
            revealDirection="center"
            className="text-primary"
            encryptedClassName="text-accent"
          />
        </h1>
        <p className="max-w-2xl mx-auto text-lg text-muted-foreground mb-8">
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
