'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import dynamic from 'next/dynamic';
import { Button, Badge } from 'flowbite-react';
import { HiExternalLink, HiCode, HiChartBar, HiTemplate, HiCube, HiHome } from 'react-icons/hi';
import Link from 'next/link';
import {
  EXAMPLES,
  Example,
  ExampleCategory,
} from '@/lib/examples';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), { ssr: false });
const JsonCrackViewer = dynamic(() => import('@/components/JsonCrackViewer'), { ssr: false });
const JsonRenderPreview = dynamic(() => import('@/components/JsonRenderPreview'), { ssr: false });
const LiteGraphViewer = dynamic(() => import('@/components/LiteGraphViewer'), { ssr: false });

type ViewTab = 'json' | 'visualization' | 'preview';

interface UseCasePageProps {
  category: ExampleCategory;
  title: string;
  description: string;
  mediaType: string;
}

function UseCasePageContent({ category, title, description, mediaType }: UseCasePageProps) {
  const categoryExamples = EXAMPLES.filter((e) => e.category === category);
  const [toonContent, setToonContent] = useState('');
  const [jsonContent, setJsonContent] = useState<Record<string, unknown> | null>(null);
  const [selectedExample, setSelectedExample] = useState<Example>(categoryExamples[0]);
  const [activeTab, setActiveTab] = useState<ViewTab>('visualization');
  const [leftPanelWidth, setLeftPanelWidth] = useState(450);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (categoryExamples.length > 0) {
      loadExample(categoryExamples[0]);
    }
  }, []);

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
  };

  const renderPreviewContent = () => {
    if (!jsonContent) {
      return (
        <div className="flex items-center justify-center h-full text-gray-500">
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
        if (category === 'jsonrender') {
          return (
            <JsonRenderPreview
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              json={jsonContent as any}
              className="h-full bg-gray-900"
            />
          );
        }
        if (category === 'litegraph') {
          return (
            <LiteGraphViewer
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              json={jsonContent as any}
              className="h-full"
            />
          );
        }
        return (
          <div className="h-full overflow-auto p-4 bg-gray-900">
            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-semibold text-white mb-4">
                {category === 'schema' ? 'Schema Structure' : 'Instance Data'}
              </h3>
              <pre className="text-sm text-gray-300 bg-gray-800 rounded-lg p-4 overflow-auto">
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
        if (category === 'litegraph') return <HiCube className="w-4 h-4" />;
        return <HiTemplate className="w-4 h-4" />;
    }
  };

  const getPreviewLabel = () => {
    switch (category) {
      case 'litegraph':
        return 'LiteGraph';
      case 'jsonrender':
        return 'UI Preview';
      default:
        return 'Preview';
    }
  };

  const getBadgeColor = () => {
    switch (category) {
      case 'litegraph':
        return 'purple';
      case 'jsonrender':
        return 'blue';
      case 'schema':
        return 'yellow';
      default:
        return 'green';
    }
  };

  return (
    <div className="h-screen flex flex-col bg-gray-950 dark" data-theme="dark">
      {/* Header */}
      <header className="flex items-center justify-between h-14 px-6 bg-gray-900 border-b border-gray-800">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-yellow-400 to-amber-600 flex items-center justify-center font-bold text-gray-900 shadow-lg">
              A
            </div>
            <h1 className="text-lg font-semibold text-yellow-400">Autoon</h1>
          </Link>
          <span className="text-gray-600">/</span>
          <h2 className="text-sm font-medium text-gray-300">{title}</h2>
          <Badge color={getBadgeColor()}>{mediaType}</Badge>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={selectedExample.id}
            onChange={(e) => {
              const example = categoryExamples.find((ex) => ex.id === e.target.value);
              if (example) loadExample(example);
            }}
            className="h-8 px-3 text-xs font-medium bg-gray-800 border border-gray-700 rounded-lg text-gray-300 cursor-pointer hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
          >
            {categoryExamples.map((ex) => (
              <option key={ex.id} value={ex.id}>
                {ex.name}
              </option>
            ))}
          </select>

          <Link href="/">
            <Button color="gray" size="sm">
              <HiHome className="w-4 h-4 mr-2" />
              Home
            </Button>
          </Link>

          <Button
            color="gray"
            size="sm"
            as="a"
            href="https://github.com/or13/autoon"
            target="_blank"
            rel="noopener noreferrer"
          >
            <HiExternalLink className="w-4 h-4 mr-2" />
            GitHub
          </Button>
        </div>
      </header>

      {/* Description bar */}
      <div className="px-6 py-2 bg-gray-900/50 border-b border-gray-800">
        <p className="text-xs text-gray-400">{description}</p>
      </div>

      {/* Main content */}
      <main ref={containerRef} className="flex-1 flex overflow-hidden">
        {/* Left Panel - Toon Editor */}
        <div className="flex flex-col bg-gray-900" style={{ width: leftPanelWidth }}>
          <div className="flex items-center h-10 px-4 bg-gray-900 border-b border-gray-800">
            <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Toon</span>
            <span className="ml-2 text-xs text-gray-600">({selectedExample.name})</span>
          </div>
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
          className={`w-1 bg-gray-800 hover:bg-yellow-500 cursor-col-resize transition-colors ${
            isDragging ? 'bg-yellow-500' : ''
          }`}
          onMouseDown={() => setIsDragging(true)}
        />

        {/* Right Panel - Tabbed Views */}
        <div className="flex-1 flex flex-col bg-gray-900">
          <div className="flex items-center h-10 px-4 bg-gray-900 border-b border-gray-800 gap-1">
            <button
              onClick={() => setActiveTab('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeTab === 'json'
                  ? 'bg-gray-700 text-yellow-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {getTabIcon('json')}
              JSON
            </button>
            <button
              onClick={() => setActiveTab('visualization')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeTab === 'visualization'
                  ? 'bg-gray-700 text-yellow-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {getTabIcon('visualization')}
              Visualize
            </button>
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${
                activeTab === 'preview'
                  ? 'bg-gray-700 text-yellow-400'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`}
            >
              {getTabIcon('preview')}
              {getPreviewLabel()}
            </button>
          </div>

          <div className="flex-1 overflow-hidden">{renderPreviewContent()}</div>
        </div>
      </main>
    </div>
  );
}

export default function UseCasePage(props: UseCasePageProps) {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-gray-950 text-gray-400">
          Loading...
        </div>
      }
    >
      <UseCasePageContent {...props} />
    </Suspense>
  );
}
