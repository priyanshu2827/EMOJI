'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { StegoShieldLogo } from '@/components/app/icons';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

export default function Header() {
  const pathname = usePathname();

  const navItems = [
    { href: '/scan', label: 'Scan' },
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/tools', label: 'Tools' },
    { href: '/detection-methods', label: 'Detection Methods' },
  ];

  return (
    <header className="bg-card border-b sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 group">
          <StegoShieldLogo className="h-7 w-7 text-primary group-hover:text-accent transition-colors" />
          <h1 className="text-xl font-bold text-primary group-hover:text-accent transition-colors font-headline">
            INVISIFY
          </h1>
        </Link>
        <nav className="flex items-center gap-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              asChild
            >
              <Link href={item.href}>{item.label}</Link>
            </Button>
          ))}
        </nav>
      </div>
    </header>
  );
}
