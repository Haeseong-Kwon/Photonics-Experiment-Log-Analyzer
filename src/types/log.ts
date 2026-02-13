export interface ParsedLog {
  wavelength: number;
  intensity: number;
}

export interface AnalysisResult {
  peakWavelength: number;
  peakIntensity: number;
  fwhm: number;
  snr: number;
  qFactor: number;
}

export interface ExperimentSession {
  id: string;
  name: string;
  created_at: string;
  data: ParsedLog[];
  analysis?: AnalysisResult;
  color?: string; // For chart visualization
}
