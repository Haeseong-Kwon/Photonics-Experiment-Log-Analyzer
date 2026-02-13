'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import {
    Play,
    Square,
    Tag,
    Wifi,
    WifiOff,
    ChevronLeft,
    Activity,
    Zap,
    Monitor,
    CheckCircle2,
    AlertTriangle,
    FileStack,
    BookOpen
} from 'lucide-react';
import { ExperimentSession, ParsedLog, LiveEvent } from '@/types/log';
import SpectralChart from '@/components/SpectralChart';
import { streamManager } from '@/lib/streaming';
import Link from 'next/link';

export default function LiveStreamingPage() {
    const [data, setData] = useState<ParsedLog[]>([]);
    const [events, setEvents] = useState<LiveEvent[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const [isConnected, setIsConnected] = useState(true);
    const [lastEvent, setLastEvent] = useState<string | null>(null);

    const scrollRef = useRef<HTMLDivElement>(null);

    const handleNewData = useCallback((point: ParsedLog) => {
        setData(prev => {
            const newData = [...prev, point];
            // Keep only last 200 points for performance during live view
            return newData.slice(-200);
        });
    }, []);

    const toggleStreaming = () => {
        if (isStreaming) {
            streamManager.stopStream();
            setIsStreaming(false);
        } else {
            setData([]);
            setEvents([]);
            streamManager.startSimulatedStream(handleNewData);
            setIsStreaming(true);
        }
    };

    const addEvent = (label: string, color: string = "#10b981") => {
        if (!isStreaming) return;

        // In a real scenario, we'd use the current wavelength or time
        // For this simulation, we'll use the last data point's wavelength
        const lastWavelength = data.length > 0 ? data[data.length - 1].wavelength : 0;

        const newEvent: LiveEvent = {
            id: Math.random().toString(36).substr(2, 9),
            timestamp: lastWavelength,
            label,
            color,
        };

        setEvents(prev => [...prev, newEvent]);
        setLastEvent(label);

        // Reset last event text after 3 seconds
        setTimeout(() => setLastEvent(null), 3000);
    };

    // Mock session for SpectralChart
    const liveSession: ExperimentSession = {
        id: 'live-session',
        name: 'Live Instrument Stream',
        created_at: new Date().toISOString(),
        data: data,
        isLive: true,
    };

    useEffect(() => {
        return () => streamManager.stopStream();
    }, []);

    return (
        <div className="min-h-screen bg-[#0a0a0b] text-[#f8fafc] p-6 md:p-10 instrument-dark">
            <div className="max-w-7xl mx-auto space-y-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/5 pb-8">
                    <div className="space-y-1">
                        <Link
                            href="/experiments"
                            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-indigo-400 transition-colors mb-2"
                        >
                            <ChevronLeft className="w-4 h-4" />
                            Exit Live Console
                        </Link>
                        <div className="flex items-center gap-3">
                            <div className="p-2 bg-indigo-500/10 rounded-lg border border-indigo-500/30">
                                <Activity className="text-indigo-500 w-6 h-6 animate-pulse" />
                            </div>
                            <h1 className="text-3xl font-bold tracking-tight">Real-time Spectral Stream</h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border text-xs font-bold uppercase tracking-widest ${isConnected ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-500" : "bg-red-500/10 border-red-500/20 text-red-500"
                            }`}>
                            {isConnected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                            {isConnected ? "Device Connected" : "Device Offline"}
                        </div>

                        <button
                            onClick={toggleStreaming}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all shadow-lg ${isStreaming
                                ? "bg-red-600 hover:bg-red-700 text-white shadow-red-900/20"
                                : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-900/20"
                                }`}
                        >
                            {isStreaming ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                            {isStreaming ? "Terminate Stream" : "Initialize Stream"}
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    {/* Main Chart View */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-[#141417] p-6 rounded-2xl border border-white/5 shadow-2xl relative overflow-hidden group">
                            <div className="absolute inset-0 bg-indigo-500/5 opacity-20 pointer-events-none group-hover:opacity-30 transition-opacity" />
                            <div className="relative">
                                <div className="flex items-center justify-between mb-6">
                                    <div className="flex items-center gap-2">
                                        <Monitor className="w-4 h-4 text-indigo-400" />
                                        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">Primary Oscilloscope</h3>
                                    </div>
                                    {isStreaming && (
                                        <div className="flex items-center gap-3">
                                            <span className="flex items-center gap-1 text-[10px] font-mono text-indigo-400 bg-indigo-400/10 px-2 py-1 rounded">
                                                DATARATE: 10Hz
                                            </span>
                                            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded">
                                                BUFFER: {data.length}/200
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="bg-black/40 rounded-xl overflow-hidden border border-white/5">
                                    <SpectralChart
                                        sessions={[liveSession]}
                                        liveEvents={events}
                                        isDark={true}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Event Log */}
                        <div className="bg-[#141417] p-6 rounded-2xl border border-white/5">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center gap-2">
                                <FileStack className="w-4 h-4" />
                                Stream Event Log
                            </h3>
                            <div className="space-y-2 max-h-[150px] overflow-y-auto custom-scrollbar" ref={scrollRef}>
                                {events.length === 0 ? (
                                    <p className="text-sm text-slate-600 italic text-center py-4">No events recorded in current session</p>
                                ) : (
                                    events.map((event) => (
                                        <div key={event.id} className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                                            <div className="flex items-center gap-3">
                                                <Tag className="w-3 h-3 text-indigo-400" />
                                                <span className="text-sm font-medium">{event.label}</span>
                                            </div>
                                            <span className="text-[10px] font-mono text-slate-500">
                                                {event.timestamp.toFixed(3)} nm
                                            </span>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Remote Control Console */}
                    <div className="lg:col-span-4 space-y-6">
                        <div className="bg-[#141417] p-6 rounded-2xl border border-white/5 shadow-xl">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-6 flex items-center gap-2">
                                <Zap className="w-4 h-4 text-amber-500" />
                                Remote Control Console
                            </h3>

                            <div className="space-y-8">
                                {/* Event Tagging Buttons */}
                                <div className="space-y-3">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Instant Tagging</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        <button
                                            onClick={() => addEvent("Laser On", "#ef4444")}
                                            disabled={!isStreaming}
                                            className="p-4 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 transition-all disabled:opacity-30 disabled:grayscale"
                                        >
                                            Laser Start
                                        </button>
                                        <button
                                            onClick={() => addEvent("Filter Set", "#3b82f6")}
                                            disabled={!isStreaming}
                                            className="p-4 bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 rounded-xl text-xs font-bold text-blue-400 transition-all disabled:opacity-30 disabled:grayscale"
                                        >
                                            Adjust Filter
                                        </button>
                                        <button
                                            onClick={() => addEvent("Capture Point", "#10b981")}
                                            disabled={!isStreaming}
                                            className="p-4 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 rounded-xl text-xs font-bold text-emerald-400 transition-all disabled:opacity-30 disabled:grayscale"
                                        >
                                            Save Point
                                        </button>
                                        <button
                                            onClick={() => addEvent("Calibration", "#f59e0b")}
                                            disabled={!isStreaming}
                                            className="p-4 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 rounded-xl text-xs font-bold text-amber-400 transition-all disabled:opacity-30 disabled:grayscale"
                                        >
                                            Auto Calib
                                        </button>
                                    </div>
                                </div>

                                {/* Status Readouts */}
                                <div className="space-y-4 pt-4 border-t border-white/5">
                                    <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Live telemetry</p>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">Curr Int</p>
                                            <p className="text-xl font-mono text-indigo-400 font-bold tracking-tighter">
                                                {data.length > 0 ? data[data.length - 1].intensity.toFixed(4) : "0.0000"}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-black/20 rounded-xl border border-white/5">
                                            <p className="text-[10px] text-slate-500 font-bold mb-1 uppercase tracking-tighter">Curr Wav</p>
                                            <p className="text-xl font-mono text-slate-300 font-bold tracking-tighter">
                                                {data.length > 0 ? data[data.length - 1].wavelength.toFixed(2) : "0.00"}
                                                <span className="text-[10px] ml-1">nm</span>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Visual Feedback */}
                                {lastEvent && (
                                    <div className="p-4 bg-indigo-500/20 border border-indigo-500/30 rounded-xl flex items-center gap-3 animate-bounce">
                                        <CheckCircle2 className="w-5 h-5 text-indigo-400" />
                                        <p className="text-sm font-bold text-indigo-400">Tag Inserted: {lastEvent}</p>
                                    </div>
                                )}

                                {!isStreaming && (
                                    <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3">
                                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        <p className="text-[10px] font-medium text-amber-500/80 leading-tight">
                                            System in Standby. Initialize stream to begin real-time data acquisition and tagging.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
