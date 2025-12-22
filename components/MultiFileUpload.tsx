"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, X, Loader2 } from 'lucide-react';

type MultiFileUploadProps = {
    onUpload: (files: File[]) => void;
    isLoading: boolean;
};

export default function MultiFileUpload({ onUpload, isLoading }: MultiFileUploadProps) {
    const [files, setFiles] = useState<File[]>([]);
    const [isDragActive, setIsDragActive] = useState(false);

    const onDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(true);
    }, []);

    const onDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
    }, []);

    const onDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragActive(false);
        if (e.dataTransfer.files) {
            const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
            setFiles(prev => [...prev, ...droppedFiles]);
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
            setFiles(prev => [...prev, ...selectedFiles]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };

    return (
        <div className="w-full space-y-4">
            {/* Drop Zone */}
            <motion.div
                className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-colors
                    ${isDragActive ? 'border-cyan-400 bg-cyan-500/10' : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'}
                `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                whileHover={{ scale: 1.01 }}
            >
                <input
                    type="file"
                    multiple
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    disabled={isLoading}
                />

                <UploadCloud className={`w-12 h-12 mx-auto mb-4 ${isDragActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <p className="text-lg font-medium text-slate-200">
                    Drag & Drop Resumes
                </p>
                <p className="text-sm text-slate-500 mt-1">
                    Or click to browse (PDF only)
                </p>
            </motion.div>

            {/* File List */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                    >
                        {files.map((file, idx) => (
                            <motion.div
                                key={`${file.name}-${idx}`}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className="flex items-center justify-between p-3 bg-slate-800 rounded-lg border border-slate-700"
                            >
                                <div className="flex items-center gap-3">
                                    <FileText className="w-5 h-5 text-blue-400" />
                                    <span className="text-sm text-slate-200 truncate max-w-[200px]">{file.name}</span>
                                    <span className="text-xs text-slate-500">({(file.size / 1024).toFixed(1)} KB)</span>
                                </div>
                                <button
                                    onClick={() => removeFile(idx)}
                                    className="p-1 hover:bg-slate-700 rounded-full text-slate-400 hover:text-red-400"
                                    disabled={isLoading}
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Action Button */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => onUpload(files)}
                        disabled={isLoading}
                        className="w-full py-3 px-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 
                                 text-white font-bold rounded-lg shadow-lg shadow-cyan-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Analyzing {files.length} Candidates...
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-5 h-5" />
                                Analyze {files.length} Match{files.length !== 1 ? 'es' : ''}
                            </>
                        )}
                    </motion.button>
                )}
            </AnimatePresence>
        </div>
    );
}
