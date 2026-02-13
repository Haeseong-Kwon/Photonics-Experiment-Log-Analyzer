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
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Sparkles className="w-5 h-5 text-indigo-500" />
                        AI Research Insight
                    </h3>
                    {!insights && (
                        <button
                            onClick={generateInsights}
                            disabled={loading}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-300 text-white text-sm font-semibold rounded-xl transition-all shadow-lg shadow-indigo-100"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                    Analyzing...
                                </>
                            ) : (
                                'Analyze with Gemini'
                            )}
                        </button>
                    )}
                </div>

                {error && (
                    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 mb-6">
                        <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-sm font-bold">Analysis Failed</p>
                            <p className="text-xs">{error}</p>
                        </div>
                    </div>
                )}

                {insights ? (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
                        {/* Summary */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <BookOpen className="w-4 h-4" />
                                Experimental Summary
                            </p>
                            <p className="text-slate-700 leading-relaxed italic">
                                "{insights.summary}"
                            </p>
                        </div>

                        {/* Physical Meaning */}
                        <div className="space-y-2">
                            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <Lightbulb className="w-4 h-4 text-amber-500" />
                                Physical Interpretation
                            </p>
                            <p className="text-slate-700 text-sm leading-relaxed">
                                {insights.physical_meaning}
                            </p>
                        </div>

                        {/* Suggestions */}
                        <div className="space-y-3">
                            <p className="text-sm font-medium text-slate-500 flex items-center gap-2">
                                <Microscope className="w-4 h-4 text-emerald-500" />
                                Future Research Proposals
                            </p>
                            <ul className="space-y-2">
                                {insights.suggestions.map((suggestion, idx) => (
                                    <li key={idx} className="flex gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-lg border border-slate-100">
                                        <span className="text-indigo-500 font-bold">{idx + 1}.</span>
                                        {suggestion}
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <button
                            onClick={() => setInsights(null)}
                            className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors"
                        >
                            Reset Analysis
                        </button>
                    </div>
                ) : (
                    !loading && (
                        <div className="flex flex-col items-center justify-center py-10 border-2 border-dashed border-slate-100 rounded-2xl bg-slate-50/30">
                            <Sparkles className="w-8 h-8 text-slate-200 mb-3" />
                            <p className="text-sm text-slate-400 text-center px-6">
                                Click the button above to generate AI-powered insights based on your experimental data.
                            </p>
                        </div>
                    )
                )}
            </div>
        </div>
    );
}
