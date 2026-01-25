'use client';

import { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { HiSearch, HiChevronDown } from 'react-icons/hi';
import Header from '@/components/Header';
import {
  EXAMPLES,
  Example,
} from '@/lib/examples';
import { decode } from '@toon-format/toon';

// Estimate token count (rough approximation: ~4 chars per token for code/JSON)
function estimateTokens(text: string): number {
  if (!text) return 0;
  // More accurate: count word-like tokens and punctuation
  const tokens = text.match(/[\w]+|[^\s\w]/g);
  return tokens ? tokens.length : 0;
}

// Format number with commas
function formatNumber(n: number): string {
  return n.toLocaleString();
}

// Compress string to base64url using CompressionStream
async function compressToBase64url(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);

  const cs = new CompressionStream('deflate');
  const writer = cs.writable.getWriter();
  writer.write(data);
  writer.close();

  const compressedChunks: Uint8Array[] = [];
  const reader = cs.readable.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    compressedChunks.push(value);
  }

  const totalLength = compressedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const compressed = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of compressedChunks) {
    compressed.set(chunk, offset);
    offset += chunk.length;
  }

  // Convert to base64url
  const base64 = btoa(String.fromCharCode(...compressed));
  return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

// Decompress base64url to string using DecompressionStream
async function decompressFromBase64url(base64url: string): Promise<string> {
  // Convert base64url to base64
  let base64 = base64url.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) base64 += '=';

  const binary = atob(base64);
  const data = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    data[i] = binary.charCodeAt(i);
  }

  const ds = new DecompressionStream('deflate');
  const writer = ds.writable.getWriter();
  writer.write(data);
  writer.close();

  const decompressedChunks: Uint8Array[] = [];
  const reader = ds.readable.getReader();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    decompressedChunks.push(value);
  }

  const totalLength = decompressedChunks.reduce((acc, chunk) => acc + chunk.length, 0);
  const decompressed = new Uint8Array(totalLength);
  let offset = 0;
  for (const chunk of decompressedChunks) {
    decompressed.set(chunk, offset);
    offset += chunk.length;
  }

  const decoder = new TextDecoder();
  return decoder.decode(decompressed);
}

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), { ssr: false });

function AutoonApp() {
  const [toonContent, setToonContent] = useState('');
  const [jsonContent, setJsonContent] = useState<Record<string, unknown> | null>(null);
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const [leftPanelWidth, setLeftPanelWidth] = useState(450);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isLoadingFromExample, setIsLoadingFromExample] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Filter examples based on search query
  const filteredExamples = useMemo(() => {
    if (!searchQuery.trim()) return EXAMPLES;
    const query = searchQuery.toLowerCase();
    return EXAMPLES.filter(
      (ex) =>
        ex.name.toLowerCase().includes(query) ||
        ex.category.toLowerCase().includes(query)
    );
  }, [searchQuery]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle dragging
  useEffect(() => {
    if (!isDragging) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const containerRect = containerRef.current.getBoundingClientRect();
      const newWidth = e.clientX - containerRect.left;
      setLeftPanelWidth(Math.max(300, Math.min(containerRect.width - 400, newWidth)));
    };

    const handleMouseUp = () => {
      setIsDragging(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [isDragging]);

  // Load example helper (defined before useEffect that uses it)
  const loadExample = useCallback((example: Example) => {
    setIsLoadingFromExample(true);
    setSelectedExample(example);
    setToonContent(example.toon);
    setJsonContent(example.json);
    // Clear URL fragment when loading an example
    window.history.replaceState(null, '', window.location.pathname);
    // Reset flag after state updates
    setTimeout(() => setIsLoadingFromExample(false), 0);
  }, []);

  // Load from URL fragment or default example on mount
  useEffect(() => {
    const loadInitial = async () => {
      const hash = window.location.hash.slice(1);
      if (hash) {
        try {
          const decompressed = await decompressFromBase64url(hash);
          setToonContent(decompressed);
          // Try to parse and detect type
          try {
            const parsed = decode(decompressed);
            setJsonContent(parsed as Record<string, unknown>);
          } catch {
            // If parsing fails, just show the toon content
            setJsonContent(null);
          }
          setSelectedExample(null);
        } catch {
          // If decompression fails, load default example
          loadExample(EXAMPLES.find((e) => e.id === 'person-instance') || EXAMPLES[0]);
        }
      } else {
        loadExample(EXAMPLES.find((e) => e.id === 'person-instance') || EXAMPLES[0]);
      }
      setInitialized(true);
    };
    loadInitial();
  }, [loadExample]);

  // Update URL fragment when toon content changes (debounced)
  const updateUrlFragment = useCallback(async (content: string) => {
    if (!content) {
      window.history.replaceState(null, '', window.location.pathname);
      return;
    }
    try {
      const compressed = await compressToBase64url(content);
      window.history.replaceState(null, '', `#${compressed}`);
    } catch {
      // Ignore compression errors
    }
  }, []);

  // Handle toon content changes from editor
  const handleToonChange = useCallback((newContent: string) => {
    setToonContent(newContent);

    // If not loading from example, clear selection and update URL
    if (!isLoadingFromExample && initialized) {
      setSelectedExample(null);

      // Try to parse the new content
      try {
        const parsed = decode(newContent);
        setJsonContent(parsed as Record<string, unknown>);
      } catch {
        // Keep previous JSON if parsing fails
      }

      // Debounce URL update
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
      urlUpdateTimeoutRef.current = setTimeout(() => {
        updateUrlFragment(newContent);
      }, 500);
    }
  }, [isLoadingFromExample, initialized, updateUrlFragment]);

  // Calculate stats for TOON and JSON
  const jsonString = jsonContent ? JSON.stringify(jsonContent, null, 2) : '';
  const toonStats = useMemo(() => ({
    chars: toonContent.length,
    tokens: estimateTokens(toonContent),
  }), [toonContent]);

  const jsonStats = useMemo(() => ({
    chars: jsonString.length,
    tokens: estimateTokens(jsonString),
  }), [jsonString]);

  const percentChange = useMemo(() => {
    if (jsonStats.chars === 0) return 0;
    return ((toonStats.chars - jsonStats.chars) / jsonStats.chars) * 100;
  }, [toonStats.chars, jsonStats.chars]);

  // Get category label for display
  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'schema': return 'Data Validation';
      case 'instance': return 'Data Representation';
      case 'generative-ui': return 'Interface Definition';
      case 'nodal-ui': return 'Workflow Representation';
      default: return category;
    }
  };

  // Get category color styles
  const getCategoryStyles = (category: string) => {
    switch (category) {
      case 'schema':
        return {
          backgroundColor: 'rgba(255, 173, 102, 0.1)',
          border: '1px solid rgba(255, 173, 102, 0.3)',
          color: '#FFAD66'
        };
      case 'instance':
        return {
          backgroundColor: 'rgba(213, 255, 128, 0.1)',
          border: '1px solid rgba(213, 255, 128, 0.3)',
          color: '#D5FF80'
        };
      case 'generative-ui':
        return {
          backgroundColor: 'rgba(115, 208, 255, 0.1)',
          border: '1px solid rgba(115, 208, 255, 0.3)',
          color: '#73D0FF'
        };
      default:
        return {
          backgroundColor: 'rgba(212, 191, 255, 0.1)',
          border: '1px solid rgba(212, 191, 255, 0.3)',
          color: '#D4BFFF'
        };
    }
  };

  return (
    <div className="h-screen flex flex-col dark" data-theme="dark" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      <Header />

      {/* Main content - 2 panels */}
      <main ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Left Panel - Toon Editor */}
        <div className="flex flex-col" style={{ width: leftPanelWidth, backgroundColor: 'var(--color-bg-surface)' }}>
          {/* TOON Stats Bar */}
          <div
            className="flex items-center gap-4 text-xs font-mono"
            style={{
              height: '40px',
              padding: '0 16px',
              backgroundColor: 'var(--color-bg-elevated)',
              borderBottom: '1px solid var(--color-border-muted)',
              color: 'var(--color-text-muted)'
            }}
          >
            <span>TOON</span>
            <span style={{ color: 'var(--color-text-subtle)' }}>|</span>
            <span>{formatNumber(toonStats.chars)} chars</span>
            <span>{formatNumber(toonStats.tokens)} tokens</span>
            {jsonStats.chars > 0 && (
              <span
                style={{
                  color: percentChange <= 0 ? '#95D660' : '#FF6B6B',
                  fontWeight: 500
                }}
              >
                {percentChange <= 0 ? '' : '+'}{percentChange.toFixed(1)}%
              </span>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={toonContent}
              onChange={handleToonChange}
              className="h-full"
              language="toon"
            />
          </div>
        </div>

        {/* Divider */}
        <div
          className={`autoon-divider ${isDragging ? 'autoon-divider-active' : ''}`}
          onMouseDown={() => setIsDragging(true)}
        />

        {/* Right Panel - JSON */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
          {/* JSON Stats Bar */}
          <div
            className="flex items-center justify-between"
            style={{
              height: '40px',
              padding: '0 16px',
              backgroundColor: 'var(--color-bg-elevated)',
              borderBottom: '1px solid var(--color-border-muted)'
            }}
          >
            {/* Stats - on left */}
            <div className="flex items-center gap-4 text-xs font-mono" style={{ color: 'var(--color-text-muted)' }}>
              <span>JSON</span>
              <span style={{ color: 'var(--color-text-subtle)' }}>|</span>
              <span>{formatNumber(jsonStats.chars)} chars</span>
              <span>{formatNumber(jsonStats.tokens)} tokens</span>
            </div>

            {/* Examples selector - on right */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="flex items-center gap-2 text-sm font-medium transition-colors"
                style={{
                  color: 'var(--color-text-primary)',
                  padding: '0.375rem 0'
                }}
              >
                <span>{selectedExample?.name || 'Select an example'}</span>
                <HiChevronDown
                  className={`w-3.5 h-3.5 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`}
                  style={{ color: 'var(--color-text-muted)' }}
                />
              </button>

              {isDropdownOpen && (
                <div
                  className="absolute top-full right-0 mt-2 w-80 rounded-lg shadow-lg z-50 overflow-hidden"
                  style={{
                    backgroundColor: 'var(--color-bg-elevated)',
                    border: '1px solid var(--color-border-muted)'
                  }}
                >
                  {/* Search input */}
                  <div style={{ padding: '12px 12px 8px 12px' }}>
                    <div
                      className="flex items-center gap-3 rounded"
                      style={{
                        padding: '10px 12px',
                        backgroundColor: 'var(--color-bg-surface)',
                        border: '1px solid var(--color-border-default)'
                      }}
                    >
                      <HiSearch className="w-4 h-4 flex-shrink-0" style={{ color: 'var(--color-text-subtle)' }} />
                      <input
                        type="text"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        placeholder="Search examples..."
                        autoFocus
                        className="w-full text-sm outline-none bg-transparent"
                        style={{ color: 'var(--color-text-primary)' }}
                      />
                    </div>
                  </div>

                  {/* Results list */}
                  <div className="max-h-64 overflow-y-auto" style={{ padding: '4px 0 12px 0' }}>
                    {filteredExamples.length === 0 ? (
                      <div style={{ padding: '16px', textAlign: 'center', color: 'var(--color-text-subtle)', fontSize: '14px' }}>
                        No examples found
                      </div>
                    ) : (
                      filteredExamples.map((example) => (
                        <button
                          key={example.id}
                          onClick={() => {
                            loadExample(example);
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className="w-full text-left text-sm transition-colors flex items-center justify-between"
                          style={{
                            padding: '10px 16px',
                            gap: '16px',
                            backgroundColor: selectedExample?.id === example.id ? 'var(--color-interactive-hover)' : 'transparent',
                            color: selectedExample?.id === example.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedExample?.id !== example.id) {
                              e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedExample?.id !== example.id) {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }
                          }}
                        >
                          <span className="truncate">{example.name}</span>
                          <span
                            className="text-xs font-medium rounded flex-shrink-0"
                            style={{
                              padding: '4px 10px',
                              ...getCategoryStyles(example.category)
                            }}
                          >
                            {getCategoryLabel(example.category)}
                          </span>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* JSON Content */}
          <div className="flex-1 overflow-hidden">
            {jsonContent ? (
              <CodeEditor
                value={JSON.stringify(jsonContent, null, 2)}
                readOnly
                className="h-full"
                language="json"
              />
            ) : (
              <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-subtle)' }}>
                No JSON content to display
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div
          className="h-screen flex items-center justify-center"
          style={{ backgroundColor: 'var(--color-bg-base)', color: 'var(--color-text-muted)' }}
        >
          Loading...
        </div>
      }
    >
      <AutoonApp />
    </Suspense>
  );
}
