'use client';

import React, { useState, useMemo } from 'react';
import { TextAnalysisStats } from '@/types';
import { COMMON_STOP_WORDS } from '@/lib/word-counter/analyzer';
import {
  FileText,
  Clock,
  Mic,
  Copy,
  Download,
  Check,
  Search,
  Filter,
  BarChart2
} from 'lucide-react';

interface ResultsDashboardProps {
  stats: TextAnalysisStats;
  textTitle?: string;
  rawText?: string;
}

export function ResultsDashboard({ stats, textTitle = 'Text Analysis', rawText = '' }: ResultsDashboardProps) {
  const [filterStopWords, setFilterStopWords] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [copiedSummary, setCopiedSummary] = useState(false);

  // Filtered frequency table
  const displayedFrequency = useMemo(() => {
    return stats.frequency.filter((item) => {
      if (filterStopWords && COMMON_STOP_WORDS.has(item.word.toLowerCase())) {
        return false;
      }
      if (searchTerm && !item.word.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      return true;
    });
  }, [stats.frequency, filterStopWords, searchTerm]);

  // Max count for visual frequency bar scaling
  const maxWordCount = stats.frequency[0]?.count || 1;

  // Copy full summary to clipboard
  const handleCopySummary = async () => {
    const summary = `
=== CIROLINK.COM TEXT ANALYSIS SUMMARY ===
Document: ${textTitle}
Words: ${stats.words.toLocaleString()}
Characters (with spaces): ${stats.characters.toLocaleString()}
Characters (no spaces): ${stats.charactersNoSpaces.toLocaleString()}
Sentences: ${stats.sentences.toLocaleString()}
Paragraphs: ${stats.paragraphs.toLocaleString()}
Lines: ${stats.lines.toLocaleString()}
Reading Time: ${stats.readingTimeDisplay} (at 225 wpm)
Speaking Time: ${stats.speakingTimeDisplay} (at 130 wpm)
Average Word Length: ${stats.avgWordLength} characters
Average Sentence Length: ${stats.avgSentenceLength} words
Unique Words: ${stats.uniqueWords.toLocaleString()}
Repeated Words: ${stats.repeatedWords.toLocaleString()}
Longest Word: ${stats.longestWord}
Shortest Word: ${stats.shortestWord}
==========================================
    `.trim();

    try {
      await navigator.clipboard.writeText(summary);
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2000);
    } catch {
      // Fallback
    }
  };

  // Export CSV
  const handleExportCSV = () => {
    const rows = [
      ['Metric', 'Value'],
      ['Document Title', textTitle],
      ['Words', stats.words],
      ['Characters', stats.characters],
      ['Characters (No Spaces)', stats.charactersNoSpaces],
      ['Letters', stats.letters],
      ['Numbers', stats.numbers],
      ['Spaces', stats.spaces],
      ['Punctuation', stats.punctuation],
      ['Sentences', stats.sentences],
      ['Paragraphs', stats.paragraphs],
      ['Lines', stats.lines],
      ['Average Word Length', stats.avgWordLength],
      ['Average Sentence Length', stats.avgSentenceLength],
      ['Longest Word', `"${stats.longestWord}"`],
      ['Shortest Word', `"${stats.shortestWord}"`],
      ['Unique Words', stats.uniqueWords],
      ['Repeated Words', stats.repeatedWords],
      ['Reading Time', stats.readingTimeDisplay],
      ['Speaking Time', stats.speakingTimeDisplay],
      ['', ''],
      ['Word Frequency', 'Count', 'Percentage (%)'],
      ...stats.frequency.map((f) => [`"${f.word}"`, f.count, `${f.percentage}%`]),
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map((e) => e.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${textTitle.replace(/\s+/g, '_')}_cirolink_analysis.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify({ title: textTitle, stats }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${textTitle.replace(/\s+/g, '_')}_cirolink_analysis.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 pt-6">
      {/* Header & Export Actions */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E8DCCB] pb-4">
        <div>
          <h2 className="text-lg font-bold tracking-tight text-[#1C1917]">
            Analysis Results
          </h2>
          <p className="text-xs text-[#78716C]">
            Detailed metrics for <span className="font-medium text-[#1C1917]">&ldquo;{textTitle}&rdquo;</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DCCB] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1917] shadow-xs transition-colors hover:bg-[#FAF6F0]"
          >
            {copiedSummary ? (
              <>
                <Check className="h-3.5 w-3.5 text-[#16A34A]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="h-3.5 w-3.5 text-[#78716C]" />
                <span>Copy Summary</span>
              </>
            )}
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DCCB] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1917] shadow-xs transition-colors hover:bg-[#FAF6F0]"
            title="Download CSV"
          >
            <Download className="h-3.5 w-3.5 text-[#78716C]" />
            <span>CSV</span>
          </button>

          <button
            onClick={handleExportJSON}
            className="inline-flex items-center gap-1.5 rounded-lg border border-[#E8DCCB] bg-white px-3 py-1.5 text-xs font-medium text-[#1C1917] shadow-xs transition-colors hover:bg-[#FAF6F0]"
            title="Download JSON"
          >
            <Download className="h-3.5 w-3.5 text-[#78716C]" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Top Priority Statistics Cards (Section 12 of spec) */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="rounded-xl border border-[#E8DCCB] bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-[#78716C]">Words</span>
          <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-[#1C1917]">
            {stats.words.toLocaleString()}
          </p>
          <span className="mt-1 text-[11px] text-[#A8A29E]">Total words</span>
        </div>

        <div className="rounded-xl border border-[#E8DCCB] bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-[#78716C]">Characters</span>
          <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-[#1C1917]">
            {stats.characters.toLocaleString()}
          </p>
          <span className="mt-1 text-[11px] text-[#A8A29E]">With spaces</span>
        </div>

        <div className="rounded-xl border border-[#E8DCCB] bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-[#78716C]">Char (No Spaces)</span>
          <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-[#1C1917]">
            {stats.charactersNoSpaces.toLocaleString()}
          </p>
          <span className="mt-1 text-[11px] text-[#A8A29E]">Pure characters</span>
        </div>

        <div className="rounded-xl border border-[#E8DCCB] bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-[#78716C]">Sentences</span>
          <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-[#1C1917]">
            {stats.sentences.toLocaleString()}
          </p>
          <span className="mt-1 text-[11px] text-[#A8A29E]">Full sentences</span>
        </div>

        <div className="rounded-xl border border-[#E8DCCB] bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-[#78716C]">Paragraphs</span>
          <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-[#1C1917]">
            {stats.paragraphs.toLocaleString()}
          </p>
          <span className="mt-1 text-[11px] text-[#A8A29E]">Text blocks</span>
        </div>

        <div className="rounded-xl border border-[#E8DCCB] bg-white p-4 shadow-xs">
          <span className="text-xs font-medium text-[#78716C]">Reading Time</span>
          <p className="mt-2 text-2xl font-bold tracking-tight tabular-nums text-[#C26732]">
            {stats.readingTimeDisplay}
          </p>
          <span className="mt-1 text-[11px] text-[#A8A29E]">At 225 wpm</span>
        </div>
      </div>

      {/* Additional Statistics Section (Section 10 of spec) */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left: Detailed Character & Structural Breakdown */}
        <div className="rounded-2xl border border-[#E8DCCB] bg-white p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-[#1C1917] border-b border-[#E8DCCB] pb-3">
            Structural Breakdown
          </h3>
          <div className="mt-3 divide-y divide-[#E8DCCB]/60 text-xs">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#57534E]">Letters (A-Z)</span>
              <strong className="font-semibold tabular-nums text-[#1C1917]">
                {stats.letters.toLocaleString()}
              </strong>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#57534E]">Numbers (0-9)</span>
              <strong className="font-semibold tabular-nums text-[#1C1917]">
                {stats.numbers.toLocaleString()}
              </strong>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#57534E]">Spaces & Whitespace</span>
              <strong className="font-semibold tabular-nums text-[#1C1917]">
                {stats.spaces.toLocaleString()}
              </strong>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#57534E]">Punctuation Marks</span>
              <strong className="font-semibold tabular-nums text-[#1C1917]">
                {stats.punctuation.toLocaleString()}
              </strong>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#57534E]">Total Lines</span>
              <strong className="font-semibold tabular-nums text-[#1C1917]">
                {stats.lines.toLocaleString()}
              </strong>
            </div>
          </div>
        </div>

        {/* Right: Vocabulary & Pacing Metrics */}
        <div className="rounded-2xl border border-[#E8DCCB] bg-white p-5 shadow-xs">
          <h3 className="text-sm font-semibold text-[#1C1917] border-b border-[#E8DCCB] pb-3">
            Vocabulary & Pacing
          </h3>
          <div className="mt-3 divide-y divide-[#E8DCCB]/60 text-xs">
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#57534E]">Average Word Length</span>
              <strong className="font-semibold tabular-nums text-[#1C1917]">
                {stats.avgWordLength} characters
              </strong>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#57534E]">Average Sentence Length</span>
              <strong className="font-semibold tabular-nums text-[#1C1917]">
                {stats.avgSentenceLength} words
              </strong>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#57534E]">Unique Words</span>
              <strong className="font-semibold tabular-nums text-[#1C1917]">
                {stats.uniqueWords.toLocaleString()}
                <span className="ml-1 font-normal text-[#78716C]">
                  ({stats.words > 0 ? Math.round((stats.uniqueWords / stats.words) * 100) : 0}%)
                </span>
              </strong>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#57534E]">Repeated Words</span>
              <strong className="font-semibold tabular-nums text-[#1C1917]">
                {stats.repeatedWords.toLocaleString()}
              </strong>
            </div>
            <div className="flex items-center justify-between py-2.5">
              <span className="text-[#57534E]">Speaking Time</span>
              <strong className="font-semibold tabular-nums text-[#1C1917]">
                {stats.speakingTimeDisplay}
                <span className="ml-1 font-normal text-[#78716C]">(at 130 wpm)</span>
              </strong>
            </div>
          </div>
        </div>
      </div>

      {/* Extremes: Longest & Shortest Words */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
            Longest Word
          </span>
          <p className="mt-1 font-mono text-sm font-semibold text-[#1C1917] break-all">
            {stats.longestWord || '—'}
          </p>
          <span className="text-[11px] text-[#A8A29E]">
            {stats.longestWord ? `${stats.longestWord.length} characters` : ''}
          </span>
        </div>

        <div className="rounded-xl border border-[#E8DCCB] bg-[#FAF6F0] p-4">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#78716C]">
            Shortest Word
          </span>
          <p className="mt-1 font-mono text-sm font-semibold text-[#1C1917] break-all">
            {stats.shortestWord || '—'}
          </p>
          <span className="text-[11px] text-[#A8A29E]">
            {stats.shortestWord ? `${stats.shortestWord.length} character(s)` : ''}
          </span>
        </div>
      </div>

      {/* Word Frequency Section (Section 11 of spec) */}
      <div className="rounded-2xl border border-[#E8DCCB] bg-white p-5 shadow-xs">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-[#E8DCCB] pb-4">
          <div>
            <h3 className="text-sm font-bold text-[#1C1917]">
              Word Frequency Analysis
            </h3>
            <p className="text-xs text-[#78716C]">
              Distribution of repeated terms in your document
            </p>
          </div>

          {/* Controls: Search & Stop Words Toggle */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2 h-3.5 w-3.5 text-[#78716C]" />
              <input
                type="text"
                placeholder="Search word..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="rounded-lg border border-[#E8DCCB] bg-[#FAF6F0] py-1.5 pl-8 pr-3 text-xs text-[#1C1917] placeholder-[#A8A29E] focus:outline-none focus:ring-1 focus:ring-[#1C1917]"
              />
            </div>

            <button
              onClick={() => setFilterStopWords(!filterStopWords)}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors ${
                filterStopWords
                  ? 'bg-[#1C1917] text-[#F7F1E8]'
                  : 'border border-[#E8DCCB] bg-white text-[#57534E] hover:bg-[#FAF6F0]'
              }`}
            >
              <Filter className="h-3 w-3" />
              <span>Exclude Stop Words</span>
            </button>
          </div>
        </div>

        {/* Visual Bar Chart for Top 10 Words */}
        {stats.frequency.length > 0 && (
          <div className="mt-5 border-b border-[#E8DCCB] pb-6">
            <h4 className="text-xs font-semibold text-[#57534E] uppercase tracking-wider mb-3">
              Top Frequent Terms
            </h4>
            <div className="space-y-2">
              {stats.frequency.slice(0, 8).map((item) => {
                const percentageOfMax = Math.round((item.count / maxWordCount) * 100);
                return (
                  <div key={item.word} className="flex items-center gap-3 text-xs">
                    <span className="w-24 shrink-0 font-medium text-[#1C1917] truncate text-right">
                      {item.word}
                    </span>
                    <div className="flex-1 h-5 bg-[#FAF6F0] rounded overflow-hidden relative">
                      <div
                        className="h-full bg-[#E5D9C8] transition-all duration-500 rounded"
                        style={{ width: `${Math.max(percentageOfMax, 5)}%` }}
                      />
                      <span className="absolute inset-y-0 left-2 flex items-center font-mono text-[11px] font-semibold text-[#1C1917]">
                        {item.count} ({item.percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Clean Table */}
        <div className="mt-4 overflow-x-auto">
          {displayedFrequency.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#78716C]">
              No words match the current filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#E8DCCB] text-[#78716C]">
                  <th className="py-2.5 font-semibold">Word</th>
                  <th className="py-2.5 text-right font-semibold">Count</th>
                  <th className="py-2.5 text-right font-semibold">Percentage</th>
                  <th className="py-2.5 text-right font-semibold">Distribution</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#E8DCCB]/60">
                {displayedFrequency.slice(0, 30).map((item, idx) => (
                  <tr key={`${item.word}-${idx}`} className="hover:bg-[#FAF6F0]/60 transition-colors">
                    <td className="py-2 font-medium text-[#1C1917]">
                      {item.word}
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums text-[#1C1917]">
                      {item.count.toLocaleString()}
                    </td>
                    <td className="py-2 text-right font-mono tabular-nums text-[#78716C]">
                      {item.percentage}%
                    </td>
                    <td className="py-2 text-right">
                      <div className="inline-block h-2 w-16 bg-[#FAF6F0] rounded overflow-hidden">
                        <div
                          className="h-full bg-[#C26732]"
                          style={{
                            width: `${Math.min(100, Math.max(8, (item.count / maxWordCount) * 100))}%`,
                          }}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}
