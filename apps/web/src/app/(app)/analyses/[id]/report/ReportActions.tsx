'use client';

import {
  Check,
  ChevronDown,
  Clipboard,
  Download,
  FileDown,
  FileText,
  MoreHorizontal,
  Printer,
  RefreshCw,
  RotateCcw,
  Trash2,
  type LucideIcon,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';
import { ConfirmDialog } from '@/components/ConfirmDialog';

export function ReportActions({ reportId, analysisId }: { reportId: string; analysisId: string }) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const runAction = async (path: string, body: object, success: string) => {
    const response = await fetch(`/api/reports/${reportId}/${path}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) });
    if (!response.ok) return toast.error((await response.json().catch(() => null))?.error || 'Action failed');
    toast.success(success);
    router.push(path === 'regenerate' ? `/analyses/${analysisId}` : `/analyses/${analysisId}/report`);
    router.refresh();
  };
  const copyReport = async () => {
    const response = await fetch(`/api/reports/${reportId}/export?action=copy`);
    if (!response.ok) return toast.error('Unable to copy report');
    await navigator.clipboard.writeText(await response.text());
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1800);
    toast.success('Report copied');
  };

  const deleteReport = async () => {
    setDeleting(true);
    const response = await fetch(`/api/reports/${reportId}`, { method: 'DELETE' });
    if (!response.ok) {
      toast.error('Unable to delete report');
      setDeleting(false);
      return;
    }
    toast.success('Report deleted');
    setConfirmDelete(false);
    router.push('/analyses');
    router.refresh();
  };

  return (
    <>
    <div className="flex shrink-0 items-center gap-2">
      <button type="button" onClick={copyReport} className="hidden h-10 items-center gap-2 rounded-xl border border-[#d5e3d8] bg-white/80 px-3 text-xs font-semibold text-[#365246] shadow-sm transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-white hover:text-[#14532d] sm:flex">
        {copied ? <Check className="size-4 text-emerald-700" /> : <Clipboard className="size-4" />}
        {copied ? 'Copied' : 'Copy'}
      </button>

      <details className="group relative">
        <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-xl bg-[#166534] px-3.5 text-xs font-semibold text-white shadow-[0_10px_26px_rgba(22,101,52,0.22)] transition-all duration-300 ease-out hover:-translate-y-0.5 hover:bg-[#14532d] [&::-webkit-details-marker]:hidden">
          <Download className="size-4" />
          <span className="hidden sm:inline">Export</span>
          <ChevronDown className="size-3.5 transition-transform duration-300 group-open:rotate-180" />
        </summary>
        <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-2xl border border-[#d5e3d8] bg-white/95 p-1.5 shadow-[0_22px_60px_rgba(18,60,44,0.18)] backdrop-blur-xl">
          <ExportLink href={`/api/reports/${reportId}/export?format=pdf`} icon={FileDown} title="PDF document" detail="Polished and ready to share" />
          <ExportLink href={`/api/reports/${reportId}/export?format=docx`} icon={FileText} title="Word document" detail="Editable .docx file" />
          <ExportLink href={`/api/reports/${reportId}/export?format=markdown`} icon={Download} title="Markdown" detail="Portable plain-text report" />
        </div>
      </details>

      <details className="group relative">
        <summary aria-label="More report actions" className="flex size-10 cursor-pointer list-none items-center justify-center rounded-xl border border-[#d5e3d8] bg-white/80 text-[#365246] shadow-sm transition-all duration-300 ease-out hover:bg-white hover:text-[#14532d] [&::-webkit-details-marker]:hidden">
          <MoreHorizontal className="size-4" />
        </summary>
        <div className="absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-[#d5e3d8] bg-white/95 p-1.5 shadow-[0_22px_60px_rgba(18,60,44,0.18)] backdrop-blur-xl">
          <MenuButton icon={RefreshCw} label="Regenerate report" onClick={() => runAction('regenerate', { section: 'all' }, 'Regeneration queued')} />
          <MenuButton icon={RotateCcw} label="Restore summary" onClick={() => runAction('restore', { section: 'summary' }, 'Original summary restored')} />
          <MenuButton icon={Printer} label="Print report" onClick={() => window.print()} />
          <div className="my-1 border-t border-[#e4ece5]" />
          <MenuButton
            icon={Trash2}
            label="Delete report"
            destructive
            onClick={() => setConfirmDelete(true)}
          />
        </div>
      </details>
    </div>
    <ConfirmDialog open={confirmDelete} title="Delete this report?" description="This permanently removes the report and its associated analysis data. This action cannot be undone." confirmLabel="Delete report" destructive busy={deleting} onCancel={() => setConfirmDelete(false)} onConfirm={() => void deleteReport()} />
    </>
  );
}

function ExportLink({ href, icon: Icon, title, detail }: { href: string; icon: LucideIcon; title: string; detail: string }) {
  return (
    <a href={href} className="flex items-start gap-3 rounded-xl px-3 py-2.5 transition-colors duration-300 ease-out hover:bg-[#eef6f0]">
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-[#e5f3e8] text-emerald-700"><Icon className="size-4" /></span>
      <span><span className="block text-xs font-semibold text-[#16352a]">{title}</span><span className="mt-0.5 block text-[10px] text-[#71877b]">{detail}</span></span>
    </a>
  );
}

function MenuButton({ icon: Icon, label, onClick, destructive = false }: { icon: LucideIcon; label: string; onClick: () => void; destructive?: boolean }) {
  return (
    <button type="button" onClick={onClick} className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left text-xs font-semibold transition-colors duration-300 ease-out ${destructive ? 'text-rose-700 hover:bg-rose-50' : 'text-[#365246] hover:bg-[#eef6f0] hover:text-[#14532d]'}`}>
      <Icon className="size-4" />{label}
    </button>
  );
}
