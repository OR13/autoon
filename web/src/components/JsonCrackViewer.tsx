'use client';

import { useEffect, useRef, useState } from 'react';

interface JsonCrackViewerProps {
  json: string;
  className?: string;
}

export default function JsonCrackViewer({ json, className }: JsonCrackViewerProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // JSON Crack widget sends its id attribute when ready
      if (event.data?.source === 'jsoncrack-widget' || event.data === 'jsoncrackEmbed') {
        setIsLoaded(true);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  useEffect(() => {
    if (!iframeRef.current || !isLoaded || !json) return;

    try {
      // Validate JSON before sending
      JSON.parse(json);

      iframeRef.current.contentWindow?.postMessage(
        {
          json: json,
          options: {
            theme: 'dark',
            direction: 'RIGHT',
          },
        },
        '*'
      );
    } catch {
      // Invalid JSON, don't send
    }
  }, [json, isLoaded]);

  // Also try to send on load event
  const handleIframeLoad = () => {
    // Small delay to ensure the widget is fully ready
    setTimeout(() => {
      setIsLoaded(true);
      if (iframeRef.current && json) {
        try {
          JSON.parse(json);
          iframeRef.current.contentWindow?.postMessage(
            {
              json: json,
              options: {
                theme: 'dark',
                direction: 'RIGHT',
              },
            },
            '*'
          );
        } catch {
          // Invalid JSON
        }
      }
    }, 500);
  };

  return (
    <div className={`relative w-full h-full ${className || ''}`}>
      {!isLoaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-900 text-gray-400">
          Loading visualization...
        </div>
      )}
      <iframe
        ref={iframeRef}
        id="jsoncrackEmbed"
        src="https://jsoncrack.com/widget"
        className="w-full h-full border-0"
        onLoad={handleIframeLoad}
        title="JSON Crack Visualization"
      />
    </div>
  );
}
