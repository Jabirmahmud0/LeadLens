'use client';

import { useState, useMemo, useEffect } from 'react';
import { Badge, SourceChip } from '@leadlens/ui';
import { TrendingUp, ShieldAlert, AlertTriangle, AlertCircle, Info, FileText, ChevronLeft } from 'lucide-react';
import { FindingControls } from './FindingControls';

// We'll extract the finding type implicitly or just use any for now since it's passed from server
type Finding = any;

interface FindingsConsoleProps {
  findings: Finding[];
}

export function FindingsConsole({ findings }: FindingsConsoleProps) {
  // Group findings by category
  const groupedFindings = useMemo(() => {
    const groups: Record<string, Finding[]> = {};
    findings.filter(f => !f.isHidden).forEach(finding => {
      const cat = finding.category || 'General';
      if (!groups[cat]) {
        groups[cat] = [];
      }
      groups[cat].push(finding);
    });
    return groups;
  }, [findings]);

  // Default to the first finding in the first category
  const firstFinding = useMemo(() => {
    const firstCategory = Object.keys(groupedFindings)[0];
    return firstCategory ? groupedFindings[firstCategory][0] : null;
  }, [groupedFindings]);

  const [selectedFindingId, setSelectedFindingId] = useState<string | null>(firstFinding?.id || null);
  const [showMobileList, setShowMobileList] = useState(true);

  // If a finding was already selected, and we resize down, we probably want to stay on the list view initially unless they explicitly clicked it.
  // We'll just manage state normally. 

  const selectedFinding = useMemo(() => {
    if (!selectedFindingId) return null;
    return findings.find(f => f.id === selectedFindingId) || null;
  }, [findings, selectedFindingId]);

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <AlertTriangle className="size-4 text-rose-500" />;
      case 'warning': return <AlertCircle className="size-4 text-amber-500" />;
      case 'info':
      default: return <Info className="size-4 text-emerald-500" />;
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-rose-500';
      case 'warning': return 'bg-amber-500';
      case 'info':
      default: return 'bg-emerald-500';
    }
  };

  if (!findings || findings.length === 0) {
    return (
      <div className="flex h-64 items-center justify-center rounded-2xl border border-dashed border-[#d8e5db] bg-white">
        <p className="text-[#60766b] not-italic">No findings available.</p>
      </div>
    );
  }

  return (
    <div className="mx-auto flex h-[calc(100vh-12rem)] md:h-[calc(100vh-14rem)] min-h-[600px] max-w-[1600px] gap-6 overflow-hidden not-italic">
      
      {/* Left Pane: Master List */}
      <div className={`w-full md:w-[320px] lg:w-[420px] shrink-0 flex-col overflow-hidden rounded-[1.5rem] border border-[#d8e5db]/80 bg-white/60 shadow-[0_4px_24px_rgba(31,67,46,0.02)] backdrop-blur-xl ${showMobileList ? 'flex' : 'hidden md:flex'}`}>
        <div className="border-b border-[#d8e5db]/60 bg-white/40 px-5 py-4 shrink-0">
          <h2 className="text-lg font-semibold tracking-[-0.02em] text-[#16352a]">
            Audit Findings
          </h2>
          <p className="text-[13px] text-[#60766b] mt-1">Select an issue to view details</p>
        </div>
        
        <div className="flex-1 overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-[#c8ddcd] scrollbar-track-transparent">
          <div className="space-y-6 pb-6">
            {Object.entries(groupedFindings).map(([category, categoryFindings]) => (
              <div key={category} className="space-y-2">
                <h3 className="px-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#71877b]">
                  {category} <span className="ml-1 opacity-60">({categoryFindings.length})</span>
                </h3>
                <ul className="space-y-1">
                  {categoryFindings.map(finding => {
                    const isSelected = selectedFindingId === finding.id;
                    return (
                      <li key={finding.id}>
                        <button
                          onClick={() => {
                            setSelectedFindingId(finding.id);
                            setShowMobileList(false);
                          }}
                          className={`group flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition-all duration-200 ${
                            isSelected 
                              ? 'bg-emerald-50/80 shadow-sm ring-1 ring-emerald-200/50' 
                              : 'hover:bg-[#f4f8f3]/60'
                          }`}
                        >
                          <div className="mt-0.5 shrink-0">
                            {getSeverityIcon(finding.severity)}
                          </div>
                          <div className="min-w-0 flex-1 space-y-1">
                            <h4 className={`truncate text-[14px] font-medium tracking-[-0.01em] ${isSelected ? 'text-emerald-900' : 'text-[#16352a]'}`}>
                              {finding.title}
                            </h4>
                            <p className="line-clamp-2 text-[12px] leading-relaxed text-[#60766b]">
                              {finding.observation || 'No observation provided.'}
                            </p>
                          </div>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane: Inspector Details */}
      <div className={`flex-1 flex-col overflow-hidden rounded-[1.5rem] border border-[#d8e5db]/80 bg-white shadow-[0_8px_32px_rgba(31,67,46,0.04)] ${!showMobileList ? 'flex' : 'hidden md:flex'}`}>
        {selectedFinding ? (
          <div className="flex h-full flex-col">
            {/* Inspector Header */}
            <div className="relative shrink-0 border-b border-[#d8e5db]/60 px-6 py-8 lg:px-10 bg-gradient-to-b from-[#f8fbf7] to-white">
              <div className={`absolute left-0 top-0 h-full w-[6px] ${getSeverityColor(selectedFinding.severity)}`} />
              
              <div className="flex items-start gap-4">
                <button 
                  onClick={() => setShowMobileList(true)}
                  className="md:hidden mt-1 flex shrink-0 items-center justify-center rounded-full bg-white p-2 text-[#60766b] shadow-sm ring-1 ring-[#d8e5db]/60 hover:bg-[#f4f8f3] hover:text-[#16352a] transition-all"
                >
                  <ChevronLeft className="size-5" />
                </button>
                <div className="space-y-4 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="neutral" className="bg-white text-[#486257] shadow-sm ring-1 ring-[#d8e5db]/60 uppercase tracking-[0.1em] text-[10px] font-bold px-2.5 py-0.5">
                      {selectedFinding.category || 'General'}
                    </Badge>
                    <Badge variant="neutral" className="bg-[#f4f8f3] text-[#60766b] shadow-none border-transparent capitalize text-[11px] font-medium px-2.5 py-0.5">
                      {selectedFinding.severity} Priority
                    </Badge>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold tracking-[-0.03em] text-[#10251d] break-words leading-tight">
                    {selectedFinding.title}
                  </h2>
                </div>
              </div>
            </div>

            {/* Inspector Body - Minimal & Clean */}
            <div className="flex-1 overflow-y-auto bg-white px-6 py-8 lg:px-12 lg:py-10 scrollbar-thin scrollbar-thumb-[#c8ddcd] scrollbar-track-transparent">
              <div className="mx-auto max-w-3xl space-y-8 pb-8">
                
                {/* Observation / Evidence */}
                {selectedFinding.observation && (
                  <div className="space-y-3">
                    <h3 className="flex items-center gap-2 text-[12px] font-bold uppercase tracking-[0.15em] text-[#71877b]">
                      <FileText className="size-4 text-[#8ca096]" />
                      Observation
                    </h3>
                    <div className="prose prose-sm max-w-none text-[15px] leading-relaxed text-[#2a4537] prose-p:my-2">
                      <p>{selectedFinding.observation}</p>
                    </div>
                  </div>
                )}

                {/* Impact & Recommendation - Borderless grid */}
                <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
                  {selectedFinding.businessImpact && (
                    <div className="space-y-2 border-l-2 border-amber-200 pl-4">
                      <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.15em] text-[#71877b]">
                        <TrendingUp className="size-4 text-amber-500" />
                        Business Impact
                      </h3>
                      <p className="text-[14px] leading-relaxed text-[#486257]">
                        {selectedFinding.businessImpact}
                      </p>
                    </div>
                  )}
                  {selectedFinding.recommendation && (
                    <div className="space-y-2 border-l-2 border-emerald-200 pl-4">
                      <h3 className="flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-[0.15em] text-[#71877b]">
                        <ShieldAlert className="size-4 text-emerald-500" />
                        Recommendation
                      </h3>
                      <p className="text-[14px] leading-relaxed text-[#486257]">
                        {selectedFinding.recommendation}
                      </p>
                    </div>
                  )}
                </div>

                {/* Footer Section: Metadata & Controls */}
                <div className="space-y-6 pt-6 border-t border-[#d8e5db]/60">
                   <div>
                     <h3 className="mb-3 text-[11px] font-bold uppercase tracking-[0.15em] text-[#71877b]">
                       Diagnostics & Sources
                     </h3>
                     <div className="flex flex-wrap items-center gap-3">
                       {selectedFinding.confidence && (
                         <Badge variant="success" className="bg-[#f4f8f3] text-[#16352a] shadow-none border-transparent capitalize px-3 py-1 font-medium">
                           <span className="mr-1.5 h-1.5 w-1.5 rounded-full bg-emerald-500 inline-block"></span>
                           {selectedFinding.confidence} Confidence
                         </Badge>
                       )}
                       {selectedFinding.evidenceType && (
                         <Badge variant="neutral" className="bg-[#f4f8f3] text-[#60766b] shadow-none border-transparent capitalize px-3 py-1 font-medium">
                           Type: {selectedFinding.evidenceType}
                         </Badge>
                       )}
                       
                       {selectedFinding.sources && selectedFinding.sources.length > 0 && (
                         <div className="flex flex-wrap items-center gap-2 border-l border-[#d8e5db] pl-4 ml-1">
                           {selectedFinding.sources.map((s: any) => (
                             <SourceChip
                               key={s.sourcePageId}
                               url={s.sourcePage?.url || s.url}
                               title={s.sourcePage?.title || undefined}
                             />
                           ))}
                         </div>
                       )}
                     </div>
                   </div>

                   <div>
                     <FindingControls finding={selectedFinding} />
                   </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center">
            <div className="text-center space-y-3">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#f4f8f3]">
                <FileText className="size-6 text-[#8ca096]" />
              </div>
              <p className="text-[#60766b]">Select a finding to view details</p>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
