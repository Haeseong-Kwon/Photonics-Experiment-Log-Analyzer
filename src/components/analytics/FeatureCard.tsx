'use client';

import React from 'react';
import { TrendingUp, TrendingDown, Minus, LucideIcon } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface FeatureCardProps {
    label: string;
    value: string | number;
    unit?: string;
    icon: LucideIcon;
    trend?: 'up' | 'down' | 'neutral';
    trendValue?: string;
    description?: string;
    color?: string;
}

export default function FeatureCard({
    label,
    value,
    unit,
    icon: Icon,
    trend,
    trendValue,
    description,
    color = 'blue'
}: FeatureCardProps) {
    const colorMap: Record<string, string> = {
        blue: 'text-blue-600 bg-blue-50 border-blue-100',
        emerald: 'text-emerald-600 bg-emerald-50 border-emerald-100',
        amber: 'text-amber-600 bg-amber-50 border-amber-100',
        purple: 'text-purple-600 bg-purple-50 border-purple-100',
    };

    const selectedColor = colorMap[color] || colorMap.blue;

    return (
        <div className="bg-card p-5 rounded-2xl border border-border shadow-sm hover:shadow-md transition-all group overflow-hidden relative">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <Icon className="w-12 h-12" style={{ color: color }} />
            </div>
            <div className="relative z-10 space-y-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-background border border-border">
                        <Icon className="w-5 h-5" style={{ color: color }} />
                    </div>
                    <span className="text-xs font-bold uppercase tracking-widest text-slate-500">{label}</span>
                </div>

                <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-foreground tracking-tighter">{value}</span>
                    {unit && <span className="text-xs font-bold text-slate-600">{unit}</span>}
                </div>
                {description && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{description}</p>}
            </div>
        </div>
    );
}
