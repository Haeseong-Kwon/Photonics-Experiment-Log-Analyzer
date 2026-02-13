export interface ParsedLog {
  wavelength: number;
  intensity: number;
}

export interface ExperimentSession {
  id: string;
  name: string;
  created_at: string;
  data: ParsedLog[];
  color?: string; // For chart visualization
}
