import { ReactNode } from 'react';

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-50 flex flex-col selection:bg-white selection:text-black">
      {/* Abstract background ambient light */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-b from-neutral-800/20 to-transparent rounded-full blur-[120px] opacity-50" />
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-t from-neutral-800/20 to-transparent rounded-full blur-[120px] opacity-50" />
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  );
}
