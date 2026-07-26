import { and, eq } from 'drizzle-orm';
import { db } from '../client';
import { prospects } from '../schema/prospect';

export const getProspectForOrganization = (id: string, organizationId: string) => db.query.prospects.findFirst({ where: and(eq(prospects.id, id), eq(prospects.organizationId, organizationId)) });
export const archiveProspectForOrganization = (id: string, organizationId: string) => db.update(prospects).set({ archivedAt: new Date(), status: 'archived', updatedAt: new Date() }).where(and(eq(prospects.id, id), eq(prospects.organizationId, organizationId)));
