'use client';

import NextLink from 'next/link';
import { usePathname } from 'next/navigation';
import {
  FileText,
  LayoutDashboard,
  Link2,
  Mail,
  Map,
  PhoneCall,
  Sparkles,
  Target,
} from 'lucide-react';
import { ReportActions } from './ReportActions';

interface ReportLayoutWrapperProps {
  children: React.ReactNode;
  analysisId: string;
  reportId: string;
}

export function ReportLayoutWrapper({ children, analysisId, reportId }: ReportLayoutWrapperProps) {
  const pathname = usePathname();
  const items = [
    { label: 'Overview', href: `/analyses/${analysisId}/report`, icon: LayoutDashboard },
    { label: 'Findings', href: `/analyses/${analysisId}/report/findings`, icon: Map },
    { label: 'Opportunities', href: `/analyses/${analysisId}/report/opportunities`, icon: Target },
    { label: 'Outreach', href: `/analyses/${analysisId}/report/outreach`, icon: Mail },
    { label: 'Call prep', href: `/analyses/${analysisId}/report/call-prep`, icon: PhoneCall },
    { label: 'Proposal', href: `/analyses/${analysisId}/report/proposal`, icon: FileText },
    { label: 'Sources', href: `/analyses/${analysisId}/report/sources`, icon: Link2 },
  ];

  return (
    <div className="report-workspace relative min-h-full overflow-hidden bg-[#f4f8f3] text-[#10251d]">
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[28rem] bg-[radial-gradient(circle_at_80%_0%,rgba(47,158,92,0.14),transparent_35%),radial-gradient(circle_at_20%_10%,rgba(245,201,92,0.12),transparent_30%)]" />
      <header className="report-chrome sticky top-0 z-30 border-b border-[#d8e5db]/90 bg-[#f8fbf7]/88 backdrop-blur-xl">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
          <NextLink href={`/analyses/${analysisId}`} className="group flex min-w-0 items-center gap-3 rounded-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600">
            <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#123c2c] text-white shadow-[0_8px_24px_rgba(18,60,44,0.18)] transition-transform duration-300 ease-out group-hover:-translate-y-0.5">
              <Sparkles className="size-4" />
            </span>
            <span className="min-w-0">
              <span className="block text-[10px] font-bold uppercase tracking-[0.18em] text-[#71877b]">Intelligence workspace</span>
              <span className="block truncate text-sm font-semibold text-[#16352a]">Opportunity report</span>
            </span>
          </NextLink>
          <ReportActions reportId={reportId} analysisId={analysisId} />
        </div>
        <nav aria-label="Report sections" className="mx-auto max-w-[1500px] overflow-x-auto px-4 sm:px-6 lg:px-8">
          <div className="flex min-w-max items-center gap-1 pb-2">
            {items.map((item) => {
              const active = pathname === item.href;
              return (
                <NextLink
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-semibold transition-all duration-300 ease-out focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600 ${active ? 'bg-white text-[#14532d] shadow-[0_8px_24px_rgba(32,72,50,0.09)] ring-1 ring-[#dbe9de]' : 'text-[#60766b] hover:bg-white/70 hover:text-[#16352a]'}`}
                >
                  <item.icon className={`size-3.5 ${active ? 'text-emerald-700' : 'text-[#8ca096]'}`} />
                  {item.label}
                </NextLink>
              );
            })}
          </div>
        </nav>
      </header>
      <div className="relative z-10">{children}</div>
    </div>
  );
}
