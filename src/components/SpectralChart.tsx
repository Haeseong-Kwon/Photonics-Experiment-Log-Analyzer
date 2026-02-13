'use client';

import React, { useMemo } from 'react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    Legend,
    ReferenceDot,
    Brush,
} from 'recharts';
import { ExperimentSession, ParsedLog } from '@/types/log';

interface SpectralChartProps {
    sessions: ExperimentSession[];
    peaks?: { wavelength: number; intensity: number; color?: string }[];
    fittingData?: ParsedLog[];
    onRangeChange?: (range: [number, number] | null) => void;
}

export default function SpectralChart({
    sessions,
    peaks = [],
    fittingData = [],
    onRangeChange
}: SpectralChartProps) {
    // Merge all sessions' data for the chart.
    const chartData = useMemo(() => {
        if (sessions.length === 0 && fittingData.length === 0) return [];

        // 1. Get all unique wavelengths across all sessions and fitting data
        const allWavelengths = Array.from(
            new Set([
                ...sessions.flatMap(s => s.data.map(d => d.wavelength)),
                ...fittingData.map(d => d.wavelength)
            ])
        ).sort((a, b) => a - b);

        // 2. Map wavelengths to intensity values
        return allWavelengths.map(wavelength => {
            const point: any = { wavelength };
            sessions.forEach(session => {
                const match = session.data.find(d => d.wavelength === wavelength);
                if (match) {
                    point[session.id] = match.intensity;
                }
            });

            const fitMatch = fittingData.find(d => d.wavelength === wavelength);
            if (fitMatch) {
                point['fitting'] = fitMatch.intensity;
            }

            return point;
        });
    }, [sessions, fittingData]);

    const handleBrushChange = (data: any) => {
        if (onRangeChange) {
            if (data && data.startIndex !== undefined && data.endIndex !== undefined && chartData.length > 0) {
                const startWavelength = chartData[data.startIndex].wavelength;
                const endWavelength = chartData[data.endIndex].wavelength;
                onRangeChange([startWavelength, endWavelength]);
            } else {
                onRangeChange(null);
            }
        }
    };

    if (sessions.length === 0 && fittingData.length === 0) {
        return (
            <div className="flex items-center justify-center h-[400px] border rounded-xl bg-gray-50/30 text-gray-400 italic">
                Upload a file to view spectral data
            </div>
        );
    }

    return (
        <div id="spectral-chart-container" className="w-full h-[550px] p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800">Spectrum Analysis</h3>
                <div className="flex gap-2">
                    {fittingData.length > 0 && (
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase py-1 px-2 bg-indigo-50 text-indigo-600 rounded-md border border-indigo-100">
                            <span className="w-2 h-2 rounded-full bg-indigo-500" />
                            Gaussian Fit Active
                        </span>
                    )}
                </div>
            </div>
            <ResponsiveContainer width="100%" height="85%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="wavelength"
                        type="number"
                        domain={['auto', 'auto']}
                        tick={{ fontSize: 11 }}
                        stroke="#94a3b8"
                    />
                    <YAxis
                        tick={{ fontSize: 11 }}
                        stroke="#94a3b8"
                    />
                    <Tooltip
                        contentStyle={{
                            borderRadius: '12px',
                            border: 'none',
                            boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                            fontSize: '12px'
                        }}
                        labelFormatter={(val) => `Wavelength: ${Number(val).toFixed(3)} nm`}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />

                    {sessions.map((session) => (
                        <Line
                            key={session.id}
                            type="monotone"
                            dataKey={session.id}
                            name={session.name}
                            stroke={session.color || '#3b82f6'}
                            strokeWidth={sessions.length === 1 ? 2 : 1.5}
                            dot={false}
                            activeDot={{ r: 4 }}
                            animationDuration={500}
                            opacity={fittingData.length > 0 && sessions.length === 1 ? 0.4 : 1}
                        />
                    ))}

                    {fittingData.length > 0 && (
                        <Line
                            type="monotone"
                            dataKey="fitting"
                            name="Peak Fit (Gaussian)"
                            stroke="#6366f1"
                            strokeWidth={3}
                            dot={false}
                            strokeDasharray="5 5"
                            animationDuration={800}
                        />
                    )}

                    {peaks.map((peak, idx) => (
                        <ReferenceDot
                            key={`peak-${idx}`}
                            x={peak.wavelength}
                            y={peak.intensity}
                            r={5}
                            fill={peak.color || "#ef4444"}
                            stroke="#fff"
                            strokeWidth={2}
                        />
                    ))}

                    <Brush
                        dataKey="wavelength"
                        height={30}
                        stroke="#cbd5e1"
                        onChange={handleBrushChange}
                        fill="#f8fafc"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
