import * as React from 'react';
import { SettingsNav } from './SettingsNav';

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-light text-white tracking-tight mb-2">Configuration</h1>
        <p className="text-neutral-400">Manage your agency profile, services, and proof points.</p>
      </div>
      
      <SettingsNav />
      
      <div className="pb-20">
        {children}
      </div>
    </div>
  );
}
