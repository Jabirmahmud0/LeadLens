import * as React from 'react';
import Link from 'next/link';
import { Target, ArrowRight } from 'lucide-react';

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white selection:bg-blue-500/30 font-sans flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/5 bg-black/60 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(37,99,235,0.5)] group-hover:shadow-[0_0_25px_rgba(37,99,235,0.7)] transition-all">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-lg tracking-tight">LeadLens</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <Link href="/product" className="hover:text-white transition-colors">Product</Link>
            <Link href="/use-cases" className="hover:text-white transition-colors">Use Cases</Link>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
          </nav>
          
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors hidden sm:block">
              Sign In
            </Link>
            <Link href="/login" className="bg-white text-black px-4 py-2 rounded-lg text-sm font-medium hover:bg-neutral-200 transition-colors flex items-center gap-2">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 bg-black pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center">
                <Target className="w-3.5 h-3.5 text-white" />
              </div>
              <span className="font-bold tracking-tight">LeadLens</span>
            </div>
            <p className="text-sm text-neutral-500 max-w-xs">
              The AI analysis pipeline for agencies. Stop guessing what prospects need and start proving it.
            </p>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-4">Product</h4>
            <ul className="space-y-3 text-sm text-neutral-500">
              <li><Link href="/product" className="hover:text-white transition-colors">Features</Link></li>
              <li><Link href="/use-cases" className="hover:text-white transition-colors">Use Cases</Link></li>
              <li><Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link></li>
              <li><Link href="/changelog" className="hover:text-white transition-colors">Changelog</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-4">Company</h4>
            <ul className="space-y-3 text-sm text-neutral-500">
              <li><Link href="/about" className="hover:text-white transition-colors">About</Link></li>
              <li><Link href="/blog" className="hover:text-white transition-colors">Blog</Link></li>
              <li><Link href="/careers" className="hover:text-white transition-colors">Careers</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-medium text-white mb-4">Legal</h4>
            <ul className="space-y-3 text-sm text-neutral-500">
              <li><Link href="/privacy" className="hover:text-white transition-colors">Privacy Policy</Link></li>
              <li><Link href="/terms" className="hover:text-white transition-colors">Terms of Service</Link></li>
              <li><Link href="/security" className="hover:text-white transition-colors">Security</Link></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto px-6 border-t border-white/5 pt-8 flex flex-col md:flex-row items-center justify-between text-xs text-neutral-600">
          <p>© {new Date().getFullYear()} LeadLens Inc. All rights reserved.</p>
          <div className="flex items-center gap-4 mt-4 md:mt-0">
            <a href="#" className="hover:text-neutral-400 transition-colors">Twitter</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">LinkedIn</a>
            <a href="#" className="hover:text-neutral-400 transition-colors">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
