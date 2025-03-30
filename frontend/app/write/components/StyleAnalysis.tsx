"use client";

import { Badge } from "@/components/ui/badge";

interface StyleAnalysisProps {
  toneAnalysis: {
    tone?: string;
    formality?: string;
    confidence?: number;
  };
}

export default function StyleAnalysis({ toneAnalysis }: StyleAnalysisProps) {
  if (!toneAnalysis || !toneAnalysis.tone) {
    return null;
  }

  return (
    <div className="rounded-xl overflow-hidden bg-gradient-to-br from-slate-50/80 to-blue-50/50 dark:from-slate-900/40 dark:to-blue-900/10 p-6 backdrop-blur-sm border border-slate-200/50 dark:border-slate-800/30 shadow-sm ring-1 ring-black/5 dark:ring-white/5">
      <div className="mb-3">
        <h3 className="text-lg font-medium">Writing Style Analysis</h3>
        <p className="text-sm text-muted-foreground">
          Based on your writing sample
        </p>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5">
        {toneAnalysis.tone && (
          <div className="rounded-lg bg-white/70 dark:bg-slate-900/30 p-4 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/30">
            <div className="text-sm text-muted-foreground mb-1.5">Tone</div>
            <div className="font-medium">{toneAnalysis.tone}</div>
          </div>
        )}
        
        {toneAnalysis.formality && (
          <div className="rounded-lg bg-white/70 dark:bg-slate-900/30 p-4 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/30">
            <div className="text-sm text-muted-foreground mb-1.5">Formality</div>
            <div className="font-medium">{toneAnalysis.formality}</div>
          </div>
        )}
        
        {toneAnalysis.confidence !== undefined && (
          <div className="rounded-lg bg-white/70 dark:bg-slate-900/30 p-4 backdrop-blur-sm border border-slate-200/80 dark:border-slate-800/30">
            <div className="text-sm text-muted-foreground mb-1.5">Confidence</div>
            <div className="font-medium">{Math.round(toneAnalysis.confidence * 100)}%</div>
          </div>
        )}
      </div>
    </div>
  );
} 