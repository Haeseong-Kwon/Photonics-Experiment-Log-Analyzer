'use client';

import { ParsedLog, LiveEvent } from '@/types/log';
import { supabase } from './supabase';

export interface StreamConfig {
    interval: number;
    noiseLevel: number;
    centerWavelength: number;
}

export type StreamCallback = (point: ParsedLog) => void;
export type EventCallback = (event: LiveEvent) => void;

class SpectralStreamManager {
    private intervalId: NodeJS.Timeout | null = null;
    private isStreaming = false;
    private currentWavelength = 1500;
    private config: StreamConfig = {
        interval: 100,
        noiseLevel: 0.05,
        centerWavelength: 1550,
    };

    startSimulatedStream(onData: StreamCallback, onEvent?: EventCallback) {
        if (this.isStreaming) return;
        this.isStreaming = true;
        this.currentWavelength = 1500;

        this.intervalId = setInterval(() => {
            // Simulate a sweep or real-time data flow
            const w = this.currentWavelength;
            // Gaussian peak at centerWavelength
            const intensity = Math.exp(-Math.pow(w - this.config.centerWavelength, 2) / 200) + Math.random() * this.config.noiseLevel;

            onData({ wavelength: parseFloat(w.toFixed(3)), intensity: parseFloat(intensity.toFixed(3)) });

            this.currentWavelength += 0.5;
            if (this.currentWavelength > 1600) {
                this.currentWavelength = 1500; // Reset sweep
            }
        }, this.config.interval);
    }

    stopStream() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
        this.isStreaming = false;
    }

    // Placeholder for real Supabase Realtime integration
    subscribeToLiveChannel(channelName: string, onData: StreamCallback) {
        const channel = supabase
            .channel(channelName)
            .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'parsed_logs' }, (payload) => {
                onData(payload.new as ParsedLog);
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }
}

export const streamManager = new SpectralStreamManager();
