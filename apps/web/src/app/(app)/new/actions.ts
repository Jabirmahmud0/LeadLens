'use server';

import { getSession } from '@/lib/auth/session';
import { db, schema } from '@leadlens/database';
import { validateAndNormalizeUrl } from '@leadlens/analysis';
import { eq, and, gt } from 'drizzle-orm';
import { z } from 'zod';

const ComposerSchema = z.object({
  url: z.string().url(),
  companyName: z.string().optional(),
  contactName: z.string().optional(),
  competitors: z.array(z.string().url()).optional(),
  notes: z.string().optional(),
  serviceIds: z.array(z.string()).min(1, 'Select at least one service'),
  caseStudyIds: z.array(z.string()).optional(),
  goal: z.enum(['outreach', 'call_prep', 'proposal', 'qualification']),
  reportDepth: z.enum(['quick', 'standard', 'deep']),
  tone: z.enum(['professional', 'aggressive', 'consultative']),
  channels: z.array(z.string()),
  runPagespeed: z.boolean(),
});

export async function submitAnalysis(data: z.infer<typeof ComposerSchema>) {
  const session = await getSession();
  if (!session || !session.organization) {
    throw new Error('Unauthorized');
  }

  const parsed = ComposerSchema.safeParse(data);
  if (!parsed.success) {
    throw new Error('Invalid form data');
  }

  const { url, ...rest } = parsed.data;

  // 1. Validate and normalize URL (SSRF protection)
  let normalizedUrl: string;
  try {
    normalizedUrl = await validateAndNormalizeUrl(url);
  } catch (err: unknown) {
    throw new Error(err instanceof Error ? err.message : 'Invalid URL');
  }

  // 2. Duplicate Check
  // Check if this domain has been analyzed by this org in the last 24 hours
  try {
    const domain = new URL(normalizedUrl).hostname;
    
    // Quick duplicate check (we use a simple where clause for MVP)
    const recentProspects = await db.query.prospects.findMany({
      where: and(
        eq(schema.prospects.organizationId, session.organization.id),
        eq(schema.prospects.domain, domain)
      ),
      orderBy: (p, { desc }) => [desc(p.createdAt)],
      limit: 1
    });

    if (recentProspects.length > 0) {
      const lastAnalyzed = new Date(recentProspects[0].createdAt);
      const hoursSince = (Date.now() - lastAnalyzed.getTime()) / (1000 * 60 * 60);
      
      if (hoursSince < 24) {
        // Return a special error indicating duplicate to allow user to confirm rerun
        return { isDuplicate: true, existingId: recentProspects[0].id };
      }
    }
  } catch (e) {
    // If URL parsing fails here, it's invalid anyway
  }

  // 3. Insert Prospect
  const [prospect] = await db.insert(schema.prospects).values({
    organizationId: session.organization.id,
    domain: new URL(normalizedUrl).hostname,
    companyName: rest.companyName || new URL(normalizedUrl).hostname,
    status: 'queued', // Mark as queued to wait for worker
  }).returning();

  // 4. Create Analysis Job
  await db.insert(schema.analysisJobs).values({
    organizationId: session.organization.id,
    prospectId: prospect.id,
    createdBy: session.user.id,
    status: 'queued',
    requestedOptions: rest,
  });

  // Return success
  return { success: true, prospectId: prospect.id };
}
