import { and, eq } from 'drizzle-orm';
import { db } from '../client';
import { organizationMembers, organizations } from '../schema/org';

export const getOrganizationForMember = (organizationId: string, userId: string) => db.select({ organization: organizations, role: organizationMembers.role }).from(organizationMembers).innerJoin(organizations, eq(organizationMembers.organizationId, organizations.id)).where(and(eq(organizationMembers.organizationId, organizationId), eq(organizationMembers.userId, userId))).limit(1);
