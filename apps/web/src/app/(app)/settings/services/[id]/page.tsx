import { db, schema } from '@leadlens/database';
import { eq, and } from 'drizzle-orm';
import { redirect, notFound } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import { ServiceEditForm } from './ServiceEditForm';

export const metadata = {
  title: 'Edit Service | LeadLens',
};

export default async function ServiceEditPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session?.organization) redirect('/login');

  const { id } = await params;

  const service = await db.query.agencyServices.findFirst({
    where: and(
      eq(schema.agencyServices.id, id),
      eq(schema.agencyServices.organizationId, session.organization.id)
    ),
  });

  if (!service) notFound();

  return (
    <ServiceEditForm
      initial={{
        id: service.id,
        name: service.name,
        summary: service.summary ?? '',
        problemSolved: service.problemSolved ?? undefined,
        deliverables: (service.deliverables as string[]) ?? [],
        priceMin: service.priceMinCents ? service.priceMinCents / 100 : undefined,
        priceMax: service.priceMaxCents ? service.priceMaxCents / 100 : undefined,
        isActive: service.isActive ?? true,
      }}
    />
  );
}
