'use client';

import React, { useState } from 'react';
import { Download, X, Image as ImageIcon, Layers, Loader2 } from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';

interface ExportSettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    targetId: string;
    fileName: string;
}

export default function ExportSettingsModal({
    isOpen,
    onClose,
    targetId,
    fileName
}: ExportSettingsModalProps) {
    const [format, setFormat] = useState<'png' | 'svg'>('png');
    const [quality, setQuality] = useState(2);
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        const element = document.getElementById(targetId);
        if (!element) return;

        setIsExporting(true);
        try {
            let dataUrl = '';
            const options = {
                pixelRatio: quality,
                backgroundColor: '#0a0a0b', // Force dark background for export
                style: {
                    borderRadius: '0'
                }
            };

            if (format === 'png') {
                dataUrl = await toPng(element, options);
            } else {
                dataUrl = await toSvg(element, options);
            }

            const link = document.createElement('a');
            link.download = `${fileName.replace(/\s+/g, '_')}_spectrum.${format}`;
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-[#141417] w-full max-w-md rounded-3xl border border-white/10 shadow-2xl shadow-black overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-xl font-black text-white flex items-center gap-2">
                            <Download className="w-5 h-5 text-indigo-400" />
                            Publication Export
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-white/5 rounded-full transition-colors text-slate-500 hover:text-white">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Format Selection */}
                        <div>
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-3 block">File Format</label>
                            <div className="grid grid-cols-2 gap-3">
                                {(['png', 'svg'] as const).map((f) => (
                                    <button
                                        key={f}
                                        onClick={() => setFormat(f)}
                                        className={`p-4 rounded-2xl border font-bold uppercase text-xs transition-all ${format === f
                                                ? "bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-900/40"
                                                : "bg-[#0a0a0b]/50 border-white/5 text-slate-400 hover:border-white/10 hover:text-slate-300"
                                            }`}
                                    >
                                        {f === 'png' ? 'PNG (High Res)' : 'SVG (Vector)'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Resolution / Quality */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-1 block">
                                Resolution Scale (DPI Boost)
                            </label>
                            <div className="flex items-center gap-4">
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    step="1"
                                    value={quality}
                                    onChange={(e) => setQuality(parseInt(e.target.value))}
                                    className="flex-1 accent-indigo-500"
                                />
                                <span className="text-sm font-mono font-bold text-slate-300 w-12 text-center bg-white/5 p-2 rounded-xl">
                                    x{quality}
                                </span>
                            </div>
                            <p className="text-[10px] text-slate-500 italic">Higher scale results in larger file size but sharper text/lines.</p>
                        </div>

                        {/* Export Button */}
                        <div className="pt-4">
                            <button
                                onClick={handleExport}
                                disabled={isExporting}
                                className="w-full flex items-center justify-center gap-2 p-4 bg-white text-black hover:bg-slate-200 disabled:bg-slate-800 disabled:text-slate-600 rounded-2xl font-black text-sm transition-all shadow-xl shadow-white/5"
                            >
                                {isExporting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        Rendering High-Res...
                                    </>
                                ) : (
                                    <>
                                        <Download className="w-4 h-4" />
                                        Generate {format.toUpperCase()}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
