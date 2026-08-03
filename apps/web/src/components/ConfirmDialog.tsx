'use client';

import { useEffect } from 'react';
import { AlertTriangle, Loader2, X } from 'lucide-react';

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  busy = false,
  destructive = false,
  onConfirm,
  onCancel,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  busy?: boolean;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && !busy) onCancel();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [busy, onCancel, open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] grid place-items-center bg-[#10251d]/35 p-4 backdrop-blur-sm">
      <section role="alertdialog" aria-modal="true" aria-labelledby="confirm-dialog-title" aria-describedby="confirm-dialog-description" className="relative w-full max-w-md rounded-[24px] border border-[#d9e7dd] bg-white p-6 text-[#16352a] shadow-[0_30px_90px_-35px_rgba(15,35,24,.55)]">
        <button type="button" aria-label="Close confirmation" disabled={busy} onClick={onCancel} className="absolute right-4 top-4 grid size-9 place-items-center rounded-xl text-[#789084] hover:bg-[#f2f7f3] hover:text-[#16352a] disabled:opacity-40"><X className="size-4" /></button>
        <span className={`grid size-11 place-items-center rounded-2xl ${destructive ? 'bg-rose-50 text-rose-700' : 'bg-amber-50 text-amber-700'}`}><AlertTriangle className="size-5" /></span>
        <h2 id="confirm-dialog-title" className="mt-5 pr-8 text-xl font-bold tracking-[-0.03em]">{title}</h2>
        <p id="confirm-dialog-description" className="mt-2 text-sm leading-6 text-[#60766b]">{description}</p>
        <div className="mt-6 flex gap-3"><button type="button" disabled={busy} onClick={onCancel} className="h-11 flex-1 rounded-xl border border-[#d6e3da] bg-white text-sm font-semibold text-[#365246] hover:bg-[#f7faf7] disabled:opacity-50">{cancelLabel}</button><button type="button" disabled={busy} onClick={onConfirm} className={`inline-flex h-11 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-white disabled:opacity-50 ${destructive ? 'bg-rose-600 hover:bg-rose-700' : 'bg-[#166534] hover:bg-[#14532d]'}`}>{busy && <Loader2 className="size-4 animate-spin" />}{confirmLabel}</button></div>
      </section>
    </div>
  );
}
