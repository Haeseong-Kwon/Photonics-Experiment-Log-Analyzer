'use client';

import React, { useState } from 'react';
import { Sparkles, Loader2, Lightbulb, BookOpen, Microscope, AlertCircle } from 'lucide-react';
import { ExperimentSession, AnalysisResult } from '@/types/log';

interface AIInsightResponse {
    summary: string;
    physical_meaning: string;
    suggestions: string[];
}

interface AIInsightProps {
    session: ExperimentSession;
    analysis: AnalysisResult;
}

export default function AIInsight({ session, analysis }: AIInsightProps) {
    const [loading, setLoading] = useState(false);
    const [insights, setInsights] = useState<AIInsightResponse | null>(null);
    const [error, setError] = useState<string | null>(null);

    const generateInsights = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('/api/analyze', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ session, analysis }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to generate insights');

            setInsights(data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-card rounded-3xl border border-white/5 shadow-2xl shadow-black/40 overflow-hidden relative group">
            <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
            <div className="p-8 relative z-10">
                <div className="flex items-center justify-between mb-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black text-foreground flex items-center gap-2 tracking-tight">
                            <Sparkles className="w-5 h-5 text-indigo-400" />
                            AI Research Insight
                        </h3>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-widest pl-7">Advanced Spectral Analysis</p>
                    </div>
                    {!insights && (
                        <button
                            onClick={generateInsights}
                            disabled={loading}
                            className="flex items-center gap-3 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-black rounded-2xl transition-all shadow-xl shadow-indigo-900/40 translate-y-0 active:translate-y-1"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Processing Stream...
                                </>
                            ) : (
                                <>
                                    <Sparkles className="w-4 h-4" />
                                    Analyze with Gemini
                                </>
                            )}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="flex items-start gap-4 p-5 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 mb-8 animate-in fade-in zoom-in duration-300">
                        <AlertCircle className="w-6 h-6 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-black uppercase tracking-wider">Analysis Synchronization Failed</p>
                            <p className="text-xs opacity-80 mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {insights ? (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        {/* Summary */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                <BookOpen className="w-3 h-3" />
                                Executive Summary
                            </p>
                            <div className="p-5 bg-background/50 rounded-2xl border border-white/5 italic text-slate-300 leading-relaxed">
                                "{insights.summary}"
                            </div>
                        </div>

                        {/* Physical Meaning */}
                        <div className="space-y-3">
                            <p className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Lightbulb className="w-3 h-3" />
                                Physical interpretation
                            </p>
                            <p className="text-slate-400 text-sm leading-relaxed px-1">
                                {insights.physical_meaning}
                            </p>
                        </div>

                        {/* Suggestions */}
                        <div className="space-y-4">
                            <p className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] flex items-center gap-2">
                                <Microscope className="w-3 h-3" />
                                Proposed next steps
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {insights.suggestions.map((suggestion, idx) => (
                                    <div key={idx} className="flex gap-4 text-xs text-slate-400 bg-background/40 p-5 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-colors">
                                        <span className="text-emerald-500 font-black text-base">{idx + 1}</span>
                                        <p className="leading-relaxed">{suggestion}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="pt-4 border-t border-white/5 flex justify-center">
                            <button
                                onClick={() => setInsights(null)}
                                className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-slate-400 transition-colors"
                            >
                                Clear Cache & Re-analyze
                            </button>
                        </div>
                    </div>
                ) : (
                    !loading && (
                        <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-white/5 rounded-3xl bg-black/20">
                            <div className="p-4 bg-indigo-500/5 rounded-full mb-4">
                                <Sparkles className="w-10 h-10 text-indigo-500/30" />
                            </div>
                            <p className="text-sm font-bold text-slate-500 text-center max-w-xs px-6">
                                Spectral intelligence is currently idle. Click above to synchronize with Gemini Research Engine.
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
