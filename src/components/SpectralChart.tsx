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
} from 'recharts';
import { ExperimentSession } from '@/types/log';

interface SpectralChartProps {
    sessions: ExperimentSession[];
}

export default function SpectralChart({ sessions }: SpectralChartProps) {
    // Merge all sessions' data for the chart. Recharts LineChart expects a single array of objects
    // where each object has the X axis value and then keys for each line.
    const chartData = useMemo(() => {
        if (sessions.length === 0) return [];

        // 1. Get all unique wavelengths across all sessions
        const allWavelengths = Array.from(
            new Set(sessions.flatMap(s => s.data.map(d => d.wavelength)))
        ).sort((a, b) => a - b);

        // 2. Map wavelengths to intensity values for each session
        return allWavelengths.map(wavelength => {
            const point: any = { wavelength };
            sessions.forEach(session => {
                const match = session.data.find(d => d.wavelength === wavelength);
                if (match) {
                    point[session.id] = match.intensity;
                }
            });
            return point;
        });
    }, [sessions]);

    if (sessions.length === 0) {
        return (
            <div className="flex items-center justify-center h-[400px] border rounded-xl bg-gray-50/30 text-gray-400 italic">
                Upload a file to view spectral data
            </div>
        );
    }

    return (
        <div className="w-full h-[500px] p-4 bg-white rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Spectrum Analysis</h3>
            <ResponsiveContainer width="100%" height="90%">
                <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                    <XAxis
                        dataKey="wavelength"
                        type="number"
                        domain={['dataMin', 'dataMax']}
                        label={{ value: 'Wavelength (nm)', position: 'insideBottomRight', offset: -10, fontSize: 12 }}
                        tick={{ fontSize: 11 }}
                        stroke="#94a3b8"
                    />
                    <YAxis
                        label={{ value: 'Intensity', angle: -90, position: 'insideLeft', fontSize: 12 }}
                        tick={{ fontSize: 11 }}
                        stroke="#94a3b8"
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        labelFormatter={(val) => `Wavelength: ${val} nm`}
                    />
                    <Legend />
                    {sessions.map((session) => (
                        <Line
                            key={session.id}
                            type="monotone"
                            dataKey={session.id}
                            name={session.name}
                            stroke={session.color || '#3b82f6'}
                            strokeWidth={2}
                            dot={false}
                            activeDot={{ r: 4 }}
                            animationDuration={800}
                        />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}
