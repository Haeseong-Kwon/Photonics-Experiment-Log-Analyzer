import { GoogleGenerativeAI } from '@google/generative-ai';
import { NextResponse } from 'next/server';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

export async function POST(req: Request) {
    try {
        const { session, analysis } = await req.json();

        if (!process.env.GOOGLE_API_KEY) {
            return NextResponse.json(
                { error: 'GOOGLE_API_KEY is not configured in .env.local' },
                { status: 500 }
            );
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

        const prompt = `
      You are an expert Photonics Research Assistant. Analyze the following spectral experimental data and provide insights.
      
      Experiment Name: ${session.name}
      Key Metrics:
      - Peak Wavelength: ${analysis.peakWavelength.toFixed(3)} nm
      - FWHM: ${analysis.fwhm.toFixed(3)} nm
      - Q-Factor: ${analysis.qFactor.toFixed(2)}
      - Signal-To-Noise Ratio: ${analysis.snr.toFixed(2)} dB
      
      The raw data contains ${session.data.length} datapoints.
      
      Please provide the response in a structured JSON format with the following keys:
      1. "summary": A brief one-sentence summary of the experiment.
      2. "physical_meaning": An explanation of what these results might indicate physically (e.g., resonance quality, material properties).
      3. "suggestions": 3 bullet points for potential follow-up experiments or optimizations.
      
      Ensure the tone is professional and scientific.
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Attempt to parse JSON from the response (in case Gemini wraps it in code blocks)
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        const analysisJson = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(text);

        return NextResponse.json(analysisJson);
    } catch (error) {
        console.error('AI Analysis Error:', error);
        return NextResponse.json(
            { error: 'Failed to generate AI insights' },
            { status: 500 }
        );
    }
}
