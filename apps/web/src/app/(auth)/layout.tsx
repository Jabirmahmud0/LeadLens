import type { ReactNode } from 'react';
import Link from 'next/link';
import { Aperture } from 'lucide-react';
import styles from './auth.module.css';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.shell} min-h-screen bg-[#f8fbf7] text-[#10251d]`}>
      <div className={styles.grid} />
      <header className="absolute inset-x-0 top-0 z-20 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="inline-flex items-center gap-2.5 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
            <span className="grid size-9 place-items-center rounded-xl bg-[#166534] text-white"><Aperture className="size-5" /></span><span className="text-base font-semibold tracking-[-0.03em]">LeadLens</span>
          </Link>
          <Link href="/" className="text-xs font-semibold text-[#60766b] transition-colors hover:text-emerald-800">Back to website</Link>
        </div>
      </header>
      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32">{children}</main>
    </div>
  );
}
