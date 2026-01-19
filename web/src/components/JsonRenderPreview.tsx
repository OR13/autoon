'use client';

import React from 'react';

export interface JsonRenderComponent {
  type: string;
  props?: Record<string, unknown>;
  children?: JsonRenderComponent[];
  visible?: unknown;
}

interface JsonRenderPreviewProps {
  json: JsonRenderComponent | null;
  className?: string;
}

// Helper to safely get string prop
const str = (value: unknown): string => (typeof value === 'string' ? value : String(value ?? ''));
const num = (value: unknown): number => (typeof value === 'number' ? value : Number(value) || 0);
const bool = (value: unknown): boolean => Boolean(value);

// Simple component renderer for json-render format
function renderComponent(component: JsonRenderComponent, key: number | string = 0): React.ReactNode {
  const { type, props = {}, children } = component;

  const renderChildren = (): React.ReactNode => {
    if (!children || children.length === 0) return null;
    return children.map((child, idx) => renderComponent(child, idx));
  };

  switch (type) {
    case 'Card': {
      const title = props.title ? str(props.title) : null;
      return (
        <div key={key} className="bg-gray-800 rounded-lg p-4 border border-gray-700 shadow-lg">
          {title && (
            <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">
              {title}
            </h2>
          )}
          <div className="space-y-3">{renderChildren()}</div>
        </div>
      );
    }

    case 'Metric': {
      const label = str(props.label);
      const value = str(props.value);
      const trend = props.trend ? str(props.trend) : null;
      return (
        <div key={key} className="bg-gray-700/50 rounded-lg p-3 flex items-center justify-between">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">{label}</p>
            <p className="text-xl font-bold text-white">{value}</p>
          </div>
          {trend && (
            <span
              className={`text-sm font-medium ${
                trend.startsWith('+') ? 'text-green-400' : 'text-red-400'
              }`}
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
        <div key={key} className="bg-gray-700/30 rounded-lg p-3">
          <div className="flex items-end gap-2 h-32">
            {data.map((item, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                <div
                  className="w-full bg-yellow-500 rounded-t transition-all"
                  style={{ height: `${(item.value / maxValue) * 100}%` }}
                />
                <span className="text-xs text-gray-400">{item.month || item.label}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }

    case 'Alert': {
      const variantStyles: Record<string, string> = {
        success: 'bg-green-900/50 border-green-700 text-green-300',
        warning: 'bg-yellow-900/50 border-yellow-700 text-yellow-300',
        error: 'bg-red-900/50 border-red-700 text-red-300',
        info: 'bg-blue-900/50 border-blue-700 text-blue-300',
      };
      const variant = str(props.variant) || 'info';
      const message = str(props.message);
      return (
        <div key={key} className={`rounded-lg p-3 border ${variantStyles[variant] || variantStyles.info}`}>
          {message}
        </div>
      );
    }

    case 'Button': {
      const btnVariants: Record<string, string> = {
        primary: 'bg-yellow-500 hover:bg-yellow-600 text-gray-900',
        secondary: 'bg-gray-600 hover:bg-gray-500 text-white',
        danger: 'bg-red-600 hover:bg-red-500 text-white',
      };
      const btnVariant = str(props.variant) || 'secondary';
      const label = str(props.label);
      const btnType = (str(props.type) as 'button' | 'submit' | 'reset') || 'button';
      return (
        <button
          key={key}
          type={btnType}
          className={`px-4 py-2 rounded-lg font-medium transition-colors ${
            btnVariants[btnVariant] || btnVariants.secondary
          }`}
        >
          {label}
        </button>
      );
    }

    case 'Form': {
      const title = props.title ? str(props.title) : null;
      return (
        <div key={key} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
          {title && (
            <h2 className="text-lg font-semibold text-white mb-4 pb-2 border-b border-gray-700">
              {title}
            </h2>
          )}
          <div className="space-y-4">{renderChildren()}</div>
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
        <div key={key} className="space-y-1">
          <label className="block text-sm text-gray-400">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
          <input
            type={inputType}
            name={name}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
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
        <div key={key} className="space-y-1">
          <label className="block text-sm text-gray-400">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
          <textarea
            name={name}
            rows={rows}
            placeholder={placeholder}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-yellow-500/50 resize-none"
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
        <div key={key} className="space-y-1">
          <label className="block text-sm text-gray-400">
            {label}
            {required && <span className="text-red-400 ml-1">*</span>}
          </label>
          <select
            name={name}
            className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50"
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
        <div key={key} className="flex items-center gap-2">
          <input
            type="checkbox"
            name={name}
            className="w-4 h-4 bg-gray-700 border-gray-600 rounded text-yellow-500 focus:ring-yellow-500/50"
          />
          <label className="text-sm text-gray-300">{label}</label>
        </div>
      );
    }

    default:
      return (
        <div key={key} className="bg-gray-700/30 rounded p-2 text-sm text-gray-400">
          Unknown component: {type}
          {renderChildren()}
        </div>
      );
  }
}

export default function JsonRenderPreview({ json, className }: JsonRenderPreviewProps) {
  if (!json) {
    return (
      <div className={`flex items-center justify-center h-full text-gray-500 ${className || ''}`}>
        No JSON Render data to preview
      </div>
    );
  }

  return (
    <div className={`p-4 overflow-auto ${className || ''}`}>
      <div className="max-w-lg mx-auto">{renderComponent(json)}</div>
    </div>
  );
}
