'use client';

import React from 'react';
import { Target, Activity, Zap, BarChart3 } from 'lucide-react';
import { AnalysisResult } from '@/types/log';
import FeatureCard from './FeatureCard';

interface AnalyticsPanelProps {
    analysis: AnalysisResult;
}

export default function AnalyticsPanel({ analysis }: AnalyticsPanelProps) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <FeatureCard
                    label="Peak Wavelength"
                    value={analysis.peakWavelength.toFixed(3)}
                    unit="nm"
                    icon={Target}
                    color="blue"
                    description="The wavelength where the highest intensity was detected."
                />
                <FeatureCard
                    label="FWHM"
                    value={analysis.fwhm.toFixed(3)}
                    unit="nm"
                    icon={Activity}
                    color="emerald"
                    description="Full Width at Half Maximum - a measure of spectral purity."
                />
                <FeatureCard
                    label="Q-Factor"
                    value={analysis.qFactor.toFixed(1)}
                    icon={Zap}
                    color="purple"
                    trend="up"
                    trendValue="+12%"
                    description="Quality factor indicating the sharpness of the resonance."
                />
                <FeatureCard
                    label="SNR"
                    value={analysis.snr.toFixed(2)}
                    unit="dB"
                    icon={BarChart3}
                    color="amber"
                    description="Signal-to-Noise ratio estimated from the baseline variance."
                />
            </div>
        </div>
    );
}
