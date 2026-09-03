'use client';

import React from 'react';
import { FileText, Trash2, ArrowUp, ArrowDown } from 'lucide-react';

export interface FileItem {
  id: string;
  file: File;
  previewUrl?: string;
}

interface PdfFileCardProps {
  item: FileItem;
  index: number;
  total: number;
  onRemove: (id: string) => void;
  onMoveUp?: (index: number) => void;
  onMoveDown?: (index: number) => void;
}

export const PdfFileCard: React.FC<PdfFileCardProps> = ({
  item,
  index,
  total,
  onRemove,
  onMoveUp,
  onMoveDown,
}) => {
  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-sm hover:shadow transition">
      <div className="flex items-center space-x-3 overflow-hidden">
        <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-red-100 dark:bg-red-950/50 text-red-600 font-semibold text-sm">
          {index + 1}
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-100">
            {item.file.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            {formatSize(item.file.size)}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-1">
        {onMoveUp && (
          <button
            type="button"
            disabled={index === 0}
            onClick={() => onMoveUp(index)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
            title="เลื่อนขึ้น"
          >
            <ArrowUp size={16} />
          </button>
        )}
        {onMoveDown && (
          <button
            type="button"
            disabled={index === total - 1}
            onClick={() => onMoveDown(index)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 disabled:opacity-30"
            title="เลื่อนลง"
          >
            <ArrowDown size={16} />
          </button>
        )}
        <button
          type="button"
          onClick={() => onRemove(item.id)}
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
          title="ลบไฟล์นี้"
        >
          <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
};

interface PdfFileListProps {
  files: FileItem[];
  onRemove: (id: string) => void;
  onReorder?: (newFiles: FileItem[]) => void;
  onAddMore?: () => void;
}

export const PdfFileList: React.FC<PdfFileListProps> = ({
  files,
  onRemove,
  onReorder,
  onAddMore,
}) => {
  const handleMoveUp = (index: number) => {
    if (index === 0 || !onReorder) return;
    const updated = [...files];
    const temp = updated[index - 1];
    updated[index - 1] = updated[index];
    updated[index] = temp;
    onReorder(updated);
  };

  const handleMoveDown = (index: number) => {
    if (index === files.length - 1 || !onReorder) return;
    const updated = [...files];
    const temp = updated[index + 1];
    updated[index + 1] = updated[index];
    updated[index] = temp;
    onReorder(updated);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
        <span>รายการไฟล์ที่เลือก ({files.length} ไฟล์)</span>
        {onAddMore && (
          <button
            type="button"
            onClick={onAddMore}
            className="text-red-600 hover:text-red-700 dark:text-red-400 font-medium text-xs underline"
          >
            + เพิ่มไฟล์อีก
          </button>
        )}
      </div>

      <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
        {files.map((item, idx) => (
          <PdfFileCard
            key={item.id}
            item={item}
            index={idx}
            total={files.length}
            onRemove={onRemove}
            onMoveUp={onReorder ? handleMoveUp : undefined}
            onMoveDown={onReorder ? handleMoveDown : undefined}
          />
        ))}
      </div>
    </div>
  );
};
