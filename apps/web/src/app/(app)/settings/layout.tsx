import * as React from 'react';
import { SettingsNav } from './SettingsNav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-page-enter mx-auto max-w-7xl p-4 sm:p-7 lg:p-9">
      <div className="mb-6 rounded-3xl border border-[#d6e5da] bg-gradient-to-r from-[#eaf7ed] via-white to-[#fff7dd] p-6 shadow-[0_24px_60px_-48px_rgba(20,83,45,0.55)] sm:p-8">
        <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-emerald-700">AI context system</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-[-0.04em] text-[#10251d]">Agency configuration</h1>
        <p className="mt-2 text-sm text-[#60766b]">Shape how LeadLens qualifies opportunities, matches services, and frames proof.</p>
      </div>
      
      <SettingsNav />
      
      <div className="pb-20">
        {children}
      </div>
    </div>
  );
}
