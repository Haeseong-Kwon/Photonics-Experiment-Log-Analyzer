'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
    ChevronLeft,
    FlaskConical,
    Settings2,
    Download,
    RefreshCw,
    Sparkles,
    FileStack,
    Image,
    BookOpen
} from 'lucide-react';
import { ExperimentSession, ParsedLog, AnalysisResult } from '@/types/log';
import SpectralChart from '@/components/SpectralChart';
import AnalyticsPanel from '@/components/analytics/AnalyticsPanel';
import AIInsight from '@/components/analytics/AIInsight';
import ExportSettingsModal from '@/components/analytics/ExportSettingsModal';
import { analyzeSpectralData, generateGaussianCurve, findPeak } from '@/lib/analytics';
import { exportToCSV, exportToJSON } from '@/lib/exporter';
import Link from 'next/link';

export default function ExperimentDetailPage() {
    const { id } = useParams();
    const [session, setSession] = useState<ExperimentSession | null>(null);
    const [fittingRange, setFittingRange] = useState<[number, number] | null>(null);
    const [showFitting, setShowFitting] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);

    useEffect(() => {
        const saved = localStorage.getItem('spectral_sessions');
        if (saved) {
            const sessions: ExperimentSession[] = JSON.parse(saved);
            const found = sessions.find(s => s.id === id);
            if (found) {
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

        let dataToFit = session.data;
        if (fittingRange) {
            dataToFit = session.data.filter(
                d => d.wavelength >= fittingRange[0] && d.wavelength <= fittingRange[1]
            );
        }

        const peak = findPeak(dataToFit);
        return generateGaussianCurve(session.data, peak, analysis.fwhm);
    }, [showFitting, session, analysis, fittingRange]);

    const handleDataPackageExport = () => {
        if (!session || !analysis) return;
        exportToJSON(session, analysis);
    };

    if (!session) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-background">
                <div className="text-center animate-pulse">
                    <FlaskConical className="w-12 h-12 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500">Loading experimental data...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-6 md:p-10 transition-colors duration-300">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Navigation & Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-border pb-8">
                    <div className="space-y-1">
                        <Link
                            href="/experiments"
                            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary transition-colors mb-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
                            <span className="p-2 bg-primary rounded-lg">
                                <FlaskConical className="text-white w-6 h-6" />
                            </span>
                            {session.name}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Session ID: <span className="font-mono text-xs text-indigo-400">{session.id}</span> •
                            Recorded on {new Date(session.created_at).toLocaleString()}
                        </p>
                    </div>

                    <div className="flex items-center gap-3">
                        <button
                            onClick={() => setShowFitting(!showFitting)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-bold transition-all ${showFitting
                                    ? "bg-primary border-primary text-white shadow-lg shadow-primary/20"
                                    : "bg-card border-border text-slate-400 hover:border-primary hover:text-primary"
                                }`}
                        >
                            <Sparkles className="w-4 h-4" />
                            {showFitting ? "Fitting Active" : "Run Peak Fit"}
                        </button>
                        <button
                            onClick={() => setIsExportModalOpen(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-card border border-border rounded-xl text-slate-400 font-bold hover:text-primary hover:border-primary transition-all"
                        >
                            <Image className="w-4 h-4" />
                            Export Image
                        </button>
                    </div>
                </div>

                {/* Analytics KPI Section */}
                {analysis && <AnalyticsPanel analysis={analysis} />}

                {/* Main Workspace */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Chart Section */}
                    <div className="lg:col-span-8 space-y-8">
                        <div className="bg-card p-4 rounded-3xl border border-border overflow-hidden shadow-2xl shadow-black/20">
                            <SpectralChart
                                sessions={[session]}
                                peaks={peaks}
                                fittingData={fittingData}
                                onRangeChange={setFittingRange}
                                isDark={true}
                            />
                        </div>

                        {/* AI Insight Panel */}
                        {analysis && <AIInsight session={session} analysis={analysis} />}
                    </div>

                    {/* Controls & Export Sidebar */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Analysis Settings */}
                        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                                <Settings2 className="w-4 h-4" />
                                Analysis Settings
                            </h2>
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-600 uppercase tracking-widest block mb-2">Fitting Model</label>
                                    <select className="w-full p-3 bg-background border border-border rounded-xl text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 cursor-pointer">
                                        <option>Gaussian</option>
                                        <option disabled>Lorentzian (V2)</option>
                                    </select>
                                </div>
                                <div className="pt-2">
                                    <button
                                        onClick={() => { setFittingRange(null); setShowFitting(false); }}
                                        className="w-full flex items-center justify-center gap-2 p-3 bg-accent/20 hover:bg-accent/40 text-slate-400 hover:text-foreground rounded-xl text-sm font-bold border border-border transition-all"
                                    >
                                        <RefreshCw className="w-4 h-4" />
                                        Reset Zoom & Fit
                                    </button>
                                </div>
                            </div>
                        </div>

                        {/* Publication Tools */}
                        <div className="bg-card p-6 rounded-2xl shadow-sm border border-border">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-500 mb-4 flex items-center gap-2">
                                <FileStack className="w-4 h-4" />
                                Publication Tools
                            </h2>
                            <div className="space-y-3">
                                <button
                                    onClick={() => setIsExportModalOpen(true)}
                                    className="w-full flex items-center justify-between p-4 bg-background/50 hover:bg-primary/10 border border-border hover:border-primary/30 rounded-xl transition-all group"
                                >
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-300 group-hover:text-primary">High-Res Graph</p>
                                        <p className="text-[10px] text-slate-500">Export PNG/SVG (300 DPI+)</p>
                                    </div>
                                    <Download className="w-5 h-5 text-slate-600 group-hover:text-primary transition-colors" />
                                </button>

                                <button
                                    onClick={handleDataPackageExport}
                                    className="w-full flex items-center justify-between p-4 bg-background/50 hover:bg-emerald-500/10 border border-border hover:border-emerald-500/30 rounded-xl transition-all group"
                                >
                                    <div className="text-left">
                                        <p className="text-sm font-bold text-slate-300 group-hover:text-emerald-500">Full Data Package</p>
                                        <p className="text-[10px] text-slate-500">Integrated CSV/JSON Export</p>
                                    </div>
                                    <Download className="w-5 h-5 text-slate-600 group-hover:text-emerald-500 transition-colors" />
                                </button>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-indigo-900 to-indigo-950 p-6 rounded-2xl shadow-lg border border-indigo-500/20">
                            <h3 className="font-bold text-white flex items-center gap-2 mb-2">
                                <BookOpen className="w-4 h-4 text-indigo-400" />
                                Scientific Insight Active
                            </h3>
                            <p className="text-xs text-indigo-200/70 leading-relaxed">
                                Utilizing advanced spectral analysis and machine learning to interpret complex photonic phenomena.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <ExportSettingsModal
                isOpen={isExportModalOpen}
                onClose={() => setIsExportModalOpen(false)}
                targetId="spectral-chart-container"
                fileName={session.name}
            />
        </div>
    );
}
