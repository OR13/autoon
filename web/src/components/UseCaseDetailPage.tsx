'use client';

import { useMemo, ReactNode } from 'react';
import dynamic from 'next/dynamic';
import Header from './Header';

const CodeEditor = dynamic(() => import('@/components/CodeEditor'), { ssr: false });
const GenerativeUIPreview = dynamic(() => import('@/components/GenerativeUIPreview'), { ssr: false });
const LiteGraphViewer = dynamic(() => import('@/components/LiteGraphViewer'), { ssr: false });

// Estimate token count
function estimateTokens(text: string): number {
  if (!text) return 0;
  const tokens = text.match(/[\w]+|[^\s\w]/g);
  return tokens ? tokens.length : 0;
}

function formatNumber(n: number): string {
  return n.toLocaleString();
}

interface UseCaseDetailPageProps {
  title: string;
  subtitle: string;
  formatName: string;
  formatDescription: string;
  creator: string;
  standardsBody: string;
  standardsUrl: string;
  praise: string[];
  complaints: string[];
  mediaType: string;
  llmGuidance: {
    summary: string;
    tips: string[];
    promptExample: string;
  };
  jsonExample: string;
  toonExample: string;
  previewType?: 'generative-ui' | 'nodal-ui';
}

export default function UseCaseDetailPage({
  title,
  subtitle,
  formatName,
  formatDescription,
  creator,
  standardsBody,
  standardsUrl,
  praise,
  complaints,
  mediaType,
  llmGuidance,
  jsonExample,
  toonExample,
  previewType,
}: UseCaseDetailPageProps) {
  const jsonStats = useMemo(() => ({
    chars: jsonExample.length,
    tokens: estimateTokens(jsonExample),
  }), [jsonExample]);

  const toonStats = useMemo(() => ({
    chars: toonExample.length,
    tokens: estimateTokens(toonExample),
  }), [toonExample]);

  const percentChange = useMemo(() => {
    if (jsonStats.chars === 0) return 0;
    return ((toonStats.chars - jsonStats.chars) / jsonStats.chars) * 100;
  }, [toonStats.chars, jsonStats.chars]);

  const sectionStyle = {
    backgroundColor: 'var(--color-bg-surface)',
    border: '1px solid var(--color-border-muted)',
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '32px',
  };

  const headingStyle = {
    color: 'var(--color-brand-primary)',
    fontSize: '18px',
    fontWeight: 600,
    marginBottom: '16px',
  };

  return (
    <div className="h-screen flex flex-col dark" data-theme="dark" style={{ backgroundColor: 'var(--color-bg-base)', overflow: 'hidden' }}>
      <Header />

      <main style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '48px 32px' }}>
          {/* Title Section */}
          <div style={{ marginBottom: '48px' }}>
            <h1 style={{
              color: 'var(--color-text-primary)',
              fontSize: '32px',
              fontWeight: 700,
              marginBottom: '8px'
            }}>
              {title}
            </h1>
            <p style={{ color: 'var(--color-text-secondary)', fontSize: '18px' }}>
              {subtitle}
            </p>
          </div>

          {/* Format Description Section */}
          <section style={sectionStyle}>
            <h2 style={headingStyle}>About {formatName}</h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '15px',
              lineHeight: 1.6,
              marginBottom: '20px'
            }}>
              {formatDescription}
            </p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              fontSize: '14px'
            }}>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Created by: </span>
                <span style={{ color: 'var(--color-text-primary)' }}>{creator}</span>
              </div>
              <div>
                <span style={{ color: 'var(--color-text-muted)' }}>Standards: </span>
                <a
                  href={standardsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: '#E8943A' }}
                >
                  {standardsBody}
                </a>
              </div>
            </div>
          </section>

          {/* Community Feedback Section */}
          <section style={{ marginBottom: '32px' }}>
            <h2 style={headingStyle}>Community Feedback</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* Praise */}
              <div style={{
                ...sectionStyle,
                marginBottom: 0,
              }}>
                <h3 style={{
                  color: 'var(--color-success)',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>+</span> What people love
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {praise.map((item, i) => (
                    <li key={i} style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '14px',
                      marginBottom: '12px',
                      paddingLeft: '16px',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        color: 'var(--color-success)'
                      }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              {/* Complaints */}
              <div style={{
                ...sectionStyle,
                marginBottom: 0,
              }}>
                <h3 style={{
                  color: 'var(--color-error)',
                  fontSize: '14px',
                  fontWeight: 500,
                  marginBottom: '16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{ fontSize: '16px' }}>−</span> Common complaints
                </h3>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {complaints.map((item, i) => (
                    <li key={i} style={{
                      color: 'var(--color-text-secondary)',
                      fontSize: '14px',
                      marginBottom: '12px',
                      paddingLeft: '16px',
                      position: 'relative'
                    }}>
                      <span style={{
                        position: 'absolute',
                        left: 0,
                        color: 'var(--color-error)'
                      }}>•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Media Type Section */}
          <section style={sectionStyle}>
            <h2 style={headingStyle}>TOON Media Type</h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '14px',
              lineHeight: 1.6,
              marginBottom: '16px'
            }}>
              Use this media type in Content-Type headers, LLM system prompts, and tool definitions to specify the expected format.
            </p>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '14px',
              padding: '16px',
              backgroundColor: 'var(--color-bg-elevated)',
              borderRadius: '6px',
              border: '1px solid var(--color-border-muted)',
              wordBreak: 'break-all'
            }}>
              <span style={{ color: 'var(--color-brand-primary)' }}>{mediaType}</span>
            </div>
          </section>

          {/* LLM Guidance Section */}
          <section style={sectionStyle}>
            <h2 style={headingStyle}>Guidance for Data Modelers</h2>
            <p style={{
              color: 'var(--color-text-secondary)',
              fontSize: '15px',
              lineHeight: 1.6,
              marginBottom: '20px'
            }}>
              {llmGuidance.summary}
            </p>

            <h3 style={{
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '12px'
            }}>
              Best Practices for LLM Applications
            </h3>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 24px 0' }}>
              {llmGuidance.tips.map((tip, i) => (
                <li key={i} style={{
                  color: 'var(--color-text-secondary)',
                  fontSize: '14px',
                  marginBottom: '10px',
                  paddingLeft: '20px',
                  position: 'relative'
                }}>
                  <span style={{
                    position: 'absolute',
                    left: 0,
                    color: 'var(--color-brand-primary)'
                  }}>→</span>
                  {tip}
                </li>
              ))}
            </ul>

            <h3 style={{
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              fontWeight: 600,
              marginBottom: '12px'
            }}>
              Example System Prompt
            </h3>
            <div style={{
              fontFamily: 'monospace',
              fontSize: '13px',
              padding: '16px',
              backgroundColor: 'var(--color-bg-elevated)',
              borderRadius: '6px',
              border: '1px solid var(--color-border-muted)',
              whiteSpace: 'pre-wrap',
              lineHeight: 1.5,
              color: 'var(--color-text-secondary)'
            }}>
              {llmGuidance.promptExample}
            </div>
          </section>

          {/* Rendered Preview */}
          {previewType && (
            <section style={{ marginBottom: '32px' }}>
              <h2 style={headingStyle}>Rendered Preview</h2>
              <p style={{
                color: 'var(--color-text-secondary)',
                fontSize: '14px',
                lineHeight: 1.6,
                marginBottom: '16px'
              }}>
                {previewType === 'generative-ui'
                  ? 'This is how the JSON example above renders as actual UI components.'
                  : 'This is how the JSON example above renders as an interactive node graph.'}
              </p>
              <div style={{
                ...sectionStyle,
                marginBottom: 0,
                padding: previewType === 'generative-ui' ? '32px' : '0',
                height: previewType === 'nodal-ui' ? '500px' : 'auto',
                minHeight: previewType === 'generative-ui' ? '200px' : undefined,
                overflow: 'hidden',
                backgroundColor: previewType === 'nodal-ui' ? 'var(--color-bg-base)' : 'var(--color-bg-surface)'
              }}>
                {previewType === 'generative-ui' && (
                  <GenerativeUIPreview
                    json={JSON.parse(jsonExample)}
                    style={{ backgroundColor: 'transparent' }}
                  />
                )}
                {previewType === 'nodal-ui' && (
                  <div style={{ 
                    height: '100%', 
                    width: '100%',
                    backgroundColor: 'var(--color-bg-base)'
                  }}>
                    <LiteGraphViewer
                      json={JSON.parse(jsonExample)}
                      className="h-full w-full"
                    />
                  </div>
                )}
              </div>
            </section>
          )}

          {/* Side-by-side Comparison */}
          <section>
            <h2 style={headingStyle}>Format Comparison</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              {/* JSON Side */}
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--color-border-muted)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '40px',
                  padding: '0 16px',
                  backgroundColor: 'var(--color-bg-elevated)',
                  borderBottom: '1px solid var(--color-border-muted)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: 'var(--color-text-muted)'
                }}>
                  <span>JSON</span>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span>{formatNumber(jsonStats.chars)} chars</span>
                    <span>{formatNumber(jsonStats.tokens)} tokens</span>
                  </div>
                </div>
                <div style={{ height: '400px' }}>
                  <CodeEditor
                    value={jsonExample}
                    readOnly
                    className="h-full"
                    language="json"
                  />
                </div>
              </div>

              {/* TOON Side */}
              <div style={{
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--color-border-muted)'
              }}>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  height: '40px',
                  padding: '0 16px',
                  backgroundColor: 'var(--color-bg-elevated)',
                  borderBottom: '1px solid var(--color-border-muted)',
                  fontFamily: 'monospace',
                  fontSize: '12px',
                  color: 'var(--color-text-muted)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                    <span>TOON</span>
                    <span style={{
                      color: percentChange <= 0 ? 'var(--color-success)' : 'var(--color-error)',
                      fontWeight: 500
                    }}>
                      {percentChange <= 0 ? '' : '+'}{percentChange.toFixed(1)}%
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px' }}>
                    <span>{formatNumber(toonStats.chars)} chars</span>
                    <span>{formatNumber(toonStats.tokens)} tokens</span>
                  </div>
                </div>
                <div style={{ height: '400px' }}>
                  <CodeEditor
                    value={toonExample}
                    readOnly
                    className="h-full"
                    language="toon"
                  />
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
