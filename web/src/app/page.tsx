'use client';

import { useState, useEffect, useCallback, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { AutoonDocument } from '@/types/autoon';
import { EXAMPLES } from '@/lib/examples';
import { toonToJson, jsonToToon } from '@/lib/toon';
import { validateAutoon } from '@/lib/validation';
import { compressToBase64url, decompressFromBase64url } from '@/lib/compression';

// Dynamic imports for client-only components
const CodeEditor = dynamic(() => import('@/components/CodeEditor'), { ssr: false });
const GraphEditor = dynamic(() => import('@/components/GraphEditor'), { ssr: false });

type Format = 'toon' | 'json';

function AutoonApp() {
  const [content, setContent] = useState('');
  const [format, setFormat] = useState<Format>('toon');
  const [document, setDocument] = useState<AutoonDocument | null>(null);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [showExamples, setShowExamples] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load from URL hash or default example
  useEffect(() => {
    const loadInitial = async () => {
      const hash = window.location.hash;
      let initialContent = jsonToToon(EXAMPLES.process);

      if (hash && hash.startsWith('#data=')) {
        try {
          const decoded = await decompressFromBase64url(hash.slice(6));
          initialContent = decoded;
          if (decoded.trim().startsWith('{')) {
            setFormat('json');
          }
          showToast('Loaded from shared URL', 'success');
        } catch (e) {
          console.error('Failed to load from URL:', e);
        }
      }

      setContent(initialContent);
      setIsLoading(false);
    };

    loadInitial();
  }, []);

  // Parse and validate content
  useEffect(() => {
    if (!content.trim()) {
      setDocument(null);
      setIsValid(null);
      return;
    }

    try {
      const doc = format === 'json' ? JSON.parse(content) : toonToJson(content);
      setDocument(doc);
      const result = validateAutoon(doc);
      setIsValid(result.valid);
    } catch {
      setIsValid(false);
    }
  }, [content, format]);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleFormatChange = (newFormat: Format) => {
    if (newFormat === format || !document) return;

    try {
      if (newFormat === 'json') {
        setContent(JSON.stringify(document, null, 2));
      } else {
        setContent(jsonToToon(document));
      }
      setFormat(newFormat);
    } catch (e) {
      console.error('Format conversion error:', e);
    }
  };

  const handleExampleLoad = (key: string) => {
    const example = EXAMPLES[key];
    if (example) {
      setDocument(example);
      setContent(format === 'json' ? JSON.stringify(example, null, 2) : jsonToToon(example));
      setShowExamples(false);
    }
  };

  const handleShare = async () => {
    if (!content.trim()) {
      showToast('Nothing to share', 'error');
      return;
    }

    try {
      const compressed = await compressToBase64url(content);
      const url = new URL(window.location.href);
      url.hash = 'data=' + compressed;
      await navigator.clipboard.writeText(url.toString());
      window.history.replaceState(null, '', url.toString());
      showToast('URL copied to clipboard!', 'success');
    } catch (e) {
      showToast(`Failed to share: ${e}`, 'error');
    }
  };

  const handleGraphSync = useCallback((doc: AutoonDocument) => {
    setDocument(doc);
    setContent(format === 'json' ? JSON.stringify(doc, null, 2) : jsonToToon(doc));
    showToast('Synced from graph', 'success');
  }, [format]);

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0c10]">
        <div className="text-[#8b9cb6]">Loading...</div>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col bg-[#0a0c10]">
      {/* Background gradient */}
      <div className="fixed inset-0 pointer-events-none -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0c10] to-[#0d1017]" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[60%] bg-gradient-radial from-cyan-500/8 to-transparent opacity-50" />
        <div className="absolute bottom-0 right-0 w-1/2 h-1/2 bg-gradient-radial from-violet-500/5 to-transparent opacity-50" />
      </div>

      {/* Header */}
      <header className="flex items-center justify-between px-6 py-3 bg-[#12151c]/95 backdrop-blur-xl border-b border-[#2a3342] z-50">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-[10px] bg-gradient-to-br from-cyan-400 to-violet-500 flex items-center justify-center font-bold text-lg text-[#0a0c10] shadow-lg shadow-cyan-500/30">
            A
          </div>
          <h1 className="text-xl font-semibold bg-gradient-to-r from-[#e8ecf4] to-[#8b9cb6] bg-clip-text text-transparent">
            Autoon
          </h1>
          <span className="text-xs text-[#5a6a84] px-2 py-0.5 bg-[#1a1f2a] rounded-full">v0.1</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Examples dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowExamples(!showExamples)}
              className="flex items-center gap-2 px-4 py-2 text-sm bg-[#1a1f2a] hover:bg-[#242b3a] border border-[#2a3342] hover:border-[#4a90d9] rounded-lg text-[#e8ecf4] transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Examples
            </button>

            {showExamples && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-[#1a1f2a] border border-[#2a3342] rounded-lg shadow-xl z-50 overflow-hidden">
                {Object.entries({
                  class: { label: 'Class Diagram', color: '#3b82f6' },
                  instance: { label: 'Instance Diagram', color: '#10b981' },
                  process: { label: 'Process Flow', color: '#f59e0b' },
                  workflow: { label: 'Workflow', color: '#8b5cf6' },
                }).map(([key, { label, color }]) => (
                  <button
                    key={key}
                    onClick={() => handleExampleLoad(key)}
                    className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-[#e8ecf4] hover:bg-[#242b3a] transition-colors"
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                    {label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Share button */}
          <button
            onClick={handleShare}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-gradient-to-r from-[#0e7490] to-[#22d3ee] hover:brightness-110 rounded-lg text-[#0a0c10] transition-all shadow-lg shadow-cyan-500/20"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
              <polyline points="16,6 12,2 8,6" />
              <line x1="12" y1="2" x2="12" y2="15" />
            </svg>
            Share
          </button>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 grid grid-cols-[420px_1fr] gap-px bg-[#2a3342] overflow-hidden">
        {/* Editor panel */}
        <div className="flex flex-col bg-[#12151c]">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1a1f2a] border-b border-[#2a3342]">
            <div className="flex items-center gap-2 text-sm text-[#8b9cb6]">
              <span className="w-2 h-2 rounded-full bg-cyan-400" />
              Editor
            </div>
            <div className="flex gap-0.5 p-0.5 bg-[#0a0c10] rounded-lg">
              <button
                onClick={() => handleFormatChange('toon')}
                className={`px-3 py-1 text-xs uppercase tracking-wide rounded transition-all ${
                  format === 'toon'
                    ? 'bg-cyan-400 text-[#0a0c10] font-semibold'
                    : 'text-[#5a6a84] hover:text-[#8b9cb6]'
                }`}
              >
                TOON
              </button>
              <button
                onClick={() => handleFormatChange('json')}
                className={`px-3 py-1 text-xs uppercase tracking-wide rounded transition-all ${
                  format === 'json'
                    ? 'bg-cyan-400 text-[#0a0c10] font-semibold'
                    : 'text-[#5a6a84] hover:text-[#8b9cb6]'
                }`}
              >
                JSON
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <CodeEditor value={content} onChange={setContent} className="h-full" />
          </div>

          <div className="flex items-center justify-between px-4 py-2 bg-[#1a1f2a] border-t border-[#2a3342] text-xs text-[#5a6a84]">
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  isValid === null ? 'bg-amber-400' : isValid ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              {isValid === null ? 'Ready' : isValid ? 'Valid' : 'Invalid'}
            </div>
            <span>{content.length} chars</span>
          </div>
        </div>

        {/* Graph panel */}
        <div className="flex flex-col bg-[#12151c]">
          <div className="flex items-center justify-between px-4 py-3 bg-[#1a1f2a] border-b border-[#2a3342]">
            <div className="flex items-center gap-2 text-sm text-[#8b9cb6]">
              <span className="w-2 h-2 rounded-full bg-violet-400" />
              Graph Editor
            </div>
          </div>

          <div className="flex-1 overflow-hidden">
            <GraphEditor document={document} onSync={handleGraphSync} />
          </div>
        </div>
      </main>

      {/* Toast notification */}
      {toast && (
        <div
          className={`fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 bg-[#1a1f2a] border rounded-lg shadow-xl text-sm text-[#e8ecf4] z-50 animate-fade-in ${
            toast.type === 'success' ? 'border-emerald-500' : 'border-rose-500'
          }`}
        >
          {toast.message}
        </div>
      )}

      {/* Click outside to close examples */}
      {showExamples && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowExamples(false)}
        />
      )}
    </div>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div className="h-screen flex items-center justify-center bg-[#0a0c10] text-[#8b9cb6]">Loading...</div>}>
      <AutoonApp />
    </Suspense>
  );
}
