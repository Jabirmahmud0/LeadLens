import * as React from 'react';
import type { Metadata } from 'next';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

export const metadata: Metadata = {
  title: 'LeadLens | Stop guessing. Start closing.',
  description: 'Turn any prospect website into a heavily researched, highly persuasive Opportunity Brief. Pitch with proof, not promises.',
};

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="min-h-screen bg-[var(--color-bg)] selection:bg-emerald-100 flex flex-col not-italic text-[var(--color-text)]"
      style={{ fontFamily: '"Segoe UI Variable Text", "Aptos", "Segoe UI", Arial, sans-serif', fontStyle: 'normal' }}
    >
      <Header />
      <main className="flex-1">
        {children}
      </main>
      <Footer />
    </div>
  );
}
