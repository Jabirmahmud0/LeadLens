'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Menu, X } from 'lucide-react';

const items = [
  ['01', 'Product', '/product'],
  ['02', 'Use cases', '/use-cases'],
  ['03', 'Pricing', '/pricing'],
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, []);

  return (
    <div className="sm:hidden">
      <button
        type="button"
        aria-label={open ? 'Close navigation menu' : 'Open navigation menu'}
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((current) => !current)}
        className="grid size-10 place-items-center rounded-xl border border-[#d5e1d8] bg-[#f5f9f5] text-[#17382c] transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2"
      >
        {open ? <X className="size-5" aria-hidden="true" /> : <Menu className="size-5" aria-hidden="true" />}
      </button>

      <div
        id="mobile-navigation"
        aria-hidden={!open}
        className={`absolute left-0 right-0 top-[calc(100%+0.75rem)] origin-top overflow-hidden rounded-2xl border border-[#d5e1d8] bg-white p-3 shadow-[0_24px_60px_-28px_rgba(20,83,45,0.45)] transition-all duration-200 ${open ? 'visible translate-y-0 scale-100 opacity-100' : 'invisible -translate-y-2 scale-[0.98] opacity-0'}`}
      >
        <nav aria-label="Mobile navigation">
          {items.map(([number, label, href]) => (
            <Link
              key={href}
              href={href}
              tabIndex={open ? 0 : -1}
              onClick={() => setOpen(false)}
              className="group flex min-h-12 items-center justify-between rounded-xl px-3 transition-colors hover:bg-[#eff7f1]"
            >
              <span className="flex items-center gap-3"><span className="font-mono text-[10px] text-emerald-600">{number}</span><span className="text-sm font-semibold text-[#17382c]">{label}</span></span>
              <ArrowRight className="size-4 text-[#91a49a] transition-transform group-hover:translate-x-1 group-hover:text-emerald-700" aria-hidden="true" />
            </Link>
          ))}
        </nav>

        <div className="mt-2 grid grid-cols-2 gap-2 border-t border-[#e2ebe4] pt-3">
          <Link href="/login" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} className="inline-flex h-11 items-center justify-center rounded-xl border border-[#d5e1d8] text-sm font-semibold text-[#52675e]">Log in</Link>
          <Link href="/register" tabIndex={open ? 0 : -1} onClick={() => setOpen(false)} className="inline-flex h-11 items-center justify-center gap-1.5 rounded-xl bg-[#166534] text-sm font-semibold text-white">Get started <ArrowRight className="size-3.5" /></Link>
        </div>
      </div>
    </div>
  );
}
