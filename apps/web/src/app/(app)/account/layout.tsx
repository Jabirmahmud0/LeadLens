import * as React from 'react';
import { AccountNav } from './AccountNav';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-page-enter mx-auto max-w-7xl p-4 sm:p-7 lg:p-9">
      <div className="mb-6 rounded-3xl border border-[#d9e6dc] bg-gradient-to-r from-[#eef8f0] via-white to-[#fff1ef] p-6 shadow-[0_24px_60px_-48px_rgba(20,83,45,0.55)] sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-teal-700">Personal workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#10251d]">My account</h1>
        <p className="mt-2 text-sm text-[#60766b]">Keep your identity, sign-in security, and communication preferences current.</p>
      </div>
      
      <AccountNav />
      
      <div className="pb-20 max-w-4xl">
        {children}
      </div>
    </div>
  );
}
