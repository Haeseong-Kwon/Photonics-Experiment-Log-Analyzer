'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, FlaskConical, Settings2, Download, RefreshCw, Sparkles } from 'lucide-react';
import { ExperimentSession, ParsedLog, AnalysisResult } from '@/types/log';
import SpectralChart from '@/components/SpectralChart';
import AnalyticsPanel from '@/components/analytics/AnalyticsPanel';
import { analyzeSpectralData, generateGaussianCurve, findPeak } from '@/lib/analytics';
import Link from 'next/link';

export default function ExperimentDetailPage() {
    const { id } = useParams();
    const router = useRouter();
    const [session, setSession] = useState<ExperimentSession | null>(null);
    const [fittingRange, setFittingRange] = useState<[number, number] | null>(null);
    const [showFitting, setShowFitting] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('spectral_sessions');
        if (saved) {
            const sessions: ExperimentSession[] = JSON.parse(saved);
            const found = sessions.find(s => s.id === id);
            if (found) {
                // Auto-analyze on load
                if (!found.analysis) {
                    found.analysis = analyzeSpectralData(found.data);
                }
                setSession(found);
            }
        }
    }, [id]);

    const analysis = useMemo(() => {
        if (!session) return null;
        return analyzeSpectralData(session.data);
    }, [session]);

    const peaks = useMemo(() => {
        if (!analysis || !session) return [];
        return [{
            wavelength: analysis.peakWavelength,
            intensity: analysis.peakIntensity,
            color: "#ef4444"
        }];
    }, [analysis, session]);

    const fittingData = useMemo(() => {
        if (!showFitting || !session || !analysis) return [];

        // Use either full data or filtered range for fitting
        let dataToFit = session.data;
        if (fittingRange) {
            dataToFit = session.data.filter(
                d => d.wavelength >= fittingRange[0] && d.wavelength <= fittingRange[1]
            );
        }

        const peak = findPeak(dataToFit);
        return generateGaussianCurve(session.data, peak, analysis.fwhm);
    }, [showFitting, session, analysis, fittingRange]);

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-slate-50">
                <div className="text-center animate-pulse">
                    <FlaskConical className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-slate-500">Loading experimental data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Navigation & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <Link
                            href="/experiments"
                            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-blue-600 transition-colors mb-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                            <span className="p-2 bg-blue-600 rounded-lg">
                                <FlaskConical className="text-white w-6 h-6" />
                            </span>
                            {session.name}
                        </h1>
                        <p className="text-slate-500">
                            Session ID: <span className="font-mono text-xs">{session.id}</span> •
                            Recorded on {new Date(session.created_at).toLocaleString()}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFitting(!showFitting)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-medium transition-all ${showFitting
                                    ? "bg-indigo-600 border-indigo-600 text-white shadow-lg shadow-indigo-200"
                                    : "bg-white border-slate-200 text-slate-700 hover:border-indigo-400 hover:text-indigo-600"
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            {showFitting ? "Fitting Active" : "Run Peak Fit"}
                        </button>
                        <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition-all">
                            <Download className="w-4 h-4" />
                            Export .CSV
                        </button>
                    </div>
                </div>

                {/* Analytics KPI Section */}
                {analysis && <AnalyticsPanel analysis={analysis} />}

                {/* Main Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Chart Section */}
                    <div className="lg:col-span-9 space-y-6">
                        <div className="relative group">
                            <SpectralChart
                                sessions={[session]}
                                peaks={peaks}
                                fittingData={fittingData}
                                onRangeChange={setFittingRange}
                            />
                            <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="px-3 py-1.5 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold uppercase rounded-lg">
                                    Drag below to select fitting range
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Controls & Properties */}
                    <div className="lg:col-span-3 space-y-6">
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <Settings2 className="w-4 h-4" />
                                Analysis Settings
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-slate-500 block mb-2">Fitting Model</label>
                                    <select className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20">
                                        <option>Gaussian</option>
                                        <option disabled>Lorentzian (P3)</option>
                                        <option disabled>Voigt (P3)</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-slate-500 block mb-2">Noise Filtering</label>
                                    <div className="flex items-center gap-2">
                                        <input type="range" className="flex-1 accent-blue-600" />
                                        <span className="text-xs font-mono text-slate-400">10%</span>
                                    </div>
                                </div>
                                <div className="pt-2">
                                    <button className="w-full flex items-center justify-center gap-2 p-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-sm font-semibold transition-colors">
                                        <RefreshCw className="w-4 h-4" />
                                        Reset Zoom
                                    </button>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 rounded-2xl shadow-lg text-white">
                            <h3 className="font-bold flex items-center gap-2 mb-2">
                                <Sparkles className="w-4 h-4" />
                                Smart Insights
                            </h3>
                            <p className="text-xs text-blue-100 leading-relaxed mb-4">
                                Detected a strong resonance at {analysis?.peakWavelength.toFixed(2)} nm with a Q-factor of {analysis?.qFactor.toFixed(1)}. The SNR is high enough for reliable fitting.
                            </p>
                            <button className="text-[10px] font-bold uppercase tracking-wider bg-white/20 hover:bg-white/30 p-2 rounded-lg transition-colors w-full">
                                View Full Report
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
