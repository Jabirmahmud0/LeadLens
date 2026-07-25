'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';

const STEPS = [
  { id: 'identity', label: 'Identity', path: '/onboarding/identity' },
  { id: 'services', label: 'Services', path: '/onboarding/services' },
  { id: 'icp', label: 'Ideal Client', path: '/onboarding/icp' },
  { id: 'case-studies', label: 'Case Studies', path: '/onboarding/case-studies' },
  { id: 'preferences', label: 'Preferences', path: '/onboarding/preferences' },
];

export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const currentStepIndex = STEPS.findIndex(s => s.path === pathname);
  const currentStep = STEPS[currentStepIndex];
  
  // Calculate completion percentage based on current step (e.g. step 1 = 20%)
  const completionPercentage = currentStepIndex >= 0 ? ((currentStepIndex + 1) / STEPS.length) * 100 : 0;

  return (
    <div className="min-h-screen bg-neutral-950 flex flex-col">
      {/* Top Progress Bar */}
      <div className="sticky top-0 z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center">
              <span className="text-black font-bold text-sm">LL</span>
            </div>
            <span className="text-sm font-medium text-neutral-400 hidden sm:block">Agency Setup</span>
          </div>
          
          <div className="flex-1 max-w-md mx-8 hidden sm:block">
            <div className="h-1.5 w-full bg-neutral-800 rounded-full overflow-hidden">
              <div 
                className="h-full bg-white transition-all duration-500 ease-in-out"
                style={{ width: `\${completionPercentage}%` }}
              />
            </div>
            <div className="mt-2 flex justify-between text-xs text-neutral-500">
              <span>{currentStep?.label || 'Welcome'}</span>
              <span>{Math.round(completionPercentage)}% completed</span>
            </div>
          </div>
          
          <div className="text-sm font-medium text-neutral-400">
            Step {Math.max(1, currentStepIndex + 1)} of {STEPS.length}
          </div>
        </div>
        {/* Mobile progress bar (just the line) */}
        <div className="h-1 w-full bg-neutral-800 sm:hidden">
          <div 
            className="h-full bg-white transition-all duration-500 ease-in-out"
            style={{ width: `\${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>
    </div>
  );
}
