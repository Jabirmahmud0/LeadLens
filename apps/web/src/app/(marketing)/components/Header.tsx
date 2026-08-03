import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { MobileMenu } from './MobileMenu';
import { LeadLensLogo } from '@leadlens/ui';

export function Header() {
  return (
    <header className="absolute inset-x-0 top-0 z-50 px-5 py-5 sm:px-8 lg:px-10">
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between rounded-2xl border border-slate-200/90 bg-white/95 px-4 shadow-[0_10px_35px_-24px_rgba(15,23,42,0.45)] backdrop-blur-md sm:px-5">
        <Link href="/" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2" aria-label="LeadLens home">
          <LeadLensLogo variant="full" size={32} theme="light" />
        </Link>


        <nav className="hidden items-center gap-7 md:flex" aria-label="Primary navigation">
          <Link href="/product" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Product</Link>
          <Link href="/use-cases" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Use cases</Link>
          <Link href="/pricing" className="text-sm font-medium text-slate-600 transition-colors hover:text-slate-950">Pricing</Link>
        </nav>

        <div className="hidden items-center gap-2 sm:flex">
          <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 sm:inline-flex">Log in</Link>
          <Link href="/register" className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-[#16352a] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#166534] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
            Get started <ArrowRight className="size-3.5" aria-hidden="true" />
          </Link>
        </div>
        <MobileMenu />
      </div>
    </header>
  );
}
