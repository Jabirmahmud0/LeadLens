import { NextResponse } from 'next/server';
import { and, eq } from 'drizzle-orm';
import { db, schema } from '@leadlens/database';
import { getSession } from '@/lib/auth/session';
import {
  createDocxExport,
  createMarkdownExport,
  createPdfExport,
  reportFilename,
  type ReportExportModel,
} from '@/lib/reports/exporters';

type ExportFormat = 'markdown' | 'pdf' | 'docx';

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

  const url = new URL(req.url);
  const isCopy = url.searchParams.get('action') === 'copy';
  const requestedFormat = url.searchParams.get('format');
  const format: ExportFormat = requestedFormat === 'pdf' || requestedFormat === 'docx' ? requestedFormat : 'markdown';
  const model: ReportExportModel = {
    id: report.id,
    title: report.title || 'LeadLens Opportunity Brief',
    website: report.prospect.websiteUrl,
    generatedAt: (report.generatedAt || report.createdAt).toISOString(),
    executiveSummary: report.executiveSummary || '',
    opportunityThesis: report.opportunityThesis || '',
    overallScore: report.overallScore,
    scoreLabel: report.scoreLabel || 'Not scored',
    recommendedAction: report.recommendedAction || '',
    limitations: report.limitations || '',
    scores: report.scores.map((score) => ({ category: score.category, score: score.score })),
    findings: report.findings.filter((finding) => !finding.isHidden).map((finding) => ({
      title: finding.title,
      severity: finding.severity || 'unknown',
      confidence: finding.confidence || 'unknown',
      observation: finding.observation || '',
      businessImpact: finding.businessImpact || '',
      recommendation: finding.recommendation || '',
      sources: finding.sources.map((citation) => ({
        title: citation.sourcePage.title || citation.sourcePage.url,
        url: citation.sourcePage.url,
        evidenceExcerpt: citation.evidenceExcerpt || '',
      })),
    })),
    outreach: report.outreach.map((item) => ({
      channel: item.channel || 'message',
      body: item.userEditedBody || item.body || '',
    })),
    callQuestions: report.callQuestions.map((question) => ({
      question: question.question || '',
      notes: question.notes || '',
      isChecked: Boolean(question.isChecked),
    })),
    proposal: report.proposalStarters[0] ? {
      problemStatement: report.proposalStarters[0].problemStatement || '',
      objectives: report.proposalStarters[0].objectives || '',
      scope: report.proposalStarters[0].scope || '',
      phases: report.proposalStarters[0].phases || '',
      successMetrics: report.proposalStarters[0].successMetrics || '',
      assumptions: report.proposalStarters[0].assumptions || '',
      nextStep: report.proposalStarters[0].nextStep || '',
    } : undefined,
  };

  await db.insert(schema.usageEvents).values({
    organizationId: session.organization.id,
    userId: session.user.id,
    eventName: isCopy ? 'report_copied' : 'report_exported',
    properties: { reportId: report.id, analysisId: report.analysisJobId, format: isCopy ? 'clipboard' : format },
  });

  if (isCopy) {
    return new NextResponse(createMarkdownExport(model), {
      headers: { 'content-type': 'text/plain; charset=utf-8' },
    });
  }
  if (format === 'pdf') {
    return new NextResponse(toResponseBody(await createPdfExport(model)), {
      headers: {
        'content-type': 'application/pdf',
        'content-disposition': `attachment; filename="${reportFilename(model, 'pdf')}"`,
      },
    });
  }
  if (format === 'docx') {
    return new NextResponse(toResponseBody(await createDocxExport(model)), {
      headers: {
        'content-type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'content-disposition': `attachment; filename="${reportFilename(model, 'docx')}"`,
      },
    });
  }
  return new NextResponse(createMarkdownExport(model), {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'content-disposition': `attachment; filename="${reportFilename(model, 'md')}"`,
    },
  });
}

function toResponseBody(bytes: Uint8Array): ArrayBuffer {
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}
