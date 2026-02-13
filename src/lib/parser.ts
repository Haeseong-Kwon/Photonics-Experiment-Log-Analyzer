'use strict';

import { ParsedLog } from '@/types/log';

export const parseSpectralLog = async (file: File): Promise<ParsedLog[]> => {
    const text = await file.text();
    const fileName = file.name.toLowerCase();

    if (fileName.endsWith('.json')) {
        try {
            const data = JSON.parse(text);
            if (Array.isArray(data)) return data;
            if (data.data && Array.isArray(data.data)) return data.data;
            throw new Error('Invalid JSON format');
        } catch (e) {
            throw new Error('Failed to parse JSON');
        }
    }

    // Handle CSV and TXT
    const lines = text.split(/\r?\n/).filter(line => line.trim() !== '');
    const results: ParsedLog[] = [];

    for (const line of lines) {
        // Skip header lines or lines that don't start with a number
        if (/^[a-zA-Z]/.test(line.trim())) continue;

        const parts = line.split(/[,\t ]+/).map(p => parseFloat(p.trim()));
        if (parts.length >= 2 && !isNaN(parts[0]) && !isNaN(parts[1])) {
            results.push({
                wavelength: parts[0],
                intensity: parts[1],
            });
        }
    }

    if (results.length === 0) {
        throw new Error('No valid spectral data found in file');
    }

    return results.sort((a, b) => a.wavelength - b.wavelength);
};
