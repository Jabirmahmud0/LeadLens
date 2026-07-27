import { describe, expect, it } from 'vitest';
import { createDocxExport, createMarkdownExport, createPdfExport, type ReportExportModel } from './exporters';

const report: ReportExportModel = {
  id: 'report-1',
  title: 'Intelligence Report: Acme Analytics',
  website: 'https://example.com',
  generatedAt: '2026-07-27T00:00:00.000Z',
  executiveSummary: 'Acme has a clear analytics offer.',
  opportunityThesis: 'Improve the path from product interest to a qualified conversation.',
  overallScore: 83,
  scoreLabel: 'High potential',
  recommendedAction: 'Schedule a focused discovery call.',
  limitations: 'Public sources only.',
  scores: [{ category: 'agencyServiceFit', score: 90 }],
  findings: [{
    title: 'Unclear conversion path',
    severity: 'high',
    confidence: 'High',
    observation: 'The primary call to action changes between pages.',
    businessImpact: 'Qualified visitors may leave.',
    recommendation: 'Use one clear conversion path.',
    sources: [{ title: 'Homepage', url: 'https://example.com', evidenceExcerpt: 'Get started today' }],
  }],
  outreach: [{ channel: 'email', body: 'A concise outreach message.' }],
  callQuestions: [{ question: 'How do you measure qualified demand?', notes: '', isChecked: false }],
  proposal: {
    problemStatement: 'Conversion intent is fragmented.',
    objectives: 'Clarify the journey.',
    scope: 'Messaging and conversion review.',
    phases: 'Discovery, delivery.',
    successMetrics: 'More qualified calls.',
    assumptions: 'Analytics access is available.',
    nextStep: 'Book discovery.',
  },
};

describe('report exporters', () => {
  it('builds a complete Markdown report', () => {
    const markdown = createMarkdownExport(report);
    expect(markdown).toContain('# Intelligence Report: Acme Analytics');
    expect(markdown).toContain('## Findings');
    expect(markdown).toContain('## Outreach');
  });

  it('builds a valid PDF payload', async () => {
    const bytes = await createPdfExport(report);
    expect(new TextDecoder().decode(bytes.slice(0, 4))).toBe('%PDF');
    expect(bytes.byteLength).toBeGreaterThan(1_000);
  });

  it('builds an editable DOCX payload', async () => {
    const bytes = await createDocxExport(report);
    expect(Array.from(bytes.slice(0, 2))).toEqual([0x50, 0x4b]);
    expect(bytes.byteLength).toBeGreaterThan(1_000);
  });
});
