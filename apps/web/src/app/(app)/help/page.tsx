const topics = [
  ['Getting started', 'Complete agency identity, add at least one active service, configure your ICP, then submit a public prospect URL.'],
  ['Improving reports', 'Add concrete service deliverables, price bands, disqualifiers, and measurable case-study results.'],
  ['Understanding scores', 'Scores combine agency fit, visible problem severity, business maturity, likely value, evidence quality, and outreach readiness.'],
  ['Troubleshooting analysis', 'Open the processing timeline for failed steps. Retry preserves completed evidence and reruns only failed or skipped work.'],
  ['Privacy and data', 'Only submit context you are authorized to use. Export or delete workspace data from Account → Security.'],
];
export const metadata = { title: 'Help | LeadLens' };
export default function HelpPage() { return <main className="mx-auto max-w-4xl p-6 lg:p-10"><h1 className="text-3xl font-light text-white">Help center</h1><p className="mt-2 text-neutral-400">Practical guidance for trustworthy prospect research.</p><div className="mt-8 grid gap-4 sm:grid-cols-2">{topics.map(([title, body]) => <section key={title} className="rounded-2xl border border-neutral-800 bg-neutral-900 p-5"><h2 className="font-medium text-white">{title}</h2><p className="mt-2 text-sm leading-6 text-neutral-400">{body}</p></section>)}</div></main>; }
