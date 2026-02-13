'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ExperimentSession } from '@/types/log';
import LogUploader from '@/components/LogUploader';
import SpectralChart from '@/components/SpectralChart';
import { Layers, History, FlaskConical, Search, BarChart3, Trash2 } from 'lucide-react';

export default function ExperimentsPage() {
    const router = useRouter();
    const [sessions, setSessions] = useState<ExperimentSession[]>([]);
    const [selectedIds, setSelectedIds] = useState<string[]>([]);
    const [searchQuery, setSearchQuery] = useState('');

    // Local storage simulation
    useEffect(() => {
        const saved = localStorage.getItem('spectral_sessions');
        if (saved) {
            try {
                const parsed = JSON.parse(saved);
                setSessions(parsed);
                if (parsed.length > 0) setSelectedIds([parsed[0].id]);
            } catch (e) {
                console.error('Failed to load sessions', e);
            }
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('spectral_sessions', JSON.stringify(sessions));
    }, [sessions]);

    const handleUpload = (newSession: ExperimentSession) => {
        setSessions(prev => [newSession, ...prev]);
        setSelectedIds(prev => [...prev, newSession.id]);
    };

    const toggleSession = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
        );
    };

    const deleteSession = (e: React.MouseEvent, id: string) => {
        e.stopPropagation();
        setSessions(prev => prev.filter(s => s.id !== id));
        setSelectedIds(prev => prev.filter(item => item !== id));
    };

    const filteredSessions = sessions.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeSessions = sessions.filter(s => selectedIds.includes(s.id));

    return (
        <div className="min-h-screen bg-slate-50 p-6 md:p-10">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900 tracking-tight flex items-center gap-3">
                            <FlaskConical className="text-blue-600" />
                            Photonics Log Analyzer
                        </h1>
                        <p className="text-slate-500 mt-1">Spectral Data Management & Analysis Suite</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search sessions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                            />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Sidebar Area */}
                    <div className="lg:col-span-4 space-y-8">
                        {/* Uploader Section */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <Layers className="w-4 h-4" />
                                Ingest Data
                            </h2>
                            <LogUploader onUploadComplete={handleUpload} />
                        </div>

                        {/* Session History */}
                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
                            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <History className="w-4 h-4" />
                                Recent Sessions
                            </h2>
                            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                                {filteredSessions.length === 0 ? (
                                    <p className="text-sm text-slate-400 text-center py-8 italic">No sessions found</p>
                                ) : (
                                    filteredSessions.map((session) => (
                                        <div
                                            key={session.id}
                                            onClick={() => toggleSession(session.id)}
                                            className={`group flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all ${selectedIds.includes(session.id)
                                                ? "bg-blue-50/50 border-blue-200"
                                                : "bg-white border-slate-100 hover:border-slate-300"
                                                }`}
                                        >
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div
                                                    className="w-3 h-3 rounded-full flex-shrink-0"
                                                    style={{ backgroundColor: session.color }}
                                                />
                                                <div className="overflow-hidden">
                                                    <p className="text-sm font-medium text-slate-700 truncate">{session.name}</p>
                                                    <p className="text-[10px] text-slate-400">
                                                        {new Date(session.created_at).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        router.push(`/experiments/${session.id}`);
                                                    }}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg transition-all"
                                                >
                                                    <BarChart3 className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={(e) => deleteSession(e, session.id)}
                                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 rounded-lg transition-all"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Visualization Area */}
                    <div className="lg:col-span-8 space-y-8">
                        <SpectralChart sessions={activeSessions} />

                        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                            <h2 className="text-base font-semibold text-slate-800 mb-4">Quick Insights</h2>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 font-medium">Active Overlays</p>
                                    <p className="text-2xl font-bold text-slate-800 tracking-tight">{activeSessions.length}</p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 font-medium">Total Data Points</p>
                                    <p className="text-2xl font-bold text-slate-800 tracking-tight">
                                        {activeSessions.reduce((acc, curr) => acc + curr.data.length, 0)}
                                    </p>
                                </div>
                                <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <p className="text-xs text-slate-500 font-medium">Storage Method</p>
                                    <p className="text-2xl font-bold text-slate-800 tracking-tight">Local (P2)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
