'use client';

import React from 'react';
import { RotateCw, Trash2, CheckCircle2 } from 'lucide-react';
import type { PageThumbnail } from '@/services/pdf';

export interface PageGridItem {
  id: string;
  originalPageNumber: number;
  rotation: number;
  thumbnailUrl?: string;
  selected?: boolean;
}

interface PdfThumbnailProps {
  item: PageGridItem;
  displayIndex: number;
  onToggleSelect?: (id: string) => void;
  onRotate?: (id: string) => void;
  onDelete?: (id: string) => void;
  selectable?: boolean;
  canRotate?: boolean;
  canDelete?: boolean;
}

export const PdfThumbnail: React.FC<PdfThumbnailProps> = ({
  item,
  displayIndex,
  onToggleSelect,
  onRotate,
  onDelete,
  selectable = true,
  canRotate = false,
  canDelete = false,
}) => {
  return (
    <div
      onClick={() => selectable && onToggleSelect && onToggleSelect(item.id)}
      className={`group relative flex flex-col items-center rounded-xl border p-2.5 transition-all duration-200 cursor-pointer ${
        item.selected
          ? 'border-red-500 bg-red-50/40 ring-2 ring-red-400 dark:bg-red-950/30'
          : 'border-slate-200 bg-white hover:border-slate-300 shadow-sm hover:shadow dark:border-slate-800 dark:bg-slate-900'
      }`}
    >
      {/* Top badges */}
      <div className="flex w-full items-center justify-between px-1 mb-2 text-xs">
        <span className="font-semibold text-slate-500 dark:text-slate-400">
          หน้า {displayIndex + 1}
        </span>
        {selectable && (
          <div
            className={`h-5 w-5 rounded-full flex items-center justify-center transition ${
              item.selected ? 'text-red-600' : 'text-slate-300 group-hover:text-slate-400'
            }`}
          >
            <CheckCircle2 size={18} className={item.selected ? 'fill-red-100 dark:fill-red-950' : ''} />
          </div>
        )}
      </div>

      {/* Page preview frame */}
      <div className="relative flex h-48 w-full items-center justify-center overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
        {item.thumbnailUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={item.thumbnailUrl}
            alt={`Page ${item.originalPageNumber}`}
            style={{ transform: `rotate(${item.rotation}deg)` }}
            className="max-h-full max-w-full object-contain shadow transition-transform duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-400">
            <span className="text-sm font-medium">หน้า {item.originalPageNumber}</span>
          </div>
        )}
      </div>

      {/* Action controls */}
      {(canRotate || canDelete) && (
        <div className="mt-2 flex w-full items-center justify-center gap-2">
          {canRotate && onRotate && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onRotate(item.id);
              }}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900"
              title="หมุนหน้านี้ 90°"
            >
              <RotateCw size={15} />
            </button>
          )}
          {canDelete && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(item.id);
              }}
              className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
              title="ลบหน้านี้"
            >
              <Trash2 size={15} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};

interface PdfThumbnailGridProps {
  items: PageGridItem[];
  onToggleSelect?: (id: string) => void;
  onRotate?: (id: string) => void;
  onDelete?: (id: string) => void;
  onSelectAll?: () => void;
  onDeselectAll?: () => void;
  selectable?: boolean;
  canRotate?: boolean;
  canDelete?: boolean;
}

export const PdfThumbnailGrid: React.FC<PdfThumbnailGridProps> = ({
  items,
  onToggleSelect,
  onRotate,
  onDelete,
  onSelectAll,
  onDeselectAll,
  selectable = true,
  canRotate = false,
  canDelete = false,
}) => {
  const selectedCount = items.filter((i) => i.selected).length;

  return (
    <div className="space-y-4">
      {selectable && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3 text-sm">
          <span className="font-medium text-slate-700 dark:text-slate-300">
            เลือกแล้ว <span className="font-bold text-red-600">{selectedCount}</span> / {items.length} หน้า
          </span>

          <div className="flex items-center gap-2">
            {onSelectAll && (
              <button
                type="button"
                onClick={onSelectAll}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
              >
                เลือกทั้งหมด
              </button>
            )}
            {onDeselectAll && (
              <button
                type="button"
                onClick={onDeselectAll}
                className="text-xs font-semibold text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white px-2 py-1 rounded bg-slate-100 dark:bg-slate-800"
              >
                ยกเลิกทั้งหมด
              </button>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
        {items.map((item, idx) => (
          <PdfThumbnail
            key={item.id}
            item={item}
            displayIndex={idx}
            selectable={selectable}
            canRotate={canRotate}
            canDelete={canDelete}
            onToggleSelect={onToggleSelect}
            onRotate={onRotate}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
};
