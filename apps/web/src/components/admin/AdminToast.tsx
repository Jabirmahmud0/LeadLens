'use client';

import { Toaster, toast } from 'sonner';
import { ShieldCheck, AlertOctagon, Loader2, CheckCircle2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

export function AdminToaster() {
  return (
    <Toaster 
      position="bottom-right"
      toastOptions={{
        className: 'bg-transparent border-0 shadow-none p-0',
        duration: 4000,
      }}
    />
  );
}

interface AdminToastProps {
  title: string;
  description?: string;
  type?: 'success' | 'error' | 'info' | 'loading';
  action?: ReactNode;
  t?: string | number; // Toast ID from sonner
}

export function AdminToastContent({ title, description, type = 'info', action, t }: AdminToastProps) {
  const isError = type === 'error';
  const isSuccess = type === 'success';
  const isLoading = type === 'loading';

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={`relative w-full min-w-[340px] max-w-sm overflow-hidden rounded-[20px] border p-4 shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] backdrop-blur-xl ${
        isError 
          ? 'border-rose-200/60 bg-rose-50/90 text-rose-950' 
          : isSuccess
          ? 'border-emerald-200/60 bg-emerald-50/90 text-emerald-950'
          : 'border-blue-200/60 bg-blue-50/90 text-blue-950'
      }`}
    >
      <div className="flex gap-4">
        <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border shadow-sm ${
          isError ? 'border-rose-200 bg-white text-rose-600' :
          isSuccess ? 'border-emerald-200 bg-white text-emerald-600' :
          isLoading ? 'border-blue-200 bg-white text-blue-600' :
          'border-blue-200 bg-white text-blue-600'
        }`}>
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
           isError ? <AlertOctagon className="h-4 w-4" /> : 
           isSuccess ? <CheckCircle2 className="h-4 w-4" /> : 
           <ShieldCheck className="h-4 w-4" />}
        </div>
        
        <div className="flex-1">
          <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
          {description && (
            <p className={`mt-1 text-xs ${
              isError ? 'text-rose-700/80' : 
              isSuccess ? 'text-emerald-700/80' : 
              'text-blue-700/80'
            }`}>{description}</p>
          )}
        </div>
        
        {action && (
          <div className="shrink-0 pt-1">
            {action}
          </div>
        )}
      </div>
      
      {/* Decorative gradient overlay */}
      <div className="absolute inset-0 -z-10 rounded-[20px] bg-gradient-to-tr from-white/40 to-transparent pointer-events-none" />
    </motion.div>
  );
}

export const showAdminToast = {
  success: (title: string, description?: string) => {
    toast.custom((t) => <AdminToastContent t={t} title={title} description={description} type="success" />);
  },
  error: (title: string, description?: string) => {
    toast.custom((t) => <AdminToastContent t={t} title={title} description={description} type="error" />);
  },
  info: (title: string, description?: string) => {
    toast.custom((t) => <AdminToastContent t={t} title={title} description={description} type="info" />);
  },
  promise: async <T,>(
    promise: Promise<T>,
    { loading, success, error }: { loading: string, success: string | ((data: T) => string), error: string | ((err: any) => string) }
  ) => {
    const id = toast.custom((t) => <AdminToastContent t={t} title={loading} type="loading" />, { duration: 100000 });
    try {
      const data = await promise;
      const successTitle = typeof success === 'function' ? success(data) : success;
      toast.custom((t) => <AdminToastContent t={t} title={successTitle} type="success" />, { id, duration: 4000 });
      return data;
    } catch (err) {
      const errorTitle = typeof error === 'function' ? error(err) : error;
      toast.custom((t) => <AdminToastContent t={t} title={errorTitle} type="error" />, { id, duration: 5000 });
      throw err;
    }
  }
};
