'use client';

import React, { useState, useId } from 'react';
import Link from 'next/link';
import { AnalysisRecord } from '@/types';
import { useAuth } from '@/lib/supabase/provider';
import {
  FileText,
  Eye,
  Trash2,
  Calendar,
  ArrowRight,
  X,
  CheckSquare,
  Square,
  MinusSquare,
  AlertTriangle,
  Loader2,
  CheckCircle2
} from 'lucide-react';

interface RecentAnalysesTableProps {
  analyses: AnalysisRecord[];
  limit?: number;
  showBulkControls?: boolean;
}

interface ConfirmModalState {
  isOpen: boolean;
  type: 'single' | 'selected' | 'all';
  id?: string;
  title?: string;
  count?: number;
}

export function RecentAnalysesTable({
  analyses,
  limit,
  showBulkControls = true
}: RecentAnalysesTableProps) {
  const { deleteAnalysis, deleteMultipleAnalyses, clearAllAnalyses } = useAuth();
  const selectAllCheckboxId = useId();

  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedAnalysis, setSelectedAnalysis] = useState<AnalysisRecord | null>(null);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // In-app confirmation modal state (avoids window.confirm which is blocked in iframes)
  const [confirmModal, setConfirmModal] = useState<ConfirmModalState>({
    isOpen: false,
    type: 'single',
  });

  const displayedList = limit ? analyses.slice(0, limit) : analyses;
  const allDisplayedIds = displayedList.map((a) => a.id);
  const isAllSelected =
    displayedList.length > 0 &&
    displayedList.every((item) => selectedIds.includes(item.id));
  const isSomeSelected =
    selectedIds.length > 0 && !isAllSelected;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 4000);
  };

  // Toggle select all visible items
  const handleToggleSelectAll = () => {
    if (isAllSelected) {
      // Deselect all displayed
      setSelectedIds((prev) => prev.filter((id) => !allDisplayedIds.includes(id)));
    } else {
      // Select all displayed
      setSelectedIds((prev) => {
        const set = new Set([...prev, ...allDisplayedIds]);
        return Array.from(set);
      });
    }
  };

  // Toggle single item selection
  const handleToggleSelectOne = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Trigger single item deletion modal
  const handleOpenSingleDelete = (item: AnalysisRecord, e: React.MouseEvent) => {
    e.stopPropagation();
    setConfirmModal({
      isOpen: true,
      type: 'single',
      id: item.id,
      title: item.title,
    });
  };

  // Trigger bulk selected deletion modal
  const handleOpenBatchDelete = () => {
    if (selectedIds.length === 0) return;
    setConfirmModal({
      isOpen: true,
      type: 'selected',
      count: selectedIds.length,
    });
  };

  // Trigger clear all history modal
  const handleOpenClearAll = () => {
    if (analyses.length === 0) return;
    setConfirmModal({
      isOpen: true,
      type: 'all',
      count: analyses.length,
    });
  };

  // Execute deletion based on modal type
  const handleExecuteDelete = async () => {
    setIsDeleting(true);
    try {
      if (confirmModal.type === 'single' && confirmModal.id) {
        const idToDelete = confirmModal.id;
        await deleteAnalysis(idToDelete);
        setSelectedIds((prev) => prev.filter((id) => id !== idToDelete));
        if (selectedAnalysis?.id === idToDelete) {
          setSelectedAnalysis(null);
        }
        showToast('Analysis record deleted successfully.');
      } else if (confirmModal.type === 'selected') {
        const count = selectedIds.length;
        await deleteMultipleAnalyses(selectedIds);
        setSelectedIds([]);
        if (selectedAnalysis && selectedIds.includes(selectedAnalysis.id)) {
          setSelectedAnalysis(null);
        }
        showToast(`Successfully deleted ${count} analysis ${count === 1 ? 'record' : 'records'}.`);
      } else if (confirmModal.type === 'all') {
        await clearAllAnalyses();
        setSelectedIds([]);
        setSelectedAnalysis(null);
        showToast('All analysis history has been permanently cleared.');
      }
    } catch (err) {
      console.error('Delete execution error:', err);
      showToast('An error occurred while deleting.');
    } finally {
      setIsDeleting(false);
      setConfirmModal({ isOpen: false, type: 'single' });
    }
  };

  // Empty State
  if (displayedList.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-[#E8DCCB] bg-white p-8 sm:p-12 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#FAF6F0] text-[#78716C]">
          <FileText className="h-6 w-6" />
        </div>
        <h3 className="mt-4 text-sm font-semibold text-[#1C1917]">No analyses yet</h3>
        <p className="mt-1 text-xs text-[#78716C] max-w-sm mx-auto">
          Analyze your first piece of text and your comprehensive results will appear here.
        </p>
        <div className="mt-6">
          <Link
            href="/dashboard/word-counter"
            prefetch={false}
            className="inline-flex items-center gap-2 rounded-xl bg-[#1C1917] px-4 py-2.5 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] transition-all"
          >
            <span>Start Counting</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* Toast Notification */}
      {toastMessage && (
        <div className="mb-4 flex items-center justify-between gap-3 rounded-xl border border-[#16A34A]/30 bg-[#F0FDF4] p-3.5 text-xs font-semibold text-[#166534] shadow-xs transition-all">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#16A34A]" />
            <span>{toastMessage}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="rounded p-1 text-[#166534] hover:bg-[#DCFCE7]"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Bulk Action Controls Bar */}
      {showBulkControls && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#E8DCCB] bg-white px-4 py-2.5 shadow-xs">
          <div className="flex items-center gap-3">
            {/* Select All Checkbox & Label */}
            <label
              htmlFor={selectAllCheckboxId}
              className="flex items-center gap-2 cursor-pointer select-none text-xs font-semibold text-[#1C1917]"
            >
              <input
                id={selectAllCheckboxId}
                type="checkbox"
                checked={isAllSelected}
                ref={(input) => {
                  if (input) {
                    input.indeterminate = isSomeSelected;
                  }
                }}
                onChange={handleToggleSelectAll}
                className="h-4 w-4 rounded border-[#D9CBBA] text-[#1C1917] focus:ring-1 focus:ring-[#1C1917] cursor-pointer"
              />
              <span>
                {isAllSelected ? 'Deselect All' : 'Select All'} ({displayedList.length})
              </span>
            </label>

            {selectedIds.length > 0 && (
              <span className="rounded-full bg-[#FAF6F0] border border-[#E8DCCB] px-2.5 py-0.5 text-[11px] font-bold text-[#C26732]">
                {selectedIds.length} Selected
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Delete Selected Button */}
            {selectedIds.length > 0 && (
              <button
                type="button"
                onClick={handleOpenBatchDelete}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DC2626]/30 bg-[#FEF2F2] px-3.5 py-1.5 text-xs font-semibold text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-[#DC2626]" />
                <span>Delete Selected ({selectedIds.length})</span>
              </button>
            )}

            {/* Clear All History Button */}
            <button
              type="button"
              onClick={handleOpenClearAll}
              className="inline-flex items-center gap-1.5 rounded-xl border border-[#E8DCCB] bg-white px-3 py-1.5 text-xs font-semibold text-[#78716C] hover:bg-[#FAF6F0] hover:text-[#DC2626] transition-colors"
              title="Permanently remove all analysis records"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete All History</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Table */}
      <div className="overflow-x-auto rounded-2xl border border-[#E8DCCB] bg-white shadow-xs">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-[#E8DCCB] bg-[#FAF6F0]/80 text-[#78716C]">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  aria-label="Select all analyses"
                  checked={isAllSelected}
                  ref={(input) => {
                    if (input) {
                      input.indeterminate = isSomeSelected;
                    }
                  }}
                  onChange={handleToggleSelectAll}
                  className="h-3.5 w-3.5 rounded border-[#D9CBBA] text-[#1C1917] focus:ring-1 focus:ring-[#1C1917] cursor-pointer"
                />
              </th>
              <th className="py-3 px-4 font-semibold">Document & Date</th>
              <th className="py-3 px-4 text-right font-semibold">Words</th>
              <th className="py-3 px-4 text-right font-semibold">Characters</th>
              <th className="py-3 px-4 text-right font-semibold hidden sm:table-cell">Sentences</th>
              <th className="py-3 px-4 text-right font-semibold hidden md:table-cell">Reading Time</th>
              <th className="py-3 px-4 text-right font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E8DCCB]/60">
            {displayedList.map((item) => {
              const isSelected = selectedIds.includes(item.id);
              const formattedDate = new Date(item.created_at).toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              });

              return (
                <tr
                  key={item.id}
                  onClick={() => setSelectedAnalysis(item)}
                  className={`cursor-pointer transition-colors ${
                    isSelected ? 'bg-[#FAF2EB]/70' : 'hover:bg-[#FAF6F0]/60'
                  }`}
                >
                  {/* Row Checkbox */}
                  <td
                    className="py-3 px-4 text-center"
                    onClick={(e) => handleToggleSelectOne(item.id, e)}
                  >
                    <input
                      type="checkbox"
                      aria-label={`Select ${item.title}`}
                      checked={isSelected}
                      onChange={() => {}}
                      className="h-3.5 w-3.5 rounded border-[#D9CBBA] text-[#1C1917] focus:ring-1 focus:ring-[#1C1917] cursor-pointer"
                    />
                  </td>

                  <td className="py-3 px-4">
                    <p className="font-semibold text-[#1C1917] truncate max-w-[200px] sm:max-w-xs">
                      {item.title}
                    </p>
                    <span className="text-[11px] text-[#A8A29E] flex items-center gap-1 mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {formattedDate}
                    </span>
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums font-semibold text-[#1C1917]">
                    {item.word_count.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums text-[#57534E]">
                    {item.character_count.toLocaleString()}
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums text-[#57534E] hidden sm:table-cell">
                    {item.sentence_count}
                  </td>

                  <td className="py-3 px-4 text-right font-mono tabular-nums text-[#C26732] hidden md:table-cell">
                    {item.reading_time}
                  </td>

                  {/* Actions Column */}
                  <td className="py-3 px-4 text-right">
                    <div
                      className="flex items-center justify-end gap-1.5"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={() => setSelectedAnalysis(item)}
                        className="rounded-lg p-1.5 text-[#78716C] hover:bg-[#FAF6F0] hover:text-[#1C1917] transition-colors"
                        title="View details"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={(e) => handleOpenSingleDelete(item, e)}
                        className="rounded-lg p-1.5 text-[#78716C] hover:bg-[#FEF2F2] hover:text-[#DC2626] transition-colors"
                        title="Delete record"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Custom Confirmation Modal (Reliable across all iframe environments) */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-fadeIn">
          <div className="relative w-full max-w-md rounded-3xl border border-[#E8DCCB] bg-white p-6 shadow-xl">
            <div className="flex items-start gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#FEF2F2] text-[#DC2626] border border-[#DC2626]/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-[#1C1917]">
                  {confirmModal.type === 'single'
                    ? 'Delete Analysis Record'
                    : confirmModal.type === 'selected'
                    ? `Delete ${confirmModal.count} Selected Analyses`
                    : 'Clear Entire Analysis History'}
                </h3>
                <p className="mt-1.5 text-xs text-[#57534E] leading-relaxed">
                  {confirmModal.type === 'single' ? (
                    <>
                      Are you sure you want to permanently delete{' '}
                      <strong className="text-[#1C1917]">&ldquo;{confirmModal.title}&rdquo;</strong>?
                      This action cannot be undone.
                    </>
                  ) : confirmModal.type === 'selected' ? (
                    <>
                      Are you sure you want to permanently delete all{' '}
                      <strong className="text-[#1C1917]">{confirmModal.count} selected records</strong> from
                      your history? This action cannot be undone.
                    </>
                  ) : (
                    <>
                      Are you sure you want to permanently clear your{' '}
                      <strong className="text-[#1C1917]">entire analysis history</strong> (
                      {confirmModal.count} records)? This action cannot be reversed.
                    </>
                  )}
                </p>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2.5 border-t border-[#E8DCCB] pt-4">
              <button
                type="button"
                onClick={() => setConfirmModal({ isOpen: false, type: 'single' })}
                disabled={isDeleting}
                className="rounded-xl border border-[#E8DCCB] bg-white px-4 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF6F0] transition-colors"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleExecuteDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-1.5 rounded-xl bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white shadow-xs hover:bg-[#B91C1C] transition-colors"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>
                      {confirmModal.type === 'single'
                        ? 'Delete Record'
                        : confirmModal.type === 'selected'
                        ? `Delete ${confirmModal.count} Records`
                        : 'Wipe All History'}
                    </span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Analysis Details Modal */}
      {selectedAnalysis && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-3xl border border-[#E8DCCB] bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#E8DCCB] pb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[#C26732]">
                  Archived Analysis
                </span>
                <h3 className="text-base font-bold text-[#1C1917] mt-0.5">
                  {selectedAnalysis.title}
                </h3>
                <span className="text-xs text-[#78716C]">
                  {new Date(selectedAnalysis.created_at).toLocaleString()}
                </span>
              </div>
              <button
                onClick={() => setSelectedAnalysis(null)}
                className="rounded-lg p-1.5 text-[#78716C] hover:bg-[#FAF6F0] hover:text-[#1C1917]"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Truncated preview */}
            {selectedAnalysis.text_preview && (
              <div className="mt-4 rounded-xl bg-[#FAF6F0] p-4 text-xs italic text-[#57534E] leading-relaxed">
                &ldquo;{selectedAnalysis.text_preview}&rdquo;
              </div>
            )}

            {/* Metrics Grid */}
            <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 text-xs">
              <div className="rounded-xl border border-[#E8DCCB] p-3">
                <span className="text-[#78716C]">Words</span>
                <p className="mt-1 text-lg font-bold tabular-nums text-[#1C1917]">
                  {selectedAnalysis.word_count.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-[#E8DCCB] p-3">
                <span className="text-[#78716C]">Characters</span>
                <p className="mt-1 text-lg font-bold tabular-nums text-[#1C1917]">
                  {selectedAnalysis.character_count.toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-[#E8DCCB] p-3">
                <span className="text-[#78716C]">Sentences</span>
                <p className="mt-1 text-lg font-bold tabular-nums text-[#1C1917]">
                  {selectedAnalysis.sentence_count}
                </p>
              </div>
              <div className="rounded-xl border border-[#E8DCCB] p-3">
                <span className="text-[#78716C]">Reading Time</span>
                <p className="mt-1 text-lg font-bold tabular-nums text-[#C26732]">
                  {selectedAnalysis.reading_time}
                </p>
              </div>
            </div>

            {/* More details */}
            <div className="mt-4 rounded-xl border border-[#E8DCCB] divide-y divide-[#E8DCCB]/60 text-xs">
              <div className="flex justify-between p-3">
                <span className="text-[#78716C]">Paragraphs</span>
                <strong className="text-[#1C1917] tabular-nums">{selectedAnalysis.paragraph_count}</strong>
              </div>
              <div className="flex justify-between p-3">
                <span className="text-[#78716C]">Average Word Length</span>
                <strong className="text-[#1C1917] tabular-nums">{selectedAnalysis.average_word_length} chars</strong>
              </div>
              <div className="flex justify-between p-3">
                <span className="text-[#78716C]">Average Sentence Length</span>
                <strong className="text-[#1C1917] tabular-nums">{selectedAnalysis.average_sentence_length} words</strong>
              </div>
              <div className="flex justify-between p-3">
                <span className="text-[#78716C]">Speaking Duration</span>
                <strong className="text-[#1C1917] tabular-nums">{selectedAnalysis.speaking_time}</strong>
              </div>
            </div>

            <div className="mt-6 flex justify-between items-center gap-2">
              <button
                type="button"
                onClick={(e) => {
                  handleOpenSingleDelete(selectedAnalysis, e);
                }}
                className="inline-flex items-center gap-1.5 rounded-xl border border-[#DC2626]/30 bg-[#FEF2F2] px-3.5 py-2 text-xs font-semibold text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
              >
                <Trash2 className="h-3.5 w-3.5 text-[#DC2626]" />
                <span>Delete This Record</span>
              </button>

              <button
                type="button"
                onClick={() => setSelectedAnalysis(null)}
                className="rounded-xl border border-[#E8DCCB] bg-white px-4 py-2 text-xs font-semibold text-[#1C1917] hover:bg-[#FAF6F0]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
