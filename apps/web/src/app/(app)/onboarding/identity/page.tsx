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
import { IdentityForm, type IdentityFormValues } from './IdentityForm';

export const metadata = {
  title: 'Agency Identity | LeadLens',
};

export default async function IdentityStep() {
  const session = await getSession();
  if (!session?.organization) redirect('/login');

  const organizationId = session.organization.id;
  const [organization, profile] = await Promise.all([
    db.query.organizations.findFirst({ where: eq(schema.organizations.id, organizationId) }),
    db.query.agencyProfiles.findFirst({ where: eq(schema.agencyProfiles.organizationId, organizationId) }),
  ]);

  const initialValues: IdentityFormValues = {
    name: organization?.name ?? session.organization.name ?? '',
    website: organization?.websiteUrl ?? '',
    country: normalizeCountryCode(organization?.countryCode),
    timezone: normalizeTimeZone(organization?.timezone),
    description: profile?.shortDescription ?? '',
    teamSize: profile?.teamSizeRange ?? '2-5',
    primaryCategory: normalizePrimaryService(profile?.primaryCategory),
  };

  return (
    <IdentityForm
      initialValues={initialValues}
      countryOptions={getCountryOptions()}
      timeZoneOptions={getTimeZoneOptions()}
    />
  );
}
