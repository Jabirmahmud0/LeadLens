import * as React from 'react';
import { getSession } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { db, schema } from '@leadlens/database';
import { eq } from 'drizzle-orm';
import { Badge, SkeletonCard, EmptyState, cn } from '@leadlens/ui';
import { CheckCircle2, User, Building, MapPin, Globe, LayoutTemplate, Briefcase, FileText, Zap } from 'lucide-react';
import Link from 'next/link';

export const metadata = {
  title: 'Agency Profile | LeadLens',
};

export default async function SettingsPage() {
  const session = await getSession();
  if (!session || !session.organization) redirect('/login');
  
  const orgId = session.organization.id;

  const profile = await db.query.agencyProfiles.findFirst({
    where: eq(schema.agencyProfiles.organizationId, orgId)
  });

  const servicesCount = await db.select({ id: schema.agencyServices.id }).from(schema.agencyServices).where(eq(schema.agencyServices.organizationId, orgId));
  const caseStudiesCount = await db.select({ id: schema.caseStudies.id }).from(schema.caseStudies).where(eq(schema.caseStudies.organizationId, orgId));
  
  const icp = await db.query.idealCustomerProfiles.findFirst({
    where: eq(schema.idealCustomerProfiles.organizationId, orgId)
  });

  // Calculate setup completeness
  let completeness = 0;
  if (profile) completeness += 25;
  if (servicesCount.length > 0) completeness += 25;
  if (icp) completeness += 25;
  if (caseStudiesCount.length > 0) completeness += 25;

  return (
    <div className="space-y-8">
      {/* Dossier Header */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-start shadow-sm relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3" />
        
        <div className="w-20 h-20 rounded-2xl bg-neutral-950 border border-neutral-800 flex items-center justify-center shrink-0 shadow-inner z-10">
          <Building className="w-8 h-8 text-neutral-400" />
        </div>
        
        <div className="flex-1 min-w-0 z-10">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-2xl font-medium text-white truncate">{session.organization.name}</h2>
            <Badge variant="success">Active</Badge>
          </div>
          <p className="text-neutral-400 text-sm max-w-2xl leading-relaxed">
            {profile?.shortDescription || "No short description provided yet. Complete your profile to set this up."}
          </p>
          
          <div className="flex flex-wrap gap-4 mt-6">
            <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-lg">
              <User className="w-3.5 h-3.5" />
              {profile?.teamSizeRange || 'Unknown'} Team Size
            </div>
            {profile?.primaryCategory && (
              <div className="flex items-center gap-1.5 text-xs text-neutral-500 bg-neutral-950 border border-neutral-800 px-3 py-1.5 rounded-lg">
                <Briefcase className="w-3.5 h-3.5" />
                {profile.primaryCategory}
              </div>
            )}
          </div>
        </div>
        
        <div className="w-full md:w-64 bg-neutral-950/50 rounded-xl p-5 border border-neutral-800/50 z-10">
          <h3 className="text-sm font-medium text-white mb-3">Setup Completeness</h3>
          <div className="flex items-end gap-2 mb-2">
            <span className="text-2xl font-light text-white leading-none">{completeness}%</span>
          </div>
          <div className="h-1.5 w-full bg-neutral-900 rounded-full overflow-hidden border border-neutral-800">
            <div 
              className={cn("h-full transition-all duration-1000", completeness === 100 ? "bg-green-500" : "bg-blue-500")}
              style={{ width: `\${completeness}%` }}
            />
          </div>
          {completeness < 100 && (
            <Link href="/onboarding/identity" className="block text-xs text-blue-400 hover:text-blue-300 mt-3 font-medium transition-colors">
              Continue setup &rarr;
            </Link>
          )}
        </div>
      </div>
      
      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        
        {/* Output Preferences */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm hover:border-neutral-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 flex items-center justify-center">
              <LayoutTemplate className="w-4 h-4 text-purple-400" />
            </div>
            <h3 className="text-base font-medium text-white">Brand Voice</h3>
          </div>
          <p className="text-sm text-neutral-400 mb-4 h-10">
            {profile?.brandVoice ? `Your reports are generated with a \${profile.brandVoice} tone.` : 'Not configured yet.'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="neutral">{profile?.reportDepth || 'Standard'} Depth</Badge>
            <Badge variant="neutral">{profile?.outreachTone || 'Professional'} Outreach</Badge>
          </div>
        </div>

        {/* Services Snapshot */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm hover:border-neutral-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-blue-500/10 flex items-center justify-center">
              <Briefcase className="w-4 h-4 text-blue-400" />
            </div>
            <h3 className="text-base font-medium text-white">Service Offerings</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-light text-white">{servicesCount.length}</span>
            <span className="text-sm text-neutral-500">active services</span>
          </div>
          <p className="text-sm text-neutral-400 mb-6">Configured for AI matching.</p>
          <Link href="/settings/services" className="text-sm font-medium text-white hover:text-neutral-300 transition-colors">
            Manage Services &rarr;
          </Link>
        </div>

        {/* Proof Snapshot */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm hover:border-neutral-700 transition-colors">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center">
              <FileText className="w-4 h-4 text-green-400" />
            </div>
            <h3 className="text-base font-medium text-white">Case Studies</h3>
          </div>
          <div className="flex items-baseline gap-2 mb-2">
            <span className="text-3xl font-light text-white">{caseStudiesCount.length}</span>
            <span className="text-sm text-neutral-500">proof points</span>
          </div>
          <p className="text-sm text-neutral-400 mb-6">Available to cite in proposals.</p>
          <Link href="/settings/case-studies" className="text-sm font-medium text-white hover:text-neutral-300 transition-colors">
            Manage Library &rarr;
          </Link>
        </div>

      </div>
      
      {/* AI Understanding Preview */}
      <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="mt-1">
            <Zap className="w-5 h-5 text-yellow-400" />
          </div>
          <div>
            <h3 className="text-lg font-medium text-white mb-2">How LeadLens Understands You</h3>
            <p className="text-sm text-neutral-400 max-w-3xl leading-relaxed">
              Based on your configuration, the AI recognizes you as a 
              <span className="text-white font-medium mx-1">{profile?.primaryCategory || 'Digital Agency'}</span> 
              targeting <span className="text-white font-medium mx-1">{icp ? 'specific criteria' : 'broad audiences'}</span>. 
              When analyzing prospects, it will actively search for opportunities that match your <span className="text-white font-medium">{servicesCount.length}</span> defined services, prioritizing issues you have a proven track record of solving in your case studies.
            </p>
          </div>
        </div>
      </div>
      
    </div>
  );
}
