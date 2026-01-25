'use client';

import { useState, useEffect, useRef, Suspense, useMemo, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from 'flowbite-react';
import { HiExternalLink, HiCode, HiChartBar, HiTemplate, HiCube, HiSearch, HiChevronDown } from 'react-icons/hi';
import {
  EXAMPLES,
  Example,
  ExampleCategory,
  detectJsonType,
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
const JsonCrackViewer = dynamic(() => import('@/components/JsonCrackViewer'), { ssr: false });
const GenerativeUIPreview = dynamic(() => import('@/components/GenerativeUIPreview'), { ssr: false });
const LiteGraphViewer = dynamic(() => import('@/components/LiteGraphViewer'), { ssr: false });

type ViewTab = 'json' | 'visualization' | 'preview';

function AutoonApp() {
  const [toonContent, setToonContent] = useState('');
  const [jsonContent, setJsonContent] = useState<Record<string, unknown> | null>(null);
  const [selectedExample, setSelectedExample] = useState<Example | null>(null);
  const [activeTab, setActiveTab] = useState<ViewTab>('json');
  const [detectedType, setDetectedType] = useState<ExampleCategory>('instance');
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
    setDetectedType(example.category);
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
            setDetectedType(detectJsonType(parsed as Record<string, unknown>));
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
        setDetectedType(detectJsonType(parsed as Record<string, unknown>));
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

  const renderPreviewContent = () => {
    if (!jsonContent) {
      return (
        <div className="flex items-center justify-center h-full" style={{ color: 'var(--color-text-subtle)' }}>
          No JSON content to display
        </div>
      );
    }

    switch (activeTab) {
      case 'json':
        return (
          <CodeEditor
            value={JSON.stringify(jsonContent, null, 2)}
            readOnly
            className="h-full"
            language="json"
          />
        );

      case 'visualization':
        // Show specialized visualizations based on detected type
        if (detectedType === 'generative-ui') {
          return (
            <GenerativeUIPreview
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              json={jsonContent as any}
              className="h-full"
              style={{ backgroundColor: 'var(--color-bg-surface)' }}
            />
          );
        }
        if (detectedType === 'litegraph') {
          return (
            <LiteGraphViewer
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              json={jsonContent as any}
              className="h-full"
            />
          );
        }
        // Default: show JSON tree visualization
        return <JsonCrackViewer json={JSON.stringify(jsonContent)} className="h-full" />;

      case 'preview':
        if (detectedType === 'generative-ui') {
          return (
            <GenerativeUIPreview
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              json={jsonContent as any}
              className="h-full"
              style={{ backgroundColor: 'var(--color-bg-surface)' }}
            />
          );
        }
        if (detectedType === 'litegraph') {
          return (
            <LiteGraphViewer
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              json={jsonContent as any}
              className="h-full"
            />
          );
        }
        return (
          <div className="h-full overflow-auto p-4" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
                {detectedType === 'schema' ? 'Schema Structure' : 'Instance Data'}
              </h3>
              <pre 
                className="text-sm rounded-lg p-4 overflow-auto"
                style={{ 
                  color: 'var(--color-text-secondary)',
                  backgroundColor: 'var(--color-bg-elevated)'
                }}
              >
                {JSON.stringify(jsonContent, null, 2)}
              </pre>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const getTabIcon = (tab: ViewTab) => {
    switch (tab) {
      case 'json':
        return <HiCode className="w-4 h-4" />;
      case 'visualization':
        // Show context-specific icon based on detected type
        if (detectedType === 'litegraph') return <HiCube className="w-4 h-4" />;
        if (detectedType === 'generative-ui') return <HiTemplate className="w-4 h-4" />;
        return <HiChartBar className="w-4 h-4" />;
      case 'preview':
        if (detectedType === 'litegraph') return <HiCube className="w-4 h-4" />;
        return <HiTemplate className="w-4 h-4" />;
    }
  };

  const getVisualizationLabel = () => {
    switch (detectedType) {
      case 'litegraph':
        return 'Workflow JSON';
      case 'generative-ui':
        return 'Generative UI';
      default:
        return 'Visualize';
    }
  };

  const getPreviewLabel = () => {
    switch (detectedType) {
      case 'litegraph':
        return 'Workflow JSON';
      case 'generative-ui':
        return 'Generative UI';
      default:
        return 'Preview';
    }
  };

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

  return (
    <div className="h-screen flex flex-col dark" data-theme="dark" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Header */}
      <nav className="autoon-header flex items-center justify-between" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
        <a href="/" className="flex items-center gap-3">
          <div className="logo-container w-8 h-8">
            <div className="logo-glow-ring" />
            <svg viewBox="0 0 32 32" className="w-8 h-8 logo-svg">
              <defs>
                <linearGradient id="headerHexGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#2D3748"/>
                  <stop offset="100%" stopColor="#1A202C"/>
                </linearGradient>
                <linearGradient id="headerStrokeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#00D4FF"/>
                  <stop offset="50%" stopColor="#7C3AED"/>
                  <stop offset="100%" stopColor="#F472B6"/>
                </linearGradient>
                <radialGradient id="headerNodeGrad" cx="30%" cy="30%">
                  <stop offset="0%" stopColor="#FFF"/>
                  <stop offset="50%" stopColor="#FFD700"/>
                  <stop offset="100%" stopColor="#FF8C00"/>
                </radialGradient>
              </defs>
              <polygon
                points="16,5 25,10 25,22 16,27 7,22 7,10"
                fill="url(#headerHexGrad)"
                stroke="url(#headerStrokeGrad)"
                strokeWidth="1.5"
              />
              <circle cx="16" cy="5" r="2" fill="url(#headerNodeGrad)" className="logo-node logo-node-1"/>
              <circle cx="25" cy="22" r="2" fill="url(#headerNodeGrad)" className="logo-node logo-node-2"/>
              <circle cx="7" cy="22" r="2" fill="url(#headerNodeGrad)" className="logo-node logo-node-3"/>
            </svg>
          </div>
          <span className="text-xl font-semibold" style={{ color: 'var(--color-brand-primary)' }}>
            Autoon
          </span>
          <Badge color="warning">v0.2</Badge>
        </a>
        <a
          href="https://github.com/or13/autoon"
          target="_blank"
          rel="noopener noreferrer"
          className="autoon-btn"
        >
          <HiExternalLink className="w-4 h-4 mr-2" />
          GitHub
        </a>
      </nav>

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

        {/* Right Panel - Tabbed Views */}
        <div className="flex-1 flex flex-col" style={{ backgroundColor: 'var(--color-bg-surface)' }}>
          {/* Tab Bar */}
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

            {/* Interaction UI - on right */}
            <div className="flex items-center gap-3">
              {/* Examples selector */}
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
                                backgroundColor:
                                  example.category === 'schema' ? 'rgba(255, 173, 102, 0.1)' :
                                  example.category === 'instance' ? 'rgba(213, 255, 128, 0.1)' :
                                  example.category === 'generative-ui' ? 'rgba(115, 208, 255, 0.1)' : 'rgba(212, 191, 255, 0.1)',
                                border: `1px solid ${
                                  example.category === 'schema' ? 'rgba(255, 173, 102, 0.3)' :
                                  example.category === 'instance' ? 'rgba(213, 255, 128, 0.3)' :
                                  example.category === 'generative-ui' ? 'rgba(115, 208, 255, 0.3)' : 'rgba(212, 191, 255, 0.3)'
                                }`,
                                color:
                                  example.category === 'schema' ? '#FFAD66' :
                                  example.category === 'instance' ? '#D5FF80' :
                                  example.category === 'generative-ui' ? '#73D0FF' : '#D4BFFF'
                              }}
                            >
                              {example.category === 'schema' ? 'Data Validation' :
                               example.category === 'instance' ? 'Data Representation' :
                               example.category === 'generative-ui' ? 'Interface Definition' : 'Workflow Representation'}
                            </span>
                          </button>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ width: '1px', height: '20px', backgroundColor: 'var(--color-border-muted)' }} />

              <button
                onClick={() => setActiveTab('json')}
                className={`autoon-tab ${activeTab === 'json' ? 'autoon-tab-active' : ''}`}
              >
                {getTabIcon('json')}
                JSON
              </button>
              <button
                onClick={() => setActiveTab('visualization')}
                className={`autoon-tab ${activeTab === 'visualization' ? 'autoon-tab-active' : ''}`}
              >
                {getTabIcon('visualization')}
                {getVisualizationLabel()}
              </button>
            </div>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-hidden">{renderPreviewContent()}</div>
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
