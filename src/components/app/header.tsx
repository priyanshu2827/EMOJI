'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StegoShieldLogo } from '@/components/app/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/scan', label: 'Scan' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tools', label: 'Tools' },
    { href: '/detection-methods', label: 'Detection Methods' },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-[100] px-6 py-4">
      <div className="max-w-7xl mx-auto">
        <div className="glass-dark rounded-full px-6 py-2 flex items-center justify-between border border-white/10 shadow-2xl shadow-emerald-500/5">
          <Link href="/" className="flex items-center gap-2 group shrink-0">
            <StegoShieldLogo className="h-6 w-6 text-white group-hover:text-emerald-400 transition-colors" />
            <h1 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors tracking-tight">
              INVISIFY
            </h1>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                className={cn(
                  "rounded-full px-4 text-sm font-medium transition-all",
                  pathname === item.href
                    ? "bg-white/10 text-white"
                    : "text-neutral-400 hover:text-white hover:bg-white/5"
                )}
                asChild
              >
                <Link href={item.href}>{item.label}</Link>
              </Button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <Button asChild size="sm" className="hidden md:flex bg-white text-black hover:bg-neutral-200 rounded-full h-8 px-4 text-xs font-bold transition-all">
              <Link href="/scan">Launch Scan</Link>
            </Button>

            {/* Mobile Navigation */}
            <div className="md:hidden flex items-center">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-8 w-8 text-white" aria-label="Open menu">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="bg-neutral-950 border-white/10 text-white w-[300px]">
                  <SheetHeader>
                    <SheetTitle className="text-left text-white font-bold flex items-center gap-2">
                      <StegoShieldLogo className="w-5 h-5" />
                      INVISIFY
                    </SheetTitle>
                  </SheetHeader>
                  <nav className="flex flex-col gap-2 mt-8">
                    {navItems.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={cn(
                          "px-4 py-3 rounded-xl transition-all h-12 flex items-center text-sm font-medium",
                          pathname === item.href
                            ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                            : "text-neutral-400 hover:text-white hover:bg-white/5"
                        )}
                      >
                        {item.label}
                      </Link>
                    ))}
                    <Button asChild className="mt-4 bg-emerald-500 hover:bg-emerald-600 text-black font-bold h-12 rounded-xl">
                      <Link href="/scan">Start Forensic Scan</Link>
                    </Button>
                  </nav>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
