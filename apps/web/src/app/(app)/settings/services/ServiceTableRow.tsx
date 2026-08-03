'use client';
import { useRouter } from 'next/navigation';
import { Briefcase, CheckCircle2, XCircle } from 'lucide-react';
import { ServiceRowActions } from './ServiceRowActions';

type Props = {
  id: string;
  name: string;
  priceMinCents: number | null;
  summary: string | null;
  problemSolved: string | null;
  isActive: boolean | null;
};

export function ServiceTableRow({ id, name, priceMinCents, summary, problemSolved, isActive }: Props) {
  const router = useRouter();
  return (
    <tr
      className="hover:bg-neutral-800/30 transition-colors group cursor-pointer"
      onClick={() => router.push(`/settings/services/${id}`)}
    >
      <td className="py-4 px-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-neutral-800 flex items-center justify-center shrink-0">
            <Briefcase className="w-5 h-5 text-neutral-400 group-hover:text-blue-400 transition-colors" />
          </div>
          <div>
            <p className="text-sm font-medium text-white group-hover:text-blue-100 transition-colors">{name}</p>
            <p className="text-xs text-neutral-500 mt-0.5">{priceMinCents ? `$${(priceMinCents / 100).toLocaleString()}+` : 'Custom Pricing'}</p>
          </div>
        </div>
      </td>
      <td className="py-4 px-6">
        <p className="text-sm text-neutral-400 line-clamp-2 max-w-sm">
          {summary || problemSolved || 'No description provided.'}
        </p>
      </td>
      <td className="py-4 px-6">
        {isActive ? (
          <div className="flex items-center gap-1.5 text-xs text-green-500 font-medium">
            <CheckCircle2 className="w-4 h-4" /> Active
          </div>
        ) : (
          <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
            <XCircle className="w-4 h-4" /> Inactive
          </div>
        )}
      </td>
      <td className="py-4 px-6 text-right" onClick={(e) => e.stopPropagation()}>
        <ServiceRowActions id={id} name={name} />
      </td>
    </tr>
  );
}
