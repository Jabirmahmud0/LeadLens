import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth/session';
import {
  getCountryOptions,
  getTimeZoneOptions,
  normalizeCountryCode,
  normalizePrimaryService,
  normalizeTimeZone,
} from '@/lib/agency-profile-options';
import { AgencyDetailsForm, type AgencyDetailsFormValues } from './AgencyDetailsForm';

export const metadata = {
  title: 'Edit Agency Details | LeadLens',
};

export default async function AgencyDetailsPage({ searchParams }: { searchParams: Promise<{ saved?: string }> }) {
  const session = await getSession();
  if (!session?.organization) redirect('/login');

  const orgId = session.organization.id;
  const params = await searchParams;

  const [organization, profile] = await Promise.all([
    db.query.organizations.findFirst({ where: eq(schema.organizations.id, orgId) }),
    db.query.agencyProfiles.findFirst({ where: eq(schema.agencyProfiles.organizationId, orgId) }),
  ]);

  const initialValues: AgencyDetailsFormValues = {
    name: organization?.name ?? session.organization.name ?? '',
    website: organization?.websiteUrl ?? '',
    country: normalizeCountryCode(organization?.countryCode),
    timezone: normalizeTimeZone(organization?.timezone),
    description: profile?.shortDescription ?? '',
    teamSize: profile?.teamSizeRange ?? '2-5',
    primaryCategory: normalizePrimaryService(profile?.primaryCategory),
  };

  return (
    <AgencyDetailsForm
      initialValues={initialValues}
      countryOptions={getCountryOptions()}
      timeZoneOptions={getTimeZoneOptions()}
      saved={params.saved === '1'}
    />
  );
}
