'use client';

import React, { useState, useCallback } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { parseSpectralLog } from '@/lib/parser';
import { ExperimentSession } from '@/types/log';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
    return twMerge(clsx(inputs));
}

interface LogUploaderProps {
    onUploadComplete: (session: ExperimentSession) => void;
}

export default function LogUploader({ onUploadComplete }: LogUploaderProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [status, setStatus] = useState<'idle' | 'parsing' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const handleFile = async (file: File) => {
        setStatus('parsing');
        setErrorMessage(null);

        try {
            const parsedData = await parseSpectralLog(file);
            const newSession: ExperimentSession = {
                id: crypto.randomUUID(),
                name: file.name,
                created_at: new Date().toISOString(),
                data: parsedData,
                color: `#${Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0')}`,
            };

            setTimeout(() => {
                setStatus('success');
                onUploadComplete(newSession);
                setTimeout(() => setStatus('idle'), 2000);
            }, 800);
        } catch (err) {
            setStatus('error');
            setErrorMessage(err instanceof Error ? err.message : 'Unknown error occurred');
        }
    };

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFile(file);
    }, []);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    return (
        <div
            onDrop={onDrop}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            className={cn(
                "relative flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-xl transition-all duration-300",
                isDragging ? "border-blue-500 bg-blue-50/50" : "border-gray-300 hover:border-gray-400 bg-gray-50/30",
                status === 'error' && "border-red-500 bg-red-50/50",
                status === 'success' && "border-green-500 bg-green-50/50"
            )}
        >
            <input
                type="file"
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
                accept=".txt,.csv,.json"
            />

            <div className="flex flex-col items-center text-center p-6 pointer-events-none">
                {status === 'idle' && (
                    <>
                        <div className="p-3 bg-white rounded-full shadow-sm mb-3">
                            <Upload className="w-6 h-6 text-gray-500" />
                        </div>
                        <p className="text-sm font-medium text-gray-700">Click or drag to upload log files</p>
                        <p className="text-xs text-gray-500 mt-1">Supports .TXT, .CSV, .JSON</p>
                    </>
                )}

                {status === 'parsing' && (
                    <>
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin mb-3" />
                        <p className="text-sm font-medium text-blue-700">Processing file...</p>
                    </>
                )}

                {status === 'success' && (
                    <>
                        <CheckCircle2 className="w-8 h-8 text-green-500 mb-3 animate-in zoom-in duration-300" />
                        <p className="text-sm font-medium text-green-700">Successfully parsed!</p>
                    </>
                )}

                {status === 'error' && (
                    <>
                        <AlertCircle className="w-8 h-8 text-red-500 mb-3" />
                        <p className="text-sm font-medium text-red-700">Upload failed</p>
                        <p className="text-xs text-red-500 mt-1">{errorMessage}</p>
                    </>
                )}
            </div>
        </div>
    );
}
