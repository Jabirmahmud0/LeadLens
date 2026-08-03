'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search, Filter } from 'lucide-react';
import { useRef } from 'react';

export function AnalysisFilters() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const q = searchParams.get('q') ?? '';
  const status = searchParams.get('status') ?? '';
  const sort = searchParams.get('sort') ?? 'newest';
  const inputRef = useRef<HTMLInputElement>(null);

  const apply = (overrides: Record<string, string>) => {
    const next = new URLSearchParams({ q, status, sort, ...overrides });
    // strip empty values
    for (const [k, v] of Array.from(next.entries())) {
      if (!v) next.delete(k);
    }
    router.push(`/analyses?${next.toString()}`);
  };

  return (
    <div className="flex flex-1 gap-2 sm:w-auto">
      <div className="relative flex-1 sm:w-64">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-4 w-4 text-neutral-500" />
        </div>
        <input
          ref={inputRef}
          type="text"
          defaultValue={q}
          onKeyDown={(e) => { if (e.key === 'Enter') apply({ q: e.currentTarget.value }); }}
          className="block h-10 w-full rounded-xl border border-[#d8e5dc] bg-white pl-10 pr-4 text-sm text-[#16352a] placeholder:text-[#8ca096] focus:border-emerald-600 focus:outline-none focus:ring-2 focus:ring-emerald-100"
          placeholder="Search activity..."
        />
      </div>
      <select
        value={status}
        onChange={(e) => apply({ status: e.target.value })}
        aria-label="Filter analyses by status"
        className="h-10 rounded-xl border border-[#d8e5dc] bg-white px-3 text-sm text-[#365246]"
      >
        <option value="">All statuses</option>
        <option value="queued">Queued</option>
        <option value="processing">Processing</option>
        <option value="completed">Completed</option>
        <option value="partial">Partial</option>
        <option value="failed">Failed</option>
        <option value="cancelled">Cancelled</option>
      </select>
      <select
        value={sort}
        onChange={(e) => apply({ sort: e.target.value })}
        aria-label="Sort analyses"
        className="h-10 rounded-xl border border-[#d8e5dc] bg-white px-3 text-sm text-[#365246]"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
      </select>
      <button
        type="button"
        onClick={() => apply({ q: inputRef.current?.value ?? q })}
        aria-label="Apply filters"
        className="grid size-10 place-items-center rounded-xl bg-emerald-700 text-white transition-colors hover:bg-emerald-800"
      >
        <Filter className="w-4 h-4" />
      </button>
    </div>
  );
}
