'use client';

import { useState, useEffect, useRef, Suspense, useMemo } from 'react';
import dynamic from 'next/dynamic';
import { Badge } from 'flowbite-react';
import { HiExternalLink, HiCode, HiChartBar, HiTemplate, HiCube, HiSearch, HiChevronDown } from 'react-icons/hi';
import {
  EXAMPLES,
  EXAMPLE_CATEGORIES,
  Example,
  ExampleCategory,
  detectJsonType,
} from '@/lib/examples';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), { ssr: false });
const JsonCrackViewer = dynamic(() => import('@/components/JsonCrackViewer'), { ssr: false });
const JsonRenderPreview = dynamic(() => import('@/components/JsonRenderPreview'), { ssr: false });
const LiteGraphViewer = dynamic(() => import('@/components/LiteGraphViewer'), { ssr: false });

type ViewTab = 'json' | 'visualization' | 'preview';

function AutoonApp() {
  const [toonContent, setToonContent] = useState('');
  const [jsonContent, setJsonContent] = useState<Record<string, unknown> | null>(null);
  const [selectedExample, setSelectedExample] = useState<Example>(
    EXAMPLES.find((e) => e.id === 'person-instance') || EXAMPLES[0]
  );
  const [activeTab, setActiveTab] = useState<ViewTab>('json');
  const [detectedType, setDetectedType] = useState<ExampleCategory>('schema');
  const [leftPanelWidth, setLeftPanelWidth] = useState(450);
  const [isDragging, setIsDragging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const containerRef = useRef<HTMLElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

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

  // Load initial example
  useEffect(() => {
    loadExample(EXAMPLES.find((e) => e.id === 'person-instance') || EXAMPLES[0]);
  }, []);

  // Update JSON when Toon content changes
  useEffect(() => {
    if (selectedExample) {
      setJsonContent(selectedExample.json);
      setDetectedType(detectJsonType(selectedExample.json));
    }
  }, [selectedExample]);

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

  const loadExample = (example: Example) => {
    setSelectedExample(example);
    setToonContent(example.toon);
    setJsonContent(example.json);
    setDetectedType(example.category);
  };

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
        return <JsonCrackViewer json={JSON.stringify(jsonContent)} className="h-full" />;

      case 'preview':
        if (detectedType === 'jsonrender') {
          return (
            <JsonRenderPreview
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
        return <HiChartBar className="w-4 h-4" />;
      case 'preview':
        if (detectedType === 'litegraph') return <HiCube className="w-4 h-4" />;
        return <HiTemplate className="w-4 h-4" />;
    }
  };

  const getPreviewLabel = () => {
    switch (detectedType) {
      case 'litegraph':
        return 'LiteGraph';
      case 'jsonrender':
        return 'UI Preview';
      default:
        return 'Preview';
    }
  };

  return (
    <div className="h-screen flex flex-col dark" data-theme="dark" style={{ backgroundColor: 'var(--color-bg-base)' }}>
      {/* Header */}
      <nav className="autoon-header flex items-center justify-between" style={{ paddingLeft: '1rem', paddingRight: '1rem' }}>
        <a href="/" className="flex items-center gap-3">
          <svg viewBox="0 0 32 32" className="w-8 h-8">
            <polygon 
              points="16,2 28,9 28,23 16,30 4,23 4,9" 
              fill="#1F2430"
              stroke="#73D0FF" 
              strokeWidth="2"
            />
            <circle cx="16" cy="2" r="3" fill="#FFAD66"/>
            <circle cx="28" cy="9" r="3" fill="#FFAD66"/>
            <circle cx="28" cy="23" r="3" fill="#FFAD66"/>
            <circle cx="16" cy="30" r="3" fill="#FFAD66"/>
            <circle cx="4" cy="23" r="3" fill="#FFAD66"/>
            <circle cx="4" cy="9" r="3" fill="#FFAD66"/>
          </svg>
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
          <div className="flex-1 overflow-hidden">
            <CodeEditor
              value={toonContent}
              onChange={setToonContent}
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
          <div className="autoon-panel-header flex items-center gap-3" style={{ paddingLeft: '16px', paddingRight: '16px' }}>
            {/* Examples selector */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="autoon-btn"
                style={{ 
                  minWidth: '160px',
                  justifyContent: 'space-between'
                }}
              >
                <span>{selectedExample.name}</span>
                <HiChevronDown className={`w-4 h-4 transition-transform flex-shrink-0 ${isDropdownOpen ? 'rotate-180' : ''}`} />
              </button>
              
              {isDropdownOpen && (
                <div 
                  className="absolute top-full left-0 mt-2 w-80 rounded-lg shadow-lg z-50 overflow-hidden"
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
                            backgroundColor: selectedExample.id === example.id ? 'var(--color-interactive-hover)' : 'transparent',
                            color: selectedExample.id === example.id ? 'var(--color-brand-primary)' : 'var(--color-text-secondary)'
                          }}
                          onMouseEnter={(e) => {
                            if (selectedExample.id !== example.id) {
                              e.currentTarget.style.backgroundColor = 'var(--color-bg-muted)';
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (selectedExample.id !== example.id) {
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
                                example.category === 'jsonrender' ? 'rgba(115, 208, 255, 0.1)' : 'rgba(212, 191, 255, 0.1)',
                              border: `1px solid ${
                                example.category === 'schema' ? 'rgba(255, 173, 102, 0.3)' :
                                example.category === 'instance' ? 'rgba(213, 255, 128, 0.3)' :
                                example.category === 'jsonrender' ? 'rgba(115, 208, 255, 0.3)' : 'rgba(212, 191, 255, 0.3)'
                              }`,
                              color: 
                                example.category === 'schema' ? '#FFAD66' :
                                example.category === 'instance' ? '#D5FF80' :
                                example.category === 'jsonrender' ? '#73D0FF' : '#D4BFFF'
                            }}
                          >
                            {example.category === 'schema' ? 'Data Validation' :
                             example.category === 'instance' ? 'Data Representation' :
                             example.category === 'jsonrender' ? 'Interface Definition' : 'Workflow Representation'}
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
              Visualize
            </button>
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
