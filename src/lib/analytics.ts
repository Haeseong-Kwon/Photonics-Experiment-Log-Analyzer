'use strict';

import { ParsedLog, AnalysisResult } from '@/types/log';

/**
 * Finds the primary peak in the spectral data
 */
export const findPeak = (data: ParsedLog[]): ParsedLog => {
    return data.reduce((prev, current) => (prev.intensity > current.intensity ? prev : current));
};

/**
 * Calculates Full Width at Half Maximum (FWHM)
 */
export const calculateFWHM = (data: ParsedLog[], peak: ParsedLog): number => {
    const halfMax = peak.intensity / 2;

    // Find leftmost point where intensity >= halfMax
    let leftIdx = 0;
    for (let i = 0; i < data.length; i++) {
        if (data[i].intensity >= halfMax) {
            leftIdx = i;
            break;
        }
    }

    // Find rightmost point where intensity >= halfMax
    let rightIdx = data.length - 1;
    for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].intensity >= halfMax) {
            rightIdx = i;
            break;
        }
    }

    return Math.abs(data[rightIdx].wavelength - data[leftIdx].wavelength);
};

/**
 * Estimates Signal-to-Noise Ratio (SNR)
 * Simple estimation: Peak Intensity / Standard Deviation of the baseline (first 10% of data)
 */
export const estimateSNR = (data: ParsedLog[], peak: ParsedLog): number => {
    const baselineCount = Math.floor(data.length * 0.1);
    if (baselineCount < 2) return 0;

    const baseline = data.slice(0, baselineCount).map(d => d.intensity);
    const mean = baseline.reduce((a, b) => a + b) / baseline.length;
    const variance = baseline.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / baseline.length;
    const stdDev = Math.sqrt(variance);

    return stdDev === 0 ? 0 : peak.intensity / stdDev;
};

/**
 * Performs a comprehensive analysis on the spectral data
 */
export const analyzeSpectralData = (data: ParsedLog[]): AnalysisResult => {
    if (data.length === 0) {
        return { peakWavelength: 0, peakIntensity: 0, fwhm: 0, snr: 0, qFactor: 0 };
    }

    const peak = findPeak(data);
    const fwhm = calculateFWHM(data, peak);
    const snr = estimateSNR(data, peak);
    const qFactor = fwhm === 0 ? 0 : peak.wavelength / fwhm;

    return {
        peakWavelength: peak.wavelength,
        peakIntensity: peak.intensity,
        fwhm,
        snr,
        qFactor
    };
};

/**
 * Generates a Gaussian curve based on the detected peak and FWHM
 */
export const generateGaussianCurve = (
    data: ParsedLog[],
    peak: ParsedLog,
    fwhm: number
): ParsedLog[] => {
    const sigma = fwhm / (2 * Math.sqrt(2 * Math.log(2)));

    return data.map(d => ({
        wavelength: d.wavelength,
        intensity: peak.intensity * Math.exp(-Math.pow(d.wavelength - peak.wavelength, 2) / (2 * Math.pow(sigma, 2)))
    }));
};
