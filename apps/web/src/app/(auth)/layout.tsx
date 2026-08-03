import type { ReactNode } from 'react';
import Link from 'next/link';
import styles from './auth.module.css';
import { LeadLensLogo } from '@leadlens/ui';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className={`${styles.shell} min-h-screen bg-[#f8fbf7] text-[#10251d]`}>
      <div className={styles.grid} />
      <header className="absolute inset-x-0 top-0 z-20 px-5 py-5 sm:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <Link href="/" className="rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 focus-visible:ring-offset-2">
            <LeadLensLogo variant="full" size={32} theme="light" />
          </Link>

          <Link href="/" className="text-xs font-semibold text-[#60766b] transition-colors hover:text-emerald-800">Back to website</Link>
        </div>
      </header>
      <main className="relative z-10 flex min-h-screen items-center justify-center px-5 pb-10 pt-28 sm:px-8 sm:pb-14 sm:pt-32">{children}</main>
    </div>
  );
}
