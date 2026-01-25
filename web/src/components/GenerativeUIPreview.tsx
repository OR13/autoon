'use client';

import React from 'react';

export interface GenerativeUIComponent {
  type: string;
  props?: Record<string, unknown>;
  children?: GenerativeUIComponent[];
  visible?: unknown;
}

interface GenerativeUIPreviewProps {
  json: GenerativeUIComponent | null;
  className?: string;
  style?: React.CSSProperties;
}

// Helper to safely get string prop
const str = (value: unknown): string => (typeof value === 'string' ? value : String(value ?? ''));
const num = (value: unknown): number => (typeof value === 'number' ? value : Number(value) || 0);
const bool = (value: unknown): boolean => Boolean(value);

// Simple component renderer for generative UI format
function renderComponent(component: GenerativeUIComponent, key: number | string = 0): React.ReactNode {
  const { type, props = {}, children } = component;

  const renderChildren = (): React.ReactNode => {
    if (!children || children.length === 0) return null;
    return children.map((child, idx) => renderComponent(child, idx));
  };

  switch (type) {
    case 'Card': {
      const title = props.title ? str(props.title) : null;
      return (
        <div
          key={key}
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid var(--color-border-muted)',
          }}
        >
          {title && (
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--color-border-muted)',
              }}
            >
              {title}
            </h2>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>{renderChildren()}</div>
        </div>
      );
    }

    case 'Metric': {
      const label = str(props.label);
      const value = str(props.value);
      const trend = props.trend ? str(props.trend) : null;
      return (
        <div
          key={key}
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderRadius: '6px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div>
            <p
              style={{
                fontSize: '11px',
                color: 'var(--color-text-muted)',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                marginBottom: '4px',
              }}
            >
              {label}
            </p>
            <p
              style={{
                fontSize: '20px',
                fontWeight: 700,
                color: 'var(--color-text-primary)',
              }}
            >
              {value}
            </p>
          </div>
          {trend && (
            <span
              style={{
                fontSize: '14px',
                fontWeight: 500,
                color: trend.startsWith('+') ? '#95D660' : '#FF6B6B',
              }}
            >
              {trend}
            </span>
          )}
        </div>
      );
    }

    case 'BarChart': {
      const data = (Array.isArray(props.data) ? props.data : []) as Array<{
        month?: string;
        label?: string;
        value: number;
      }>;
      const maxValue = Math.max(...data.map((d) => d.value), 1);
      return (
        <div
          key={key}
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderRadius: '6px',
            padding: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', height: '120px' }}>
            {data.map((item, idx) => (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '4px',
                  height: '100%',
                  justifyContent: 'flex-end',
                }}
              >
                <div
                  style={{
                    width: '100%',
                    backgroundColor: 'var(--color-brand-primary)',
                    borderRadius: '4px 4px 0 0',
                    height: `${(item.value / maxValue) * 100}%`,
                    minHeight: '4px',
                  }}
                />
                <span style={{ fontSize: '11px', color: 'var(--color-text-muted)' }}>
                  {item.month || item.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'Alert': {
      const variantStyles: Record<string, { bg: string; border: string; text: string }> = {
        success: { bg: 'rgba(149, 214, 96, 0.1)', border: 'rgba(149, 214, 96, 0.3)', text: '#95D660' },
        warning: { bg: 'rgba(255, 215, 0, 0.1)', border: 'rgba(255, 215, 0, 0.3)', text: '#FFD700' },
        error: { bg: 'rgba(255, 107, 107, 0.1)', border: 'rgba(255, 107, 107, 0.3)', text: '#FF6B6B' },
        info: { bg: 'rgba(115, 208, 255, 0.1)', border: 'rgba(115, 208, 255, 0.3)', text: '#73D0FF' },
      };
      const variant = str(props.variant) || 'info';
      const message = str(props.message);
      const styles = variantStyles[variant] || variantStyles.info;
      return (
        <div
          key={key}
          style={{
            borderRadius: '6px',
            padding: '12px 16px',
            backgroundColor: styles.bg,
            border: `1px solid ${styles.border}`,
            color: styles.text,
            fontSize: '14px',
          }}
        >
          {message}
        </div>
      );
    }

    case 'Button': {
      const btnVariants: Record<string, { bg: string; hover: string; text: string }> = {
        primary: { bg: 'var(--color-brand-primary)', hover: 'var(--color-brand-secondary)', text: '#1a0f0a' },
        secondary: { bg: 'var(--color-bg-muted)', hover: 'var(--color-bg-elevated)', text: 'var(--color-text-primary)' },
        danger: { bg: '#FF6B6B', hover: '#ff5252', text: '#fff' },
      };
      const btnVariant = str(props.variant) || 'secondary';
      const label = str(props.label);
      const styles = btnVariants[btnVariant] || btnVariants.secondary;
      return (
        <button
          key={key}
          type="button"
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            fontWeight: 500,
            fontSize: '14px',
            backgroundColor: styles.bg,
            color: styles.text,
            border: 'none',
            cursor: 'pointer',
            transition: 'background-color 0.2s',
          }}
        >
          {label}
        </button>
      );
    }

    case 'Form': {
      const title = props.title ? str(props.title) : null;
      return (
        <div
          key={key}
          style={{
            backgroundColor: 'var(--color-bg-elevated)',
            borderRadius: '8px',
            padding: '20px',
            border: '1px solid var(--color-border-muted)',
          }}
        >
          {title && (
            <h2
              style={{
                fontSize: '16px',
                fontWeight: 600,
                color: 'var(--color-text-primary)',
                marginBottom: '16px',
                paddingBottom: '12px',
                borderBottom: '1px solid var(--color-border-muted)',
              }}
            >
              {title}
            </h2>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>{renderChildren()}</div>
        </div>
      );
    }

    case 'TextInput': {
      const label = str(props.label);
      const name = str(props.name);
      const inputType = str(props.type) || 'text';
      const placeholder = str(props.placeholder);
      const required = bool(props.required);
      return (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {label}
            {required && <span style={{ color: '#FF6B6B', marginLeft: '4px' }}>*</span>}
          </label>
          <input
            type={inputType}
            name={name}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'var(--color-bg-muted)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '6px',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              outline: 'none',
            }}
          />
        </div>
      );
    }

    case 'TextArea': {
      const label = str(props.label);
      const name = str(props.name);
      const rows = num(props.rows) || 3;
      const placeholder = str(props.placeholder);
      const required = bool(props.required);
      return (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {label}
            {required && <span style={{ color: '#FF6B6B', marginLeft: '4px' }}>*</span>}
          </label>
          <textarea
            name={name}
            rows={rows}
            placeholder={placeholder}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'var(--color-bg-muted)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '6px',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              outline: 'none',
              resize: 'none',
            }}
          />
        </div>
      );
    }

    case 'Select': {
      const label = str(props.label);
      const name = str(props.name);
      const options = (Array.isArray(props.options) ? props.options : []) as string[];
      const required = bool(props.required);
      return (
        <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <label style={{ fontSize: '13px', color: 'var(--color-text-muted)' }}>
            {label}
            {required && <span style={{ color: '#FF6B6B', marginLeft: '4px' }}>*</span>}
          </label>
          <select
            name={name}
            style={{
              width: '100%',
              padding: '10px 12px',
              backgroundColor: 'var(--color-bg-muted)',
              border: '1px solid var(--color-border-default)',
              borderRadius: '6px',
              color: 'var(--color-text-primary)',
              fontSize: '14px',
              outline: 'none',
            }}
          >
            <option value="">Select...</option>
            {options.map((opt, idx) => (
              <option key={idx} value={opt}>
                {opt}
              </option>
            ))}
          </select>
        </div>
      );
    }

    case 'Checkbox': {
      const label = str(props.label);
      const name = str(props.name);
      return (
        <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <input
            type="checkbox"
            name={name}
            style={{
              width: '16px',
              height: '16px',
              accentColor: 'var(--color-brand-primary)',
            }}
          />
          <label style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>{label}</label>
        </div>
      );
    }

    default:
      return (
        <div
          key={key}
          style={{
            backgroundColor: 'var(--color-bg-muted)',
            borderRadius: '6px',
            padding: '12px',
            fontSize: '13px',
            color: 'var(--color-text-muted)',
          }}
        >
          Unknown component: {type}
          {renderChildren()}
        </div>
      );
  }
}

export default function GenerativeUIPreview({ json, className, style }: GenerativeUIPreviewProps) {
  if (!json) {
    return (
      <div
        className={className || ''}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100%',
          color: 'var(--color-text-muted)',
          ...style,
        }}
      >
        No Generative UI data to preview
      </div>
    );
  }

  return (
    <div className={className || ''} style={{ overflow: 'auto', ...style }}>
      <div style={{ maxWidth: '480px', margin: '0 auto', padding: '32px' }}>
        {renderComponent(json)}
      </div>
    </div>
  );
}
