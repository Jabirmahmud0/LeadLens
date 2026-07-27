'use client';

import * as React from 'react';
import { cn } from '../lib/utils';
import { Menu, X } from 'lucide-react';

export interface AppShellProps extends React.HTMLAttributes<HTMLDivElement> {
  sidebar: React.ReactNode;
  children: React.ReactNode;
  tone?: 'dark' | 'light';
}

export function AppShell({ sidebar, children, tone = 'dark', className, ...props }: AppShellProps) {
  const [isMobileOpen, setIsMobileOpen] = React.useState(false);
  const isLight = tone === 'light';
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
    <div className={cn("flex min-h-screen", isLight ? "bg-[#f6f9f5] text-[#10251d]" : "bg-neutral-950", className)} {...props}>
      {/* Mobile sidebar backdrop */}
      {isMobileOpen && (
        <div 
          className={cn("fixed inset-0 z-40 backdrop-blur-sm lg:hidden", isLight ? "bg-[#10251d]/25" : "bg-black/80")}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside ref={drawerRef} role={isMobileOpen ? 'dialog' : undefined} aria-modal={isMobileOpen || undefined} aria-label="Navigation" className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-64 shrink-0 transform flex-col border-r transition-transform duration-300 ease-in-out lg:static lg:w-64 lg:translate-x-0",
        isLight ? "border-[#dce7df] bg-[#fbfcf8]" : "border-neutral-800 bg-neutral-950",
        isMobileOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        {/* Mobile close button inside sidebar header usually handled by Sidebar component, but we can provide a wrapper if needed. Let's just let the Sidebar component handle its content. */}
        <button type="button" aria-label="Close navigation" onClick={() => { setIsMobileOpen(false); menuButtonRef.current?.focus(); }} className={cn("absolute right-3 top-3 rounded p-2 lg:hidden", isLight ? "text-[#789084] hover:bg-emerald-50 hover:text-[#166534]" : "text-neutral-400 hover:text-white")}><X className="h-5 w-5" /></button><div className="flex-1 overflow-y-auto">
          {sidebar}
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className={cn("sticky top-0 z-30 flex h-16 items-center border-b px-4 backdrop-blur-md lg:hidden", isLight ? "border-[#dce7df] bg-[#fbfcf8]/90" : "border-neutral-800 bg-neutral-950/80")}>
          <button 
            ref={menuButtonRef}
            onClick={() => setIsMobileOpen(true)}
            aria-label="Open navigation"
            aria-expanded={isMobileOpen}
            className={cn("-ml-2 mr-2 p-2", isLight ? "text-[#60766b] hover:text-[#166534]" : "text-neutral-400 hover:text-white")}
          >
            <Menu className="w-6 h-6" />
          </button>
          <div className={cn("flex h-8 w-8 items-center justify-center rounded-lg text-sm font-bold", isLight ? "bg-[#166534] text-white" : "bg-white text-black")}>
            LL
          </div>
          <span className={cn("ml-3 font-semibold", isLight ? "text-[#10251d]" : "text-white")}>LeadLens</span>
        </header>

        <main className={cn("flex-1 overflow-y-auto", isLight ? "bg-[#f6f9f5]" : "bg-neutral-950")}>
          {children}
        </main>
      </div>
    </div>
  );
}
