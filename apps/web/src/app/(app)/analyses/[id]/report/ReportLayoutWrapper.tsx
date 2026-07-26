'use client';

import { AppShell, Sidebar } from '@leadlens/ui';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  Map, 
  Target, 
  Mail, 
  PhoneCall, 
  FileText, 
  Link 
} from 'lucide-react';
import { ReportActions } from './ReportActions';

interface ReportLayoutWrapperProps {
  children: React.ReactNode;
  agencyName?: string;
  analysisId: string;
  reportId: string;
}

export function ReportLayoutWrapper({ children, agencyName, analysisId, reportId }: ReportLayoutWrapperProps) {
  const pathname = usePathname();

  const navGroups = [
    {
      label: 'Intelligence',
      items: [
        { label: 'Overview', href: `/analyses/${analysisId}/report`, icon: LayoutDashboard, isActive: pathname === `/analyses/${analysisId}/report` },
        { label: 'Findings Map', href: `/analyses/${analysisId}/report/findings`, icon: Map, isActive: pathname === `/analyses/${analysisId}/report/findings` },
        { label: 'Opportunities', href: `/analyses/${analysisId}/report/opportunities`, icon: Target, isActive: pathname === `/analyses/${analysisId}/report/opportunities` },
      ]
    },
    {
      label: 'Action',
      items: [
        { label: 'Outreach Studio', href: `/analyses/${analysisId}/report/outreach`, icon: Mail, isActive: pathname === `/analyses/${analysisId}/report/outreach` },
        { label: 'Call Prep', href: `/analyses/${analysisId}/report/call-prep`, icon: PhoneCall, isActive: pathname === `/analyses/${analysisId}/report/call-prep` },
        { label: 'Proposal Starter', href: `/analyses/${analysisId}/report/proposal`, icon: FileText, isActive: pathname === `/analyses/${analysisId}/report/proposal` },
      ]
    },
    {
      label: 'Reference',
      items: [
        { label: 'Sources Ledger', href: `/analyses/${analysisId}/report/sources`, icon: Link, isActive: pathname === `/analyses/${analysisId}/report/sources` },
      ]
    }
  ];

  return (
    <AppShell
      sidebar={
        <Sidebar
          agencyName={agencyName}
          navGroups={navGroups}
        />
      }
    >
      {children}
      <ReportActions reportId={reportId} analysisId={analysisId} />
    </AppShell>
  );
}
