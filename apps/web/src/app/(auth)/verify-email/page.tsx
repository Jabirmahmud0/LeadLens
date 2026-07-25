'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function VerifyEmailPage() {
  const router = useRouter();
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  // In a real app we'd fetch the user's unverified email from context/API
  // For the UI demonstration, we'll hardcode or use a fallback
  const userEmail = "jane@acmedigital.com";
  const maskedEmail = userEmail.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => {
    return gp2 + '*'.repeat(gp3.length);
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0) return;
    
    setIsResending(true);
    setMessage(null);
    
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: userEmail }),
      });
      
      if (res.ok) {
        setCountdown(60);
        setMessage({ text: 'Verification email sent!', type: 'success' });
      } else {
        const data = await res.json();
        setMessage({ text: data.error || 'Failed to resend email', type: 'error' });
      }
    } catch (err) {
      setMessage({ text: 'An error occurred', type: 'error' });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="w-full max-w-md space-y-8 bg-neutral-900/50 p-8 sm:p-10 rounded-3xl border border-neutral-800/50 backdrop-blur-xl shadow-2xl text-center">
      
      {/* Mail Path Visualization */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center">
            <Mail className="w-5 h-5 text-neutral-400" />
          </div>
          <span className="text-[10px] font-medium text-neutral-500 uppercase tracking-wider">Sent</span>
        </div>
        
        <div className="w-12 h-0.5 bg-gradient-to-r from-neutral-700 to-white/20 relative">
          <div className="absolute inset-0 bg-white/40 w-full animate-[pulse_2s_ease-in-out_infinite]" />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center relative shadow-[0_0_15px_rgba(255,255,255,0.1)]">
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-blue-500 rounded-full border-2 border-neutral-900" />
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-medium text-white uppercase tracking-wider">Inbox</span>
        </div>
        
        <div className="w-12 h-0.5 bg-neutral-800" />
        
        <div className="flex flex-col items-center gap-2 opacity-50">
          <div className="w-10 h-10 rounded-full bg-neutral-900 border border-neutral-800 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-neutral-600" />
          </div>
          <span className="text-[10px] font-medium text-neutral-600 uppercase tracking-wider">Verify</span>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-light tracking-tight text-white">Check your email</h2>
        <p className="mt-4 text-sm text-neutral-400 leading-relaxed">
          We've sent a verification link to <br/>
          <span className="font-medium text-white">{maskedEmail}</span>
        </p>
      </div>

      {message && (
        <div className={\`p-3 rounded-xl text-sm \${message.type === 'success' ? 'bg-green-950/50 border border-green-900/50 text-green-200' : 'bg-red-950/50 border border-red-900/50 text-red-200'}\`}>
          {message.text}
        </div>
      )}

      <div className="pt-6 space-y-4">
        <button
          onClick={handleResend}
          disabled={countdown > 0 || isResending}
          className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-neutral-800 px-4 py-3 text-sm font-medium text-white hover:bg-neutral-700 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed border border-neutral-700"
        >
          {isResending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className={\`w-4 h-4 \${countdown === 0 ? 'group-hover:rotate-180 transition-transform duration-500' : ''}\`} />}
          {countdown > 0 ? \`Resend in \${countdown}s\` : 'Resend verification email'}
        </button>

        <p className="text-sm text-neutral-500">
          Wrong email?{' '}
          <Link href="/register" className="text-neutral-300 hover:text-white hover:underline underline-offset-4">
            Change email
          </Link>
        </p>
      </div>
      
      <div className="mt-8 pt-8 border-t border-neutral-800/50 text-xs text-neutral-600">
        You can safely close this window once verified.
      </div>
    </div>
  );
}
