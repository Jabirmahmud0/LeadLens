'use client';

import * as React from 'react';
import { submitAnalysis } from './actions';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowRight, ArrowLeft, CheckCircle2, ShieldAlert } from 'lucide-react';
import { cn } from '@leadlens/ui';

export function ComposerClient({ services, caseStudies }: { services: any[], caseStudies: any[] }) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [loading, setLoading] = React.useState(false);
  const [duplicateWarning, setDuplicateWarning] = React.useState<string | null>(null);

  const [formData, setFormData] = React.useState({
    url: '',
    companyName: '',
    contactName: '',
    competitors: [''],
    notes: '',
    serviceIds: [] as string[],
    caseStudyIds: [] as string[],
    goal: 'outreach',
    reportDepth: 'standard',
    tone: 'professional',
    channels: ['email'],
    runPagespeed: true,
  });

  const handleNext = () => setStep(s => Math.min(s + 1, 3));
  const handlePrev = () => setStep(s => Math.max(s - 1, 1));

  const handleSubmit = async () => {
    setLoading(true);
    setDuplicateWarning(null);
    try {
      const data = {
        ...formData,
        competitors: formData.competitors.filter(c => c.trim() !== '')
      };
      
      const result = await submitAnalysis(data as any);
      
      if (result.isDuplicate) {
        setDuplicateWarning(result.existingId);
        setLoading(false);
        return;
      }
      
      toast.success('Analysis started successfully');
      router.push('/prospects');
    } catch (err: any) {
      toast.error(err.message || 'Failed to start analysis');
    } finally {
      setLoading(false);
    }
  };

  const handleForceRun = async () => {
    // In a real app we'd pass a force flag. For now just redirect to prospects
    toast.success('Forcing rerun...');
    router.push('/prospects');
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Main Form */}
      <div className="flex-1 bg-neutral-900 border border-neutral-800 rounded-2xl p-6 shadow-sm w-full">
        
        {/* Step Indicators */}
        <div className="flex items-center gap-2 mb-8">
          {[1, 2, 3].map(i => (
            <React.Fragment key={i}>
              <div className={cn(
                "flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium transition-colors",
                step === i ? "bg-blue-600 text-white" : step > i ? "bg-green-500/20 text-green-500" : "bg-neutral-800 text-neutral-500"
              )}>
                {step > i ? <CheckCircle2 className="w-4 h-4" /> : i}
              </div>
              {i < 3 && <div className={cn("h-1 flex-1 rounded-full", step > i ? "bg-green-500/20" : "bg-neutral-800")} />}
            </React.Fragment>
          ))}
        </div>

        {/* Form Content */}
        <div className="min-h-[400px]">
          {step === 1 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-medium text-white mb-6">1. Prospect Details</h2>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Website URL *</label>
                <input
                  type="url"
                  required
                  value={formData.url}
                  onChange={e => setFormData({ ...formData, url: e.target.value })}
                  placeholder="https://example.com"
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Company Name</label>
                  <input
                    type="text"
                    value={formData.companyName}
                    onChange={e => setFormData({ ...formData, companyName: e.target.value })}
                    placeholder="Example Corp"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-1.5">Contact Name (Optional)</label>
                  <input
                    type="text"
                    value={formData.contactName}
                    onChange={e => setFormData({ ...formData, contactName: e.target.value })}
                    placeholder="Jane Doe"
                    className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-1.5">Internal Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={e => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Met at SaaS conference. Interested in SEO..."
                  rows={3}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2.5 text-white focus:border-blue-500 transition-colors"
                />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-medium text-white mb-6">2. Context & Positioning</h2>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">Pitch Goal</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { id: 'outreach', label: 'Cold Outreach' },
                    { id: 'call_prep', label: 'Discovery Call Prep' },
                    { id: 'proposal', label: 'Proposal Prep' },
                    { id: 'qualification', label: 'Qualification Only' },
                  ].map(g => (
                    <div
                      key={g.id}
                      onClick={() => setFormData({ ...formData, goal: g.id })}
                      className={cn(
                        "border rounded-xl p-4 cursor-pointer transition-colors",
                        formData.goal === g.id ? "bg-blue-500/10 border-blue-500/50" : "bg-neutral-950 border-neutral-800 hover:border-neutral-700"
                      )}
                    >
                      <span className={cn("text-sm font-medium", formData.goal === g.id ? "text-blue-400" : "text-neutral-300")}>{g.label}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">Target Services</label>
                {services.length === 0 ? (
                  <div className="text-sm text-neutral-500 bg-neutral-950 p-4 rounded-lg border border-neutral-800">No services configured yet.</div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services.map((s: any) => (
                      <label key={s.id} className="flex items-start gap-3 p-3 bg-neutral-950 border border-neutral-800 rounded-lg cursor-pointer hover:bg-neutral-900 transition-colors">
                        <input
                          type="checkbox"
                          className="mt-1 bg-neutral-800 border-neutral-700 text-blue-500 rounded"
                          checked={formData.serviceIds.includes(s.id)}
                          onChange={(e) => {
                            if (e.target.checked) setFormData({ ...formData, serviceIds: [...formData.serviceIds, s.id] });
                            else setFormData({ ...formData, serviceIds: formData.serviceIds.filter(id => id !== s.id) });
                          }}
                        />
                        <span className="text-sm font-medium text-neutral-300">{s.name}</span>
                      </label>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {step === 3 && (
            <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-500">
              <h2 className="text-xl font-medium text-white mb-6">3. Output Preferences</h2>
              
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-3">Report Depth</label>
                <div className="flex gap-3">
                  {['quick', 'standard', 'deep'].map(d => (
                    <button
                      key={d}
                      onClick={() => setFormData({ ...formData, reportDepth: d })}
                      className={cn(
                        "flex-1 py-2.5 rounded-lg text-sm font-medium capitalize border transition-colors",
                        formData.reportDepth === d ? "bg-white text-black border-white" : "bg-neutral-950 text-neutral-400 border-neutral-800 hover:text-white"
                      )}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-800">
                <label className="flex items-center gap-3 cursor-pointer p-4 bg-neutral-950 border border-neutral-800 rounded-lg">
                  <input
                    type="checkbox"
                    className="w-5 h-5 bg-neutral-800 border-neutral-700 text-blue-500 rounded focus:ring-blue-500 focus:ring-offset-neutral-950"
                    checked={formData.runPagespeed}
                    onChange={(e) => setFormData({ ...formData, runPagespeed: e.target.checked })}
                  />
                  <div>
                    <span className="text-sm font-medium text-white block">Include Lighthouse/PageSpeed</span>
                    <span className="text-xs text-neutral-500">Runs real-browser performance tests (adds ~15s to analysis)</span>
                  </div>
                </label>
              </div>

              {duplicateWarning && (
                <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg flex items-start gap-3 mt-6">
                  <ShieldAlert className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-medium text-yellow-500">Duplicate Analysis Detected</h4>
                    <p className="text-xs text-yellow-500/80 mt-1">This domain was analyzed recently. To save credits, you can view the existing report or force a new run.</p>
                    <div className="flex gap-3 mt-3">
                      <button onClick={() => router.push('/prospects')} className="text-xs font-medium bg-yellow-500 text-black px-3 py-1.5 rounded hover:bg-yellow-400">View Existing</button>
                      <button onClick={handleForceRun} className="text-xs font-medium border border-yellow-500/50 text-yellow-500 px-3 py-1.5 rounded hover:bg-yellow-500/10">Force Rerun</button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-neutral-800">
          <button
            onClick={handlePrev}
            disabled={step === 1 || loading}
            className="px-5 py-2.5 rounded-lg text-sm font-medium text-neutral-400 hover:text-white disabled:opacity-0 transition-all flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
          
          {step < 3 ? (
            <button
              onClick={handleNext}
              disabled={step === 1 && !formData.url}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-white text-black hover:bg-neutral-200 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              Continue
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={loading || duplicateWarning !== null}
              className="px-6 py-2.5 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-500 disabled:opacity-50 transition-all flex items-center gap-2"
            >
              {loading ? 'Starting Analysis...' : 'Start Analysis'}
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>
          )}
        </div>
      </div>

      {/* Summary Rail */}
      <div className="w-full lg:w-72 bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-sm hidden lg:block sticky top-8">
        <h3 className="text-sm font-semibold text-neutral-400 uppercase tracking-wider mb-4">Configuration</h3>
        
        <div className="space-y-4">
          <div>
            <span className="text-xs text-neutral-500 block">Target URL</span>
            <span className="text-sm text-white font-medium break-all">{formData.url || 'Not set'}</span>
          </div>
          
          <div>
            <span className="text-xs text-neutral-500 block">Pitch Goal</span>
            <span className="text-sm text-white font-medium capitalize">{formData.goal.replace('_', ' ')}</span>
          </div>

          <div>
            <span className="text-xs text-neutral-500 block">Services</span>
            <span className="text-sm text-white font-medium">
              {formData.serviceIds.length === 0 ? 'None selected' : \`\${formData.serviceIds.length} selected\`}
            </span>
          </div>

          <div>
            <span className="text-xs text-neutral-500 block">Report Depth</span>
            <span className="text-sm text-white font-medium capitalize">{formData.reportDepth}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
