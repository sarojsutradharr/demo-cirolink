'use client';

import React, { useState } from 'react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { TextEditor } from '@/components/word-counter/TextEditor';
import { ResultsDashboard } from '@/components/word-counter/ResultsDashboard';
import { TextAnalysisStats } from '@/types';

export default function WordCounterPage() {
  const [currentStats, setCurrentStats] = useState<TextAnalysisStats | null>(null);
  const [currentText, setCurrentText] = useState<string>('');
  const [currentTitle, setCurrentTitle] = useState<string>('Document Analysis');

  const handleAnalysisComplete = (stats: TextAnalysisStats, rawText: string, title: string) => {
    setCurrentStats(stats);
    setCurrentText(rawText);
    setCurrentTitle(title);
  };

  return (
    <div className="flex-1">
      <DashboardHeader
        title="Word Counter & Text Analyzer"
        subtitle="Paste, type, or upload a document to calculate density, readability, and frequency."
      />

      <div className="p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
        {/* Flagship Text Editor */}
        <TextEditor onAnalysisComplete={handleAnalysisComplete} />

        {/* Results Dashboard appears after counting */}
        {currentStats && (
          <div className="mt-8 border-t border-[#E8DCCB] pt-8">
            <ResultsDashboard
              stats={currentStats}
              textTitle={currentTitle}
              rawText={currentText}
            />
          </div>
        )}
      </div>
    </div>
  );
}
