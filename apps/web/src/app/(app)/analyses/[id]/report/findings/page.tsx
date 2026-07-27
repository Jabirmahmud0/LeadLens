import { db, schema } from '@leadlens/database';
import { and, eq } from 'drizzle-orm';
import { requireSession } from '@/lib/auth/session';
import { notFound } from 'next/navigation';
import { Badge, SourceChip } from '@leadlens/ui';
import { FindingCard } from '@leadlens/ui/client';
import { ExternalLink, ShieldAlert, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';
import Link from 'next/link';
import { FindingControls } from './FindingControls';
import { FindingsConsole } from './FindingsConsole';

export default async function ReportFindingsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await requireSession();
  if (!session.organization) notFound();

  // Fetch Report with Relations
  const report = await db.query.reports.findFirst({
    where: and(eq(schema.reports.analysisJobId, id), eq(schema.reports.organizationId, session.organization.id)),
    with: {
      findings: {
        with: {
          sources: {
            with: {
              sourcePage: true
            }
          }
        },
        orderBy: (f, { asc }) => asc(f.sortOrder),
      }
    }
  });

  if (!report) {
    notFound();
  }

  return (
    <div className="flex-1 px-4 py-8 sm:px-6 lg:px-8 lg:py-8 not-italic">
      <div className="mx-auto max-w-[1600px] space-y-8">
        
        {/* Header */}
        <header className="report-reveal">
          <h1 className="text-3xl font-semibold tracking-[-0.03em] text-[#10251d] sm:text-4xl not-italic">
            Evidence Map
          </h1>
          <p className="mt-3 text-base text-[#60766b] sm:text-lg not-italic">
            A detailed breakdown of all verified technical, strategic, and performance issues discovered.
          </p>
        </header>

        {/* Console Layout */}
        <div className="report-reveal">
          <FindingsConsole findings={report.findings} />
        </div>
      </div>
    </div>
  );
}
