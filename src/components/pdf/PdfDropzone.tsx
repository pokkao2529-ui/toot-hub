'use client';

import React, { useRef, useState } from 'react';
import { UploadCloud, FileUp } from 'lucide-react';

interface PdfDropzoneProps {
  onFilesSelected: (files: File[]) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSizeMb?: number;
  title?: string;
  subtitle?: string;
  disabled?: boolean;
}

export const PdfDropzone: React.FC<PdfDropzoneProps> = ({
  onFilesSelected,
  accept = '.pdf,application/pdf',
  multiple = false,
  maxFiles = 1,
  maxFileSizeMb = 50,
  title = 'ลากและวางไฟล์ที่นี่',
  subtitle = 'หรือคลิกเพื่อเลือกไฟล์จากอุปกรณ์ของคุณ',
  disabled = false,
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    if (disabled) return;
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    if (disabled) return;

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const filesArray = Array.from(e.dataTransfer.files);
      const filtered = multiple ? filesArray.slice(0, maxFiles) : [filesArray[0]];
      onFilesSelected(filtered);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const filesArray = Array.from(e.target.files);
      const filtered = multiple ? filesArray.slice(0, maxFiles) : [filesArray[0]];
      onFilesSelected(filtered);
      // reset input
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      onClick={() => !disabled && inputRef.current?.click()}
      className={`relative cursor-pointer rounded-2xl border-2 border-dashed p-10 text-center transition-all duration-200 ${
        isDragOver
          ? 'border-red-500 bg-red-50/50 dark:bg-red-950/20 scale-[1.01]'
          : 'border-slate-300 hover:border-red-400 bg-white dark:bg-slate-900/60 dark:border-slate-800'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        multiple={multiple}
        disabled={disabled}
        onChange={handleFileChange}
        className="hidden"
      />

      <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400 mb-5 shadow-sm">
        {isDragOver ? <FileUp className="h-10 w-10 animate-bounce" /> : <UploadCloud className="h-10 w-10" />}
      </div>

      <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100 mb-2">
        {title}
      </h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 mb-4">
        {subtitle}
      </p>

      <div className="inline-flex items-center gap-2 rounded-full bg-slate-100 dark:bg-slate-800 px-4 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-300">
        <span>สูงสุด {maxFiles} ไฟล์</span>
        <span>•</span>
        <span>ขนาดไฟล์ละไม่เกิน {maxFileSizeMb} MB</span>
      </div>
    </div>
  );
};
