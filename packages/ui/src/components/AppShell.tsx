'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Menu, X } from 'lucide-react';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  children: React.ReactNode;
}

export function AppShell({ sidebar, children, className, ...props }: AppShellProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const drawerRef = React.useRef<HTMLElement>(null);
  const menuButtonRef = React.useRef<HTMLButtonElement>(null);
  React.useEffect(() => {
    if (!isMobileOpen) return;
    const drawer = drawerRef.current;
    const focusable = drawer?.querySelectorAll<HTMLElement>('a,button,input,select,textarea,[tabindex]:not([tabindex="-1"])');
    focusable?.[0]?.focus();
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') { setIsMobileOpen(false); menuButtonRef.current?.focus(); return; }
      if (event.key === 'Tab' && focusable?.length) {
        const first = focusable[0]; const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
        else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [isMobileOpen]);

  return (
    <div className={cn("min-h-screen bg-neutral-950 flex", className)} {...props}>
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside ref={drawerRef} role={isMobileOpen ? 'dialog' : undefined} aria-modal={isMobileOpen || undefined} aria-label="Navigation" className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-neutral-950 border-r border-neutral-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:w-64 shrink-0 flex flex-col",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile close button inside sidebar header usually handled by Sidebar component, but we can provide a wrapper if needed. Let's just let the Sidebar component handle its content. */}
        <button type="button" aria-label="Close navigation" onClick={() => { setIsMobileOpen(false); menuButtonRef.current?.focus(); }} className="absolute right-3 top-3 rounded p-2 text-neutral-400 hover:text-white lg:hidden"><X className="h-5 w-5" /></button><div className="flex-1 overflow-y-auto">
          {sidebar}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="h-16 border-b border-neutral-800 bg-neutral-950/80 backdrop-blur-md flex items-center px-4 lg:hidden sticky top-0 z-30">
          <button 
            ref={menuButtonRef}
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={isMobileOpen}
            className="p-2 -ml-2 mr-2 text-neutral-400 hover:text-white"
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center font-bold text-black text-sm">
            LL
          </div>
          <span className="ml-3 font-semibold text-white">LeadLens</span>
        </header>

        <main className="flex-1 overflow-y-auto bg-neutral-950">
          {children}
        </main>
      </div>
    </div>
  );
}
