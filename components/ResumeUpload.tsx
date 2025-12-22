"use client";

import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadCloud, FileText, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { useAuth } from '../context/auth-context';

export default function ResumeUpload({ onUploadSuccess }: { onUploadSuccess?: () => void }) {
    const { user } = useAuth();
    const [isDragActive, setIsDragActive] = useState(false);
    const [file, setFile] = useState<File | null>(null);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

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

        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            const droppedFile = e.dataTransfer.files[0];
            if (droppedFile.type === 'application/pdf') {
                setFile(droppedFile);
                setMessage('');
                setUploadStatus('idle');
            } else {
                setMessage('Please upload a valid PDF file.');
                setUploadStatus('error');
            }
        }
    }, []);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            if (selectedFile.type === 'application/pdf') {
                setFile(selectedFile);
                setMessage('');
                setUploadStatus('idle');
            } else {
                setMessage('Please upload a valid PDF file.');
                setUploadStatus('error');
            }
        }
    };

    const handleUpload = async () => {
        if (!file || !user?.token) return;

        setUploadStatus('uploading');
        setMessage('');

        const formData = new FormData();
        formData.append('resume', file);

        try {
            const response = await fetch('http://localhost:3001/api/v1/resumes/upload', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${user.token}`,
                },
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                setUploadStatus('success');
                setMessage('Resume uploaded successfully!');
                setFile(null); // Clear file after success
                if (onUploadSuccess) onUploadSuccess();
            } else {
                setUploadStatus('error');
                setMessage(data.error || 'Upload failed. Please try again.');
            }
        } catch (error) {
            console.error('Upload error:', error);
            setUploadStatus('error');
            setMessage('Network error. Please ensure backend is running.');
        }
    };

    return (
        <div className="w-full max-w-md mx-auto p-6">
            <motion.div
                className={`relative border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors duration-300
          ${isDragActive ? 'border-cyan-400 bg-cyan-400/10' : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'}
          ${uploadStatus === 'error' ? 'border-red-500 bg-red-500/10' : ''}
          ${uploadStatus === 'success' ? 'border-green-500 bg-green-500/10' : ''}
        `}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
            >
                <input
                    type="file"
                    accept="application/pdf"
                    onChange={handleFileChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <div className="flex flex-col items-center justify-center space-y-4">
                    <AnimatePresence mode="wait">
                        {uploadStatus === 'uploading' ? (
                            <motion.div
                                key="uploading"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1, rotate: 360 }}
                                exit={{ scale: 0 }}
                                transition={{ duration: 0.5 }}
                            >
                                <Loader2 className="w-12 h-12 text-cyan-400 animate-spin" />
                            </motion.div>
                        ) : uploadStatus === 'success' ? (
                            <motion.div
                                key="success"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <CheckCircle className="w-12 h-12 text-green-400" />
                            </motion.div>
                        ) : uploadStatus === 'error' ? (
                            <motion.div
                                key="error"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <AlertCircle className="w-12 h-12 text-red-500" />
                            </motion.div>
                        ) : (
                            <motion.div
                                key="idle"
                                initial={{ scale: 0 }}
                                animate={{ scale: 1 }}
                                exit={{ scale: 0 }}
                            >
                                <UploadCloud className={`w-12 h-12 ${isDragActive ? 'text-cyan-400 drop-shadow-[0_0_10px_rgba(34,211,238,0.8)]' : 'text-slate-400'}`} />
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <div className="space-y-2">
                        <p className={`text-lg font-medium ${isDragActive ? 'text-cyan-400' : 'text-slate-300'}`}>
                            {file ? file.name : "Drop your resume here"}
                        </p>
                        <p className="text-sm text-slate-500">
                            {file ? "Click Upload to proceed" : "or click to browse (PDF only)"}
                        </p>
                    </div>
                </div>
            </motion.div>

            {/* Upload Button */}
            {file && uploadStatus !== 'success' && uploadStatus !== 'uploading' && (
                <motion.button
                    onClick={handleUpload}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-6 w-full py-3 px-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 
            text-white font-bold rounded-lg shadow-[0_0_15px_rgba(6,182,212,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98]"
                >
                    Upload & Parse Resume
                </motion.button>
            )}

            {/* Status Message */}
            {message && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className={`mt-4 text-center text-sm font-medium ${uploadStatus === 'error' ? 'text-red-400' : uploadStatus === 'success' ? 'text-green-400' : 'text-slate-400'}`}
                >
                    {message}
                </motion.p>
            )}
        </div>
    );
}
