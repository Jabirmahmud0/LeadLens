'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Mail, ArrowRight, RefreshCw, CheckCircle2 } from 'lucide-react';

export default function VerifyEmailPage() {
  const [userEmail, setUserEmail] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState<{ text: string, type: 'success' | 'error' } | null>(null);

  const maskedEmail = userEmail.replace(/(.{2})(.*)(?=@)/, (gp1, gp2, gp3) => {
    return gp2 + '*'.repeat(gp3.length);
  });

  useEffect(() => {
    setUserEmail(new URLSearchParams(window.location.search).get('email') || '');
  }, []);

  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handleResend = async () => {
    if (countdown > 0 || !userEmail) return;
    
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
    <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-[2rem] border border-[#cfe0d3] shadow-[0_38px_90px_-56px_rgba(20,83,45,0.55)] text-center">
      
      {/* Mail Path Visualization */}
      <div className="flex items-center justify-center gap-4 mb-8">
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#f0f4f1] border border-[#cfddd3] flex items-center justify-center">
            <Mail className="w-5 h-5 text-[#60766b]" />
          </div>
          <span className="text-[10px] font-bold text-[#60766b] uppercase tracking-wider">Sent</span>
        </div>
        
        <div className="w-12 h-0.5 bg-gradient-to-r from-[#cfddd3] to-[#e8f1ec] relative">
          <div className="absolute inset-0 bg-[#166534]/40 w-full animate-[pulse_2s_ease-in-out_infinite]" />
        </div>
        
        <div className="flex flex-col items-center gap-2">
          <div className="w-10 h-10 rounded-full bg-[#166534] border border-[#14532d] flex items-center justify-center relative shadow-[0_5px_15px_rgba(22,101,52,0.25)]">
            <div className="absolute top-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-white" />
            <Mail className="w-5 h-5 text-white" />
          </div>
          <span className="text-[10px] font-bold text-[#10251d] uppercase tracking-wider">Inbox</span>
        </div>
        
        <div className="w-12 h-0.5 bg-[#e8f1ec]" />
        
        <div className="flex flex-col items-center gap-2 opacity-60">
          <div className="w-10 h-10 rounded-full bg-[#fbfdfb] border border-[#e0e9e2] flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5 text-[#91a49a]" />
          </div>
          <span className="text-[10px] font-bold text-[#91a49a] uppercase tracking-wider">Verify</span>
        </div>
      </div>

      <div>
        <h2 className="text-3xl font-semibold tracking-[-0.05em] text-[#10251d]">Check your email</h2>
        <p className="mt-4 text-sm text-[#60766b] leading-relaxed">
          we&apos;ve sent a verification link to <br/>
          <span className="font-semibold text-[#10251d]">{maskedEmail || 'your registered address'}</span>
        </p>
      </div>

      {message && (
        <div className={`p-3 rounded-xl text-sm ${message.type === 'success' ? 'bg-emerald-50 border border-emerald-200 text-emerald-800' : 'bg-rose-50 border border-rose-200 text-rose-700'}`}>
          {message.text}
        </div>
      )}

      <div className="pt-6 space-y-4">
        <button
          onClick={handleResend}
          disabled={countdown > 0 || isResending || !userEmail}
          className="group relative flex w-full justify-center items-center gap-2 rounded-xl bg-[#166534] px-4 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-[#14532d] hover:shadow-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0 disabled:hover:shadow-none"
        >
          {isResending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className={`w-4 h-4 ${countdown === 0 ? 'group-hover:rotate-180 transition-transform duration-500' : ''}`} />}
          {countdown > 0 ? `Resend in ${countdown}s` : 'Resend verification email'}
        </button>

        <p className="text-sm text-[#60766b]">
          Wrong email?{' '}
          <Link href="/register" className="font-semibold text-emerald-800 hover:text-emerald-600">
            Change email
          </Link>
        </p>
      </div>
      
      <div className="mt-8 pt-8 border-t border-[#e0e9e2] text-xs font-medium text-[#789084]">
        You can safely close this window once verified.
      </div>
    </div>
  );
}
