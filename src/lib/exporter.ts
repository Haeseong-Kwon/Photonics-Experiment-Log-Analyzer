'use strict';

import { ExperimentSession, AnalysisResult } from '@/types/log';

export const exportToCSV = (session: ExperimentSession, analysis?: AnalysisResult) => {
    let csvContent = "data:text/csv;charset=utf-8,";

    // Metadata
    csvContent += `Experiment Name,${session.name}\n`;
    csvContent += `Session ID,${session.id}\n`;
    csvContent += `Created At,${session.created_at}\n\n`;

    // Analysis Result
    if (analysis) {
        csvContent += "Analysis Result,Value,Unit\n";
        csvContent += `Peak Wavelength,${analysis.peakWavelength},nm\n`;
        csvContent += `Peak Intensity,${analysis.peakIntensity},arb. u.\n`;
        csvContent += `FWHM,${analysis.fwhm},nm\n`;
        csvContent += `Q-Factor,${analysis.qFactor}\n`;
        csvContent += `SNR,${analysis.snr},dB\n\n`;
    }

    // Raw Data
    csvContent += "Wavelength (nm),Intensity\n";
    session.data.forEach(point => {
        csvContent += `${point.wavelength},${point.intensity}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${session.name}_data_package.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToJSON = (session: ExperimentSession, analysis?: AnalysisResult, aiInsights?: any) => {
    const dataPackage = {
        metadata: {
            name: session.name,
            id: session.id,
            created_at: session.created_at,
        },
        analysis: analysis || null,
        ai_insights: aiInsights || null,
        raw_data: session.data,
    };

    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(dataPackage, null, 2));
    const link = document.createElement("a");
    link.setAttribute("href", dataStr);
    link.setAttribute("download", `${session.name}_data_package.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};
