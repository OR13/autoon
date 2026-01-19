'use client';

import { useEffect, useRef, useCallback } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Extension } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import { toon } from '@/lib/toon-language';

// Ayu Mirage theme for CodeMirror 6
const ayuMirageTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#1f2430',
    foreground: '#cbccc6',
    caret: '#ffcc66',
    selection: '#34455a',
    selectionMatch: '#34455a',
    lineHighlight: '#191e2a',
    gutterBackground: '#1f2430',
    gutterForeground: '#5c6773',
    gutterBorder: 'transparent',
  },
  styles: [
    { tag: t.comment, color: '#5c6773', fontStyle: 'italic' },
    { tag: t.lineComment, color: '#5c6773', fontStyle: 'italic' },
    { tag: t.blockComment, color: '#5c6773', fontStyle: 'italic' },
    { tag: t.docComment, color: '#5c6773', fontStyle: 'italic' },
    { tag: t.string, color: '#bae67e' },
    { tag: t.special(t.string), color: '#bae67e' },
    { tag: t.number, color: '#ffcc66' },
    { tag: t.bool, color: '#ffcc66' },
    { tag: t.null, color: '#ffcc66' },
    { tag: t.keyword, color: '#ffa759' },
    { tag: t.operator, color: '#f29e74' },
    { tag: t.className, color: '#73d0ff' },
    { tag: t.definition(t.typeName), color: '#73d0ff' },
    { tag: t.typeName, color: '#73d0ff' },
    { tag: t.angleBracket, color: '#cbccc6' },
    { tag: t.tagName, color: '#5ccfe6' },
    { tag: t.attributeName, color: '#ffd580' },
    { tag: t.attributeValue, color: '#bae67e' },
    { tag: t.definition(t.propertyName), color: '#5ccfe6' },
    { tag: t.propertyName, color: '#5ccfe6' },
    { tag: t.variableName, color: '#cbccc6' },
    { tag: t.definition(t.variableName), color: '#cbccc6' },
    { tag: t.function(t.variableName), color: '#ffd580' },
    { tag: t.function(t.propertyName), color: '#ffd580' },
    { tag: t.punctuation, color: '#cbccc6' },
    { tag: t.paren, color: '#cbccc6' },
    { tag: t.squareBracket, color: '#cbccc6' },
    { tag: t.brace, color: '#cbccc6' },
    { tag: t.derefOperator, color: '#cbccc6' },
    { tag: t.separator, color: '#cbccc6' },
  ],
});

export type EditorLanguage = 'json' | 'toon';

interface CodeEditorProps {
  value: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  className?: string;
  language?: EditorLanguage;
}

export default function CodeEditor({
  value,
  onChange,
  readOnly = false,
  className,
  language = 'json',
}: CodeEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const isInternalUpdate = useRef(false);

  const handleChange = useCallback(
    (v: string) => {
      if (!isInternalUpdate.current && onChange) {
        onChange(v);
      }
    },
    [onChange]
  );

  useEffect(() => {
    if (!containerRef.current) return;

    const getLanguageExtension = (): Extension => {
      switch (language) {
        case 'toon':
          return toon();
        case 'json':
        default:
          return json();
      }
    };

    const extensions = [
      basicSetup,
      getLanguageExtension(),
      ayuMirageTheme,
      EditorView.lineWrapping,
      EditorView.theme({
        '&': {
          height: '100%',
          fontSize: '12px',
        },
        '.cm-scroller': {
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          overflow: 'auto',
        },
        '.cm-content': {
          padding: '12px 0',
        },
        '.cm-line': {
          padding: '0 12px',
        },
      }),
    ];

    if (!readOnly && onChange) {
      extensions.push(
        EditorView.updateListener.of((update) => {
          if (update.docChanged) {
            handleChange(update.state.doc.toString());
          }
        })
      );
    }

    if (readOnly) {
      extensions.push(EditorState.readOnly.of(true));
    }

    const state = EditorState.create({
      doc: value,
      extensions,
    });

    const view = new EditorView({
      state,
      parent: containerRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
      viewRef.current = null;
    };
  }, [handleChange, readOnly, onChange, language]);

  // Update editor when value changes externally
  useEffect(() => {
    const view = viewRef.current;
    if (!view) return;

    const currentValue = view.state.doc.toString();
    if (currentValue !== value) {
      isInternalUpdate.current = true;
      view.dispatch({
        changes: {
          from: 0,
          to: currentValue.length,
          insert: value,
        },
      });
      isInternalUpdate.current = false;
    }
  }, [value]);

  return <div ref={containerRef} className={className} />;
}
