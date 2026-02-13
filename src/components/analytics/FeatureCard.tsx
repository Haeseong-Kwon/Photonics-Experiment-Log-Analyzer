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
        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
                <div className={cn("p-2.5 rounded-xl border", selectedColor)}>
                    <Icon className="w-5 h-5" />
                </div>

                {trend && (
                    <div className={cn(
                        "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider",
                        trend === 'up' && "text-emerald-600 bg-emerald-50",
                        trend === 'down' && "text-red-600 bg-red-50",
                        trend === 'neutral' && "text-slate-400 bg-slate-50"
                    )}>
                        {trend === 'up' && <TrendingUp className="w-3 h-3" />}
                        {trend === 'down' && <TrendingDown className="w-3 h-3" />}
                        {trend === 'neutral' && <Minus className="w-3 h-3" />}
                        {trendValue}
                    </div>
                )}
            </div>

            <div className="mt-4">
                <p className="text-sm font-medium text-slate-500">{label}</p>
                <div className="flex items-baseline gap-1 mt-1">
                    <h4 className="text-2xl font-bold text-slate-900 tracking-tight">{value}</h4>
                    {unit && <span className="text-sm font-medium text-slate-400">{unit}</span>}
                </div>
                {description && <p className="text-xs text-slate-400 mt-2 leading-relaxed">{description}</p>}
            </div>
        </div>
    );
}
