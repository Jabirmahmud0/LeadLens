export function LegalPage({ title, updated = 'July 26, 2026', children }: { title: string; updated?: string; children: React.ReactNode }) {
  return <article className="mx-auto max-w-3xl px-6 py-20 text-neutral-300">
    <p className="text-sm text-blue-400">LeadLens Trust Center</p>
    <h1 className="mt-3 text-4xl font-light text-white">{title}</h1>
    <p className="mt-3 text-sm text-neutral-500">Last updated {updated}</p>
    <div className="mt-10 space-y-8 leading-7 [&_h2]:text-xl [&_h2]:font-medium [&_h2]:text-white [&_p]:text-neutral-300 [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-6">{children}</div>
  </article>;
}
