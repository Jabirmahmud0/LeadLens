import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  TextRun,
} from 'docx';
import { PDFDocument, PDFFont, PDFPage, StandardFonts, rgb } from 'pdf-lib';

export interface ReportExportModel {
  id: string;
  title: string;
  website: string;
  generatedAt: string;
  executiveSummary: string;
  opportunityThesis: string;
  overallScore: number | null;
  scoreLabel: string;
  recommendedAction: string;
  limitations: string;
  scores: Array<{ category: string; score: number | null }>;
  findings: Array<{
    title: string;
    severity: string;
    confidence: string;
    observation: string;
    businessImpact: string;
    recommendation: string;
    sources: Array<{ title: string; url: string; evidenceExcerpt: string }>;
  }>;
  outreach: Array<{ channel: string; body: string }>;
  callQuestions: Array<{ question: string; notes: string; isChecked: boolean }>;
  proposal?: {
    problemStatement: string;
    objectives: string;
    scope: string;
    phases: string;
    successMetrics: string;
    assumptions: string;
    nextStep: string;
  };
}

export function reportFilename(report: ReportExportModel, extension: string) {
  const base = report.title
    .replace(/^Intelligence Report:\s*/i, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60) || report.id;
  return `leadlens-${base}.${extension}`;
}

export function createMarkdownExport(report: ReportExportModel): string {
  const scores = report.scores.map((score) => `- ${humanize(score.category)}: ${score.score ?? 'N/A'}/100`).join('\n');
  const findings = report.findings.map((finding) => {
    const sources = finding.sources.map((source) =>
      `  - [${source.title || source.url}](${source.url})${source.evidenceExcerpt ? ` — ${source.evidenceExcerpt}` : ''}`
    ).join('\n');
    return `### ${finding.title}\n\n- Severity: ${finding.severity || 'unknown'}\n- Confidence: ${finding.confidence || 'unknown'}\n\n${finding.observation}\n\n**Business impact:** ${finding.businessImpact || 'Not established'}\n\n**Recommendation:** ${finding.recommendation || 'Further validation required'}${sources ? `\n\nSources:\n${sources}` : ''}`;
  }).join('\n\n');
  const outreach = report.outreach.map((item) => `### ${humanize(item.channel || 'Message')}\n\n${item.body}`).join('\n\n');
  const questions = report.callQuestions.map((question) => `- [${question.isChecked ? 'x' : ' '}] ${question.question}${question.notes ? ` — Notes: ${question.notes}` : ''}`).join('\n');
  const proposal = report.proposal;

  return `# ${report.title}\n\n` +
    `Website: ${report.website}\n\nGenerated: ${formatDate(report.generatedAt)}\n\n` +
    `> Decision-support report based on visible public information and configured agency preferences. Verify material claims before outreach.\n` +
    markdownSection('Executive summary', report.executiveSummary) +
    markdownSection('Opportunity thesis', report.opportunityThesis) +
    markdownSection('Recommended next step', report.recommendedAction) +
    markdownSection('Score breakdown', scores) +
    markdownSection('Findings', findings) +
    markdownSection('Outreach', outreach) +
    markdownSection('Discovery-call questions', questions) +
    markdownSection('Proposal starter', proposal ? `${proposal.problemStatement}\n\n### Objectives\n${proposal.objectives}\n\n### Scope\n${proposal.scope}\n\n### Phases\n${proposal.phases}\n\n### Success metrics\n${proposal.successMetrics}\n\n### Assumptions\n${proposal.assumptions}\n\n### Next step\n${proposal.nextStep}` : '') +
    markdownSection('Limitations', report.limitations);
}

export async function createDocxExport(report: ReportExportModel): Promise<Uint8Array> {
  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 160 },
      children: [new TextRun({ text: 'LEADLENS  /  INTELLIGENCE REPORT', bold: true, color: '147A4B', size: 19, characterSpacing: 80 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 120 },
      children: [new TextRun({ text: report.title, bold: true, color: '10251D', size: 38 })],
    }),
    new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { after: 420 },
      children: [new TextRun({ text: `${report.website}  •  ${formatDate(report.generatedAt)}`, color: '60766B', size: 20 })],
    }),
  ];

  pushDocxSection(children, 'Opportunity thesis', [report.opportunityThesis]);
  pushDocxSection(children, 'Executive summary', [report.executiveSummary]);
  pushDocxSection(children, 'Recommended next step', [report.recommendedAction]);
  pushDocxSection(children, 'Score breakdown', [
    `Overall: ${report.overallScore ?? 'N/A'}/100 — ${report.scoreLabel}`,
    ...report.scores.map((score) => `${humanize(score.category)}: ${score.score ?? 'N/A'}/100`),
  ], true);

  if (report.findings.length) {
    children.push(docxHeading('Findings'));
    for (const finding of report.findings) {
      children.push(docxHeading(finding.title, HeadingLevel.HEADING_2));
      children.push(docxParagraph(`${humanize(finding.severity)} severity • ${humanize(finding.confidence)} confidence`, true));
      children.push(docxParagraph(finding.observation));
      children.push(docxParagraph(`Business impact: ${finding.businessImpact || 'Not established'}`));
      children.push(docxParagraph(`Recommendation: ${finding.recommendation || 'Further validation required'}`));
      for (const source of finding.sources) children.push(docxBullet(`Source: ${source.title || source.url} — ${source.url}${source.evidenceExcerpt ? ` — ${source.evidenceExcerpt}` : ''}`));
    }
  }

  if (report.outreach.length) {
    children.push(docxHeading('Outreach'));
    for (const item of report.outreach) {
      children.push(docxHeading(humanize(item.channel || 'Message'), HeadingLevel.HEADING_2));
      children.push(docxParagraph(item.body));
    }
  }

  if (report.callQuestions.length) {
    children.push(docxHeading('Discovery-call questions'));
    for (const question of report.callQuestions) children.push(docxBullet(`${question.question}${question.notes ? ` — Notes: ${question.notes}` : ''}`));
  }

  if (report.proposal) {
    const proposal = report.proposal;
    pushDocxSection(children, 'Proposal starter', [proposal.problemStatement]);
    pushDocxSection(children, 'Objectives', [proposal.objectives]);
    pushDocxSection(children, 'Scope', [proposal.scope]);
    pushDocxSection(children, 'Phases', [proposal.phases]);
    pushDocxSection(children, 'Success metrics', [proposal.successMetrics]);
    pushDocxSection(children, 'Assumptions', [proposal.assumptions]);
    pushDocxSection(children, 'Proposal next step', [proposal.nextStep]);
  }
  pushDocxSection(children, 'Limitations', [report.limitations]);

  const document = new Document({
    creator: 'LeadLens',
    title: report.title,
    description: 'LeadLens intelligence report',
    sections: [{
      properties: { page: { margin: { top: 900, right: 900, bottom: 900, left: 900 } } },
      children,
    }],
  });
  return new Uint8Array(await Packer.toBuffer(document));
}

export async function createPdfExport(report: ReportExportModel): Promise<Uint8Array> {
  const pdf = await PDFDocument.create();
  pdf.setTitle(report.title);
  pdf.setAuthor('LeadLens');
  pdf.setSubject('Lead intelligence and opportunity report');
  const regular = await pdf.embedFont(StandardFonts.Helvetica);
  const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
  const pageWidth = 595.28;
  const pageHeight = 841.89;
  const margin = 52;
  const contentWidth = pageWidth - margin * 2;
  let page: PDFPage;
  let y = 0;

  const addPage = () => {
    page = pdf.addPage([pageWidth, pageHeight]);
    y = pageHeight - 54;
    page.drawText('LEADLENS', { x: margin, y, size: 9, font: bold, color: rgb(0.08, 0.47, 0.29) });
    page.drawText('INTELLIGENCE REPORT', { x: margin + 64, y, size: 8, font: regular, color: rgb(0.38, 0.46, 0.42) });
    y -= 30;
  };
  const ensureSpace = (height: number) => {
    if (y - height < 54) addPage();
  };
  const write = (text: string, options: { size?: number; font?: PDFFont; color?: ReturnType<typeof rgb>; gapAfter?: number; indent?: number } = {}) => {
    const size = options.size ?? 10;
    const font = options.font ?? regular;
    const lineHeight = size * 1.45;
    const indent = options.indent ?? 0;
    const lines = wrapPdfText(toPdfText(text), font, size, contentWidth - indent);
    for (const line of lines) {
      ensureSpace(lineHeight);
      page.drawText(line, { x: margin + indent, y, size, font, color: options.color ?? rgb(0.12, 0.19, 0.16) });
      y -= lineHeight;
    }
    y -= options.gapAfter ?? 7;
  };
  const heading = (title: string) => {
    ensureSpace(36);
    y -= 10;
    page.drawLine({ start: { x: margin, y: y + 15 }, end: { x: margin + contentWidth, y: y + 15 }, thickness: 0.7, color: rgb(0.84, 0.9, 0.86) });
    write(title.toUpperCase(), { size: 9, font: bold, color: rgb(0.08, 0.47, 0.29), gapAfter: 10 });
  };

  addPage();
  write(report.title, { size: 23, font: bold, color: rgb(0.06, 0.15, 0.11), gapAfter: 8 });
  write(`${report.website}  |  ${formatDate(report.generatedAt)}`, { size: 9, color: rgb(0.38, 0.46, 0.42), gapAfter: 22 });
  write(`OVERALL FIT  ${report.overallScore ?? 'N/A'}/100  |  ${report.scoreLabel}`, { size: 11, font: bold, color: rgb(0.08, 0.47, 0.29), gapAfter: 18 });

  heading('Opportunity thesis');
  write(report.opportunityThesis, { size: 13, font: bold, gapAfter: 12 });
  heading('Executive summary');
  write(report.executiveSummary);
  heading('Recommended next step');
  write(report.recommendedAction);
  heading('Score breakdown');
  for (const score of report.scores) write(`• ${humanize(score.category)}: ${score.score ?? 'N/A'}/100`, { gapAfter: 2, indent: 8 });

  if (report.findings.length) {
    heading('Findings');
    for (const finding of report.findings) {
      write(finding.title, { size: 12, font: bold, gapAfter: 2 });
      write(`${humanize(finding.severity)} severity | ${humanize(finding.confidence)} confidence`, { size: 8, color: rgb(0.38, 0.46, 0.42), gapAfter: 5 });
      write(finding.observation, { gapAfter: 3 });
      write(`Business impact: ${finding.businessImpact || 'Not established'}`, { size: 9, gapAfter: 3 });
      write(`Recommendation: ${finding.recommendation || 'Further validation required'}`, { size: 9, gapAfter: 4 });
      for (const source of finding.sources) write(`Source: ${source.title || source.url} — ${source.url}`, { size: 8, color: rgb(0.38, 0.46, 0.42), gapAfter: 2, indent: 8 });
      y -= 6;
    }
  }

  if (report.outreach.length) {
    heading('Outreach');
    for (const item of report.outreach) {
      write(humanize(item.channel || 'Message'), { size: 12, font: bold, gapAfter: 4 });
      write(item.body);
    }
  }

  if (report.callQuestions.length) {
    heading('Discovery-call questions');
    for (const question of report.callQuestions) write(`• ${question.question}${question.notes ? ` — Notes: ${question.notes}` : ''}`, { gapAfter: 3, indent: 8 });
  }

  if (report.proposal) {
    heading('Proposal starter');
    write(report.proposal.problemStatement);
    for (const [title, value] of [
      ['Objectives', report.proposal.objectives],
      ['Scope', report.proposal.scope],
      ['Phases', report.proposal.phases],
      ['Success metrics', report.proposal.successMetrics],
      ['Assumptions', report.proposal.assumptions],
      ['Next step', report.proposal.nextStep],
    ]) {
      if (value) {
        write(title, { size: 11, font: bold, gapAfter: 3 });
        write(value);
      }
    }
  }
  if (report.limitations) {
    heading('Limitations');
    write(report.limitations);
  }

  const pages = pdf.getPages();
  pages.forEach((pdfPage, index) => {
    pdfPage.drawText(`LeadLens  •  ${index + 1} / ${pages.length}`, { x: margin, y: 28, size: 8, font: regular, color: rgb(0.45, 0.52, 0.48) });
  });
  return pdf.save();
}

function markdownSection(title: string, body?: string | null) {
  return body?.trim() ? `\n## ${title}\n\n${body.trim()}\n` : '';
}

function humanize(value: string) {
  return value.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/[_-]+/g, ' ').replace(/^./, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' }).format(new Date(value));
}

function docxHeading(text: string, heading: (typeof HeadingLevel)[keyof typeof HeadingLevel] = HeadingLevel.HEADING_1) {
  return new Paragraph({ text, heading, spacing: { before: 260, after: 120 } });
}

function docxParagraph(text: string, muted = false) {
  return new Paragraph({
    spacing: { after: 140, line: 320 },
    children: [new TextRun({ text: text || 'Not available', color: muted ? '60766B' : '263A32', size: muted ? 19 : 21 })],
  });
}

function docxBullet(text: string) {
  return new Paragraph({ text, bullet: { level: 0 }, spacing: { after: 90 } });
}

function pushDocxSection(children: Paragraph[], title: string, values: string[], bullets = false) {
  const present = values.filter((value) => value?.trim());
  if (!present.length) return;
  children.push(docxHeading(title));
  for (const value of present) children.push(bullets ? docxBullet(value) : docxParagraph(value));
}

function toPdfText(value: string) {
  return (value || 'Not available')
    .replace(/[—–]/g, '-')
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/•/g, '-')
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E\n]/g, '');
}

function wrapPdfText(text: string, font: PDFFont, size: number, maxWidth: number) {
  const output: string[] = [];
  for (const paragraph of text.split(/\r?\n/)) {
    if (!paragraph.trim()) {
      output.push('');
      continue;
    }
    let line = '';
    for (const word of paragraph.trim().split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (font.widthOfTextAtSize(candidate, size) <= maxWidth) {
        line = candidate;
      } else {
        if (line) output.push(line);
        line = word;
      }
    }
    if (line) output.push(line);
  }
  return output.length ? output : [''];
}
