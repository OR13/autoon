'use client';

import { useEffect, useRef, useCallback } from 'react';
import { EditorView, basicSetup } from 'codemirror';
import { EditorState, Extension } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { createTheme } from '@uiw/codemirror-themes';
import { tags as t } from '@lezer/highlight';
import { toon } from '@/lib/toon-language';

// Golden Dark theme for CodeMirror 6 - matches Autoon gold & dark grey theme
const goldenDarkTheme = createTheme({
  theme: 'dark',
  settings: {
    background: '#0A0A0A',           // near black base
    foreground: '#E5E5E5',           // light grey text
    caret: '#F7C974',                 // gold caret
    selection: '#1A1A1A',             // dark grey selection
    selectionMatch: '#242424',        // slightly lighter for matches
    lineHighlight: '#141414',        // dark grey line highlight
    gutterBackground: '#0A0A0A',     // near black gutter
    gutterForeground: '#666666',     // muted grey line numbers
    gutterBorder: 'transparent',
  },
  styles: [
    // Comments - muted grey
    { tag: t.comment, color: '#666666', fontStyle: 'italic' },
    { tag: t.lineComment, color: '#666666', fontStyle: 'italic' },
    { tag: t.blockComment, color: '#666666', fontStyle: 'italic' },
    { tag: t.docComment, color: '#666666', fontStyle: 'italic' },
    
    // Strings - light gold/green tint
    { tag: t.string, color: '#E8D5A3' }, // warm light gold
    { tag: t.special(t.string), color: '#FFE55C' }, // bright gold for special strings
    
    // Literals - gold accents
    { tag: t.number, color: '#F7C974' }, // gold numbers
    { tag: t.bool, color: '#FFD700' }, // bright gold for booleans
    { tag: t.null, color: '#B85C5C' }, // muted red for null
    
    // Keywords & Types - gold primary
    { tag: t.keyword, color: '#F7C974', fontWeight: 'bold' }, // gold keywords
    { tag: t.typeName, color: '#FFD700' }, // bright gold for types
    { tag: t.className, color: '#FFD700' },
    { tag: t.definition(t.typeName), color: '#FFD700' },
    
    // Properties & Attributes - gold variations
    { tag: t.propertyName, color: '#FFE55C' }, // light gold for properties
    { tag: t.definition(t.propertyName), color: '#FFE55C' },
    { tag: t.attributeName, color: '#F7C974' }, // gold attributes
    { tag: t.attributeValue, color: '#E8D5A3' }, // warm gold values
    
    // Special values - gold and accent colors
    { tag: t.atom, color: '#FFE55C' }, // bright gold for atoms
    { tag: t.url, color: '#E8943A', textDecoration: 'underline' }, // golden red for URLs
    { tag: t.regexp, color: '#FF8C42' }, // orange for regex
    
    // Brackets & Punctuation - gold accents
    { tag: t.squareBracket, color: '#F7C974' }, // gold brackets
    { tag: t.brace, color: '#F7C974' }, // gold braces
    { tag: t.punctuation, color: '#999999' }, // muted grey punctuation
    { tag: t.paren, color: '#CCCCCC' }, // light grey parens
    { tag: t.angleBracket, color: '#CCCCCC' },
    { tag: t.derefOperator, color: '#CCCCCC' },
    { tag: t.separator, color: '#999999' },
    
    // Variables & Functions - neutral with gold accents
    { tag: t.variableName, color: '#E5E5E5' }, // light grey variables
    { tag: t.definition(t.variableName), color: '#E5E5E5' },
    { tag: t.function(t.variableName), color: '#F7C974' }, // gold functions
    { tag: t.function(t.propertyName), color: '#F7C974' },
    { tag: t.operator, color: '#FFD700' }, // bright gold operators
    { tag: t.tagName, color: '#FFE55C' }, // light gold tags
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
      goldenDarkTheme,
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
