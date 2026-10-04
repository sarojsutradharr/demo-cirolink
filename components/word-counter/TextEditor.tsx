'use client';

import React, { useState, useRef, ChangeEvent, DragEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/supabase/provider';
import { TextAnalysisStats } from '@/types';
import { analyzeText } from '@/lib/word-counter/analyzer';
import {
  UploadCloud,
  Trash2,
  ClipboardCopy,
  Sparkles,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  X,
  CreditCard,
  Lock,
  ArrowRight
} from 'lucide-react';

interface TextEditorProps {
  onAnalysisComplete: (stats: TextAnalysisStats, rawText: string, title: string) => void;
  initialText?: string;
  isPublicDemo?: boolean;
}

export function TextEditor({
  onAnalysisComplete,
  initialText = '',
  isPublicDemo = false,
}: TextEditorProps) {
  const router = useRouter();
  const { user, consumeCreditForAnalysis } = useAuth();
  const [text, setText] = useState<string>(initialText);
  const [title, setTitle] = useState<string>('Untitled Document');
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const [analysisStatus, setAnalysisStatus] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const credits = user?.credits ?? 0;
  const isZeroCredits = Boolean(!isPublicDemo && user && credits <= 0);

  const handleClear = () => {
    setText('');
    setUploadedFileName(null);
    setErrorMsg(null);
    setAnalysisStatus(null);
  };

  const handlePaste = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      if (clipboardText) {
        setText(clipboardText);
        setUploadedFileName(null);
        setErrorMsg(null);
      }
    } catch {
      setErrorMsg('Unable to access clipboard. Please paste manually into the editor.');
    }
  };

  const processUploadedFile = (file: File) => {
    setErrorMsg(null);

    // Validate extension
    const allowedExtensions = ['.txt', '.md', '.csv'];
    const hasValidExt = allowedExtensions.some((ext) =>
      file.name.toLowerCase().endsWith(ext)
    );

    if (!hasValidExt) {
      setErrorMsg('Invalid file format. Please upload .txt, .md, or .csv files.');
      return;
    }

    // Validate size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrorMsg('File too large. Maximum file size is 5MB.');
      return;
    }

    if (file.size === 0) {
      setErrorMsg('Uploaded file is empty.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (!content || content.trim().length === 0) {
        setErrorMsg('Uploaded file contains no readable text.');
        return;
      }
      setText(content);
      setUploadedFileName(file.name);
      setTitle(file.name.replace(/\.[^/.]+$/, ''));
      setAnalysisStatus('File loaded. Click "Count Text" below to analyze.');
    };
    reader.onerror = () => {
      setErrorMsg('Failed to read the file. Please try again.');
    };
    reader.readAsText(file);
  };

  const handleFileInput = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      processUploadedFile(file);
    }
  };

  const handleCount = async () => {
    setErrorMsg(null);
    setAnalysisStatus(null);

    if (!user) {
      router.push('/login');
      return;
    }

    if (!text || text.trim().length === 0) {
      setErrorMsg('Please paste, type, or upload text before analyzing.');
      return;
    }

    if (isZeroCredits) {
      setErrorMsg(
        `You have used all ${user?.max_credits ?? 5} credits for your ${user?.plan.toUpperCase()} plan. Please upgrade your plan to continue analyzing text.`
      );
      return;
    }

    setIsAnalyzing(true);
    setAnalysisStatus('Analyzing your text...');

    try {
      const stats = analyzeText(text);

      if (!isPublicDemo && user) {
        const result = await consumeCreditForAnalysis(stats, title, text);
        if (!result.success) {
          setErrorMsg(result.error || 'Failed to complete analysis');
          setIsAnalyzing(false);
          setAnalysisStatus(null);
          return;
        }
      }

      setAnalysisStatus('Analysis complete.');
      onAnalysisComplete(stats, text, title);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Error occurred while analyzing text');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="w-full">
      {/* Unauthenticated Notification */}
      {!user && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#C26732]/30 bg-[#FAF2EB] p-4 text-[#1C1917]">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#C26732] text-white">
              <Lock className="h-4 w-4" />
            </div>
            <div>
              <p className="text-xs font-bold text-[#1C1917]">
                Authentication Required
              </p>
              <p className="text-[11px] text-[#78716C]">
                Sign in to your account to count and analyze documents.
              </p>
            </div>
          </div>
          <Link
            href="/login"
            prefetch={false}
            className="inline-flex items-center gap-1.5 rounded-xl bg-[#1C1917] px-4 py-2 text-xs font-semibold text-[#F7F1E8] shadow-xs hover:bg-[#2D231E] transition-all shrink-0"
          >
            <span>Sign In</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* Zero credits warning banner with direct button to Pricing Section */}
      {isZeroCredits && (
        <div className="mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#DC2626]/20 bg-[#FEF2F2] p-4 text-[#991B1B]">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 shrink-0 text-[#DC2626] mt-0.5" />
            <div>
              <p className="text-sm font-semibold">
                Credit Limit Expired for {user?.email} (0 / {user?.max_credits} Credits Remaining)
              </p>
              <p className="text-xs text-[#B91C1C] mt-0.5 leading-relaxed">
                Your {user?.plan.toUpperCase()} plan quota is burned. Note: <strong>Downgrading will not reset or restore your credits</strong>. Burned credits renew according to your scheduled 30-day pricing timeline, or you can upgrade to refill immediately.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Link
              href="/dashboard/billing#credit-timeline"
              prefetch={false}
              className="inline-flex items-center justify-center rounded-xl border border-[#DC2626]/30 bg-white px-3 py-2 text-xs font-semibold text-[#991B1B] hover:bg-[#FEE2E2] transition-colors"
            >
              <span>View Timeline</span>
            </Link>
            <Link
              href="/dashboard/billing#plans-section"
              prefetch={false}
              className="inline-flex items-center justify-center gap-1.5 rounded-xl bg-[#DC2626] px-4 py-2 text-xs font-semibold text-white shadow-xs transition-colors hover:bg-[#B91C1C]"
            >
              <CreditCard className="h-3.5 w-3.5" />
              <span>Upgrade Plan</span>
            </Link>
          </div>
        </div>
      )}

      {/* Editor Main Container */}
      <div
        className={`rounded-2xl border bg-white shadow-xs transition-all ${
          isDragging
            ? 'border-[#C26732] ring-2 ring-[#C26732]/20'
            : 'border-[#E8DCCB] hover:border-[#D9CBBA]'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {/* Editor Toolbar */}
        <div className="flex flex-wrap items-center justify-between border-b border-[#E8DCCB] px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Document Title"
              className="border-none bg-transparent text-xs font-semibold text-[#1C1917] focus:outline-none focus:ring-0 max-w-[180px] sm:max-w-xs"
            />
          </div>

          <div className="flex items-center gap-2">
            {/* Hidden file input */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              accept=".txt,.md,.csv"
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DCCB] bg-[#FAF6F0] px-3 py-1.5 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#EFE6D8]"
            >
              <UploadCloud className="h-3.5 w-3.5 text-[#78716C]" />
              <span className="hidden sm:inline">Upload File</span>
              <span className="sm:hidden">Upload</span>
            </button>

            <button
              type="button"
              onClick={handlePaste}
              className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DCCB] bg-[#FAF6F0] px-3 py-1.5 text-xs font-medium text-[#1C1917] transition-colors hover:bg-[#EFE6D8]"
            >
              <ClipboardCopy className="h-3.5 w-3.5 text-[#78716C]" />
              <span>Paste</span>
            </button>

            {text && (
              <button
                type="button"
                onClick={handleClear}
                className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs font-medium text-[#78716C] transition-colors hover:bg-[#FEF2F2] hover:text-[#DC2626]"
                title="Clear text"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Clear</span>
              </button>
            )}
          </div>
        </div>

        {/* Upload success notification */}
        {uploadedFileName && (
          <div className="flex items-center justify-between border-b border-[#E8DCCB] bg-[#F7F1E8]/70 px-4 py-2 text-xs text-[#1C1917] sm:px-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-[#16A34A]" />
              <span>File uploaded successfully:</span>
              <span className="font-semibold text-[#1C1917]">{uploadedFileName}</span>
            </div>
            <button
              onClick={() => setUploadedFileName(null)}
              className="text-[#78716C] hover:text-[#1C1917]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Textarea */}
        <div className="relative p-4 sm:p-6">
          <textarea
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              if (errorMsg) setErrorMsg(null);
            }}
            placeholder="Paste or type your text here, or drag and drop a .txt, .md, or .csv file into this area..."
            className="min-h-[280px] sm:min-h-[340px] w-full resize-y border-none bg-transparent font-normal text-base leading-relaxed text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-0"
            disabled={isAnalyzing}
          />
        </div>

        {/* Editor Footer / Count Action */}
        <div className="flex flex-col gap-3 border-t border-[#E8DCCB] bg-[#FAF6F0]/70 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            {user ? (
              <span className="text-xs text-[#78716C]">
                Balance: <strong className="text-[#1C1917]">{credits}</strong> / {user.max_credits} credits ({user.plan === 'pro_plus' ? 'Pro Plus' : user.plan === 'pro' ? 'Pro' : 'Free'} plan)
              </span>
            ) : (
              <span className="text-xs text-[#78716C]">
                Sign in required to execute analysis
              </span>
            )}
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-3">
            {analysisStatus && (
              <span className="text-xs font-medium text-[#16A34A] animate-pulse">
                {analysisStatus}
              </span>
            )}

            {isZeroCredits ? (
              <Link
                href="/dashboard/billing"
                prefetch={false}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#DC2626] px-6 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-[#B91C1C] transition-all"
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Upgrade Plan</span>
              </Link>
            ) : (
              <button
                type="button"
                onClick={handleCount}
                disabled={isAnalyzing}
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#1C1917] px-6 py-2.5 text-xs font-semibold text-[#F7F1E8] shadow-sm hover:bg-[#2D231E] active:scale-[0.99] transition-all"
              >
                {isAnalyzing ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin text-[#F7F1E8]" />
                    <span>Analyzing your text...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5 text-[#C26732]" />
                    <span>Count Text</span>
                    {!isPublicDemo && user && (
                      <span className="ml-1 rounded bg-[#2D231E] px-1.5 py-0.5 text-[10px] text-[#D9CBBA]">
                        1 credit
                      </span>
                    )}
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error display */}
      {errorMsg && (
        <div className="mt-3 flex items-center gap-2 rounded-xl border border-[#DC2626]/20 bg-[#FEF2F2] p-3 text-xs text-[#B91C1C]">
          <AlertTriangle className="h-4 w-4 shrink-0 text-[#DC2626]" />
          <span>{errorMsg}</span>
        </div>
      )}
    </div>
  );
}
