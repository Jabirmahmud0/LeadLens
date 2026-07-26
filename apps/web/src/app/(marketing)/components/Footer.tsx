import Link from 'next/link';
import { Aperture, ArrowUpRight } from 'lucide-react';

const links = [
  ['Product', '/product'],
  ['Use cases', '/use-cases'],
  ['Pricing', '/pricing'],
  ['Security', '/security'],
  ['Privacy', '/privacy'],
  ['Terms', '/terms'],
];

export function Footer() {
  return (
    <footer className="overflow-hidden bg-[#f3f6ef] text-[#17382c]">
      <div className="mx-auto max-w-7xl px-5 pb-8 pt-16 sm:px-8 sm:pt-20 lg:px-10">
        <div className="grid gap-14 border-b border-[#cfdcd2] pb-14 lg:grid-cols-[1.3fr_0.7fr] lg:items-end">
          <div>
            <Link href="/" className="inline-flex items-center gap-2.5" aria-label="LeadLens home">
              <span className="grid size-10 place-items-center rounded-xl bg-[#166534] text-white"><Aperture className="size-5" aria-hidden="true" /></span>
              <span className="text-base font-semibold tracking-[-0.03em]">LeadLens</span>
            </Link>
            <p className="mt-8 max-w-2xl text-[clamp(2.25rem,5vw,4.75rem)] font-semibold leading-[0.98] tracking-[-0.055em]">Make the first<br />conversation count.</p>
          </div>

          <div className="lg:justify-self-end">
            <p className="max-w-sm text-sm leading-6 text-[#597066]">Source-backed prospect intelligence for agencies that prefer a credible point of view over a generic pitch.</p>
            <Link href="/register" className="mt-6 inline-flex items-center gap-2 border-b border-emerald-700 pb-1 text-sm font-semibold text-emerald-800 transition-colors hover:text-emerald-600">Build your first brief <ArrowUpRight className="size-4" /></Link>
          </div>
        </div>

        <div className="grid gap-8 py-8 sm:grid-cols-[1fr_auto] sm:items-center">
          <nav className="flex flex-wrap gap-x-6 gap-y-3" aria-label="Footer navigation">
            {links.map(([label, href]) => <Link key={href} href={href} className="text-xs font-semibold text-[#52675e] transition-colors hover:text-emerald-800">{label}</Link>)}
          </nav>
          <div className="flex gap-5 text-[10px] uppercase tracking-[0.12em] text-[#789084]"><span>Public data only</span><span>Evidence labeled</span></div>
        </div>
      </div>

      <div className="select-none border-t border-[#d8e3da] px-3 text-center" aria-hidden="true">
        <p className="translate-y-[0.08em] whitespace-nowrap text-[clamp(5rem,15.8vw,15rem)] font-semibold leading-[0.78] tracking-[-0.085em] text-[#c8ddce]">LeadLens</p>
      </div>
      <div className="bg-[#16352a] px-5 py-3 text-[#b9d3c3] sm:px-8 lg:px-10">
        <div className="mx-auto flex max-w-7xl flex-col gap-1 text-[10px] sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LeadLens</p>
          <p>Built for evidence-led agency growth.</p>
        </div>
      </div>
    </footer>
  );
}
