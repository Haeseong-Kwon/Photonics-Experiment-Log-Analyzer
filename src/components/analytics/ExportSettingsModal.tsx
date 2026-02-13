'use client';

import React, { useState } from 'react';
import { X, Download, Type, Move, Layers, ImageIcon, Loader2 } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';

interface ExportSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    fileName: string;
}

export default function ExportSettingsModal({ isOpen, onClose, targetId, fileName }: ExportSettingsModalProps) {
    const [format, setFormat] = useState<'png' | 'svg'>('png');
    const [quality, setQuality] = useState(2); // Pixel ratio
    const [fontSize, setFontSize] = useState(14);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        setIsExporting(true);
        try {
            const options = {
                pixelRatio: quality,
                backgroundColor: '#ffffff',
                style: {
                    fontSize: `${fontSize}px`,
                }
            };

            let dataUrl;
            if (format === 'png') {
                dataUrl = await toPng(element, options);
            } else {
                dataUrl = await toSvg(element, options);
            }

            const link = document.createElement('a');
            link.download = `${fileName}_publication.${format}`;
            link.href = dataUrl;
            link.click();
            onClose();
        } catch (err) {
            console.error('Export failed', err);
        } finally {
            setIsExporting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 overflow-hidden">
                <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                    <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <Download className="w-5 h-5 text-blue-600" />
                        Export for Publication
                    </h3>
                    <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <X className="w-5 h-5 text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Format Selection */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <ImageIcon className="w-4 h-4" />
                            File Format
                        </label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                onClick={() => setFormat('png')}
                                className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${format === 'png' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                                    }`}
                            >
                                PNG (High Res)
                            </button>
                            <button
                                onClick={() => setFormat('svg')}
                                className={`p-3 rounded-xl border-2 text-sm font-semibold transition-all ${format === 'svg' ? 'border-blue-600 bg-blue-50 text-blue-600' : 'border-slate-100 text-slate-400 hover:border-slate-200'
                                    }`}
                            >
                                SVG (Vector)
                            </button>
                        </div>
                    </div>

                    {/* Resolution / Quality */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Layers className="w-4 h-4" />
                            Resolution Scale (DPI Boost)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="4"
                                step="1"
                                value={quality}
                                onChange={(e) => setQuality(parseInt(e.target.value))}
                                className="flex-1 accent-blue-600"
                            />
                            <span className="text-sm font-mono font-bold text-slate-600 w-12 text-center bg-slate-100 p-1 rounded">
                                x{quality}
                            </span>
                        </div>
                        <p className="text-[10px] text-slate-400">Scale factor for standard DPI. x2 is recommended for most journals.</p>
                    </div>

                    {/* Font Fine-tuning */}
                    <div className="space-y-3">
                        <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                            <Type className="w-4 h-4" />
                            Axis Label Font Size
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="8"
                                max="24"
                                value={fontSize}
                                onChange={(e) => setFontSize(parseInt(e.target.value))}
                                className="flex-1 accent-blue-600"
                            />
                            <span className="text-sm font-mono font-bold text-slate-600 w-12 text-center bg-slate-100 p-1 rounded">
                                {fontSize}px
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-6 bg-slate-50 flex gap-3">
                    <button
                        onClick={onClose}
                        className="flex-1 py-3 text-sm font-semibold text-slate-500 hover:text-slate-700 transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleExport}
                        disabled={isExporting}
                        className="flex-[2] py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-bold rounded-xl transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2"
                    >
                        {isExporting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                        {isExporting ? 'Generating...' : 'Export High-Quality Image'}
                    </button>
                </div>
            </div>
        </div>
    );
}
