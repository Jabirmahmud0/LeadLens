import * as React from 'react';
import { AccountNav } from './AccountNav';

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-white tracking-tight mb-2">My Account</h1>
        <p className="text-neutral-400">Manage your personal profile, security, and preferences.</p>
      </div>
      
      <AccountNav />
      
      <div className="pb-20 max-w-4xl">
        {children}
      </div>
    </div>
  );
}
