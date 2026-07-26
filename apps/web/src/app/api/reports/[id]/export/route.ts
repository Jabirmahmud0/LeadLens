import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';

function section(title: string, body?: string | null) {
  return body ? `\n## ${title}\n\n${body.trim()}\n` : '';
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.organization) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const { id } = await params;
  const report = await db.query.reports.findFirst({
    where: and(eq(schema.reports.id, id), eq(schema.reports.organizationId, session.organization.id)),
    with: {
      prospect: true,
      scores: true,
      findings: { with: { sources: { with: { sourcePage: true } } } },
      serviceRecommendations: { with: { service: true } },
      outreach: true,
      callQuestions: true,
      objections: true,
      proposalStarters: true,
    },
  });
  if (!report) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const eventName = new URL(req.url).searchParams.get('action') === 'copy' ? 'report_copied' : 'report_exported';
  await db.insert(schema.usageEvents).values({ organizationId: session.organization.id, userId: session.user.id, eventName, properties: { reportId: report.id, analysisId: report.analysisJobId } });

  const scores = report.scores.map((score) => `- ${score.category}: ${score.score ?? 'N/A'}/100`).join('\n');
  const findings = report.findings.map((finding) => {
    const sources = finding.sources.map((citation) =>
      `  - [${citation.sourcePage.title || citation.sourcePage.url}](${citation.sourcePage.url})${citation.evidenceExcerpt ? ` — ${citation.evidenceExcerpt}` : ''}`
    ).join('\n');
    return `### ${finding.title}\n\n- Severity: ${finding.severity || 'unknown'}\n- Confidence: ${finding.confidence || 'unknown'}\n\n${finding.observation || ''}\n\n**Business impact:** ${finding.businessImpact || 'Not established'}\n\n**Recommendation:** ${finding.recommendation || 'Further validation required'}${sources ? `\n\nSources:\n${sources}` : ''}`;
  }).join('\n\n');
  const outreach = report.outreach.map((item) =>
    `### ${item.channel || 'Message'}\n\n${item.userEditedBody || item.body || ''}`
  ).join('\n\n');
  const questions = report.callQuestions.map((question) => `- [${question.isChecked ? 'x' : ' '}] ${question.question}${question.notes ? ` — Notes: ${question.notes}` : ''}`).join('\n');
  const proposal = report.proposalStarters[0];

  const markdown = `# ${report.title || 'LeadLens Opportunity Brief'}\n\n` +
    `Website: ${report.prospect.websiteUrl}\n\nGenerated: ${(report.generatedAt || report.createdAt).toISOString()}\n\n` +
    `> Decision-support report based on visible public information and configured agency preferences. Verify material claims before outreach.\n` +
    section('Executive summary', report.executiveSummary) +
    section('Opportunity thesis', report.opportunityThesis) +
    section('Score breakdown', scores) +
    section('Findings', findings) +
    section('Outreach', outreach) +
    section('Discovery-call questions', questions) +
    section('Proposal starter', proposal ? `${proposal.problemStatement || ''}\n\n### Objectives\n${proposal.objectives || ''}\n\n### Scope\n${proposal.scope || ''}\n\n### Phases\n${proposal.phases || ''}\n\n### Success metrics\n${proposal.successMetrics || ''}\n\n### Assumptions\n${proposal.assumptions || ''}\n\n### Next step\n${proposal.nextStep || ''}` : '') +
    section('Limitations', report.limitations);

  return new NextResponse(markdown, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'content-disposition': `attachment; filename="leadlens-${report.id}.md"`,
    },
  });
}
