import { StreamLanguage, StringStream } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

interface ToonState {
  inSection: 'graph' | 'nodes' | 'edges' | 'metadata' | null;
  inHeader: boolean;
  inBraces: boolean;
  inBrackets: boolean;
  lineStart: boolean;
}

const toonLanguage = StreamLanguage.define<ToonState>({
  name: 'toon',
  startState(): ToonState {
    return {
      inSection: null,
      inHeader: false,
      inBraces: false,
      inBrackets: false,
      lineStart: true,
    };
  },
  token(stream: StringStream, state: ToonState): string | null {
    // Start of line
    if (stream.sol()) {
      state.lineStart = true;
      state.inHeader = false;
    }

    // Skip whitespace at start (but track indentation)
    if (state.lineStart && stream.eatSpace()) {
      state.lineStart = false;
      return null;
    }
    state.lineStart = false;

    // Check for section headers at start of non-indented line
    if (stream.sol() || stream.pos === 0) {
      // Match 'graph', 'nodes', 'edges', 'metadata'
      if (stream.match(/^graph(?=\{)/)) {
        state.inSection = 'graph';
        state.inHeader = true;
        return 'keyword';
      }
      if (stream.match(/^nodes(?=\[)/)) {
        state.inSection = 'nodes';
        state.inHeader = true;
        return 'keyword';
      }
      if (stream.match(/^edges(?=\[)/)) {
        state.inSection = 'edges';
        state.inHeader = true;
        return 'keyword';
      }
      if (stream.match(/^metadata:/)) {
        state.inSection = 'metadata';
        return 'keyword';
      }
    }

    // In header mode - parse braces, brackets, etc.
    if (state.inHeader) {
      // Opening bracket for count
      if (stream.eat('[')) {
        state.inBrackets = true;
        return 'bracket';
      }
      // Closing bracket
      if (stream.eat(']')) {
        state.inBrackets = false;
        return 'bracket';
      }
      // Number inside brackets (count)
      if (state.inBrackets && stream.match(/^\d+/)) {
        return 'number';
      }
      // Opening brace for fields
      if (stream.eat('{')) {
        state.inBraces = true;
        return 'brace';
      }
      // Closing brace
      if (stream.eat('}')) {
        state.inBraces = false;
        return 'brace';
      }
      // Field names inside braces
      if (state.inBraces) {
        if (stream.eat(',')) {
          return 'punctuation';
        }
        if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
          return 'propertyName';
        }
      }
      // Colon at end of header
      if (stream.eat(':')) {
        state.inHeader = false;
        return 'punctuation';
      }
    }

    // Data lines (indented content)
    // Boolean keywords
    if (stream.match(/^true(?=,|$|\s)/)) {
      return 'bool';
    }
    if (stream.match(/^false(?=,|$|\s)/)) {
      return 'bool';
    }

    // Numbers
    if (stream.match(/^-?\d+\.?\d*(?=,|$|\s)/)) {
      return 'number';
    }

    // Comma separator
    if (stream.eat(',')) {
      return 'punctuation';
    }

    // Colon in metadata
    if (state.inSection === 'metadata' && stream.eat(':')) {
      return 'punctuation';
    }

    // Quoted strings
    if (stream.peek() === '"') {
      stream.next();
      while (!stream.eol()) {
        const ch = stream.next();
        if (ch === '"') {
          if (stream.peek() === '"') {
            stream.next(); // escaped quote
          } else {
            break;
          }
        }
      }
      return 'string';
    }

    // Regular value (identifier-like or any text until comma)
    if (stream.match(/^[^,\n]+/)) {
      // Check if it looks like a node type
      const matched = stream.current();
      const nodeTypes = ['class', 'attribute', 'method', 'instance', 'state', 'action', 'decision', 'start', 'end', 'fork', 'join'];
      const relationTypes = ['flows', 'has', 'uses', 'inherits', 'guards'];
      
      if (nodeTypes.includes(matched.trim())) {
        return 'typeName';
      }
      if (relationTypes.includes(matched.trim())) {
        return 'keyword';
      }
      return 'string';
    }

    // Fallback: advance one character
    stream.next();
    return null;
  },
  languageData: {
    commentTokens: { line: '#' },
  },
  tokenTable: {
    keyword: t.keyword,
    propertyName: t.propertyName,
    string: t.string,
    number: t.number,
    bool: t.bool,
    bracket: t.squareBracket,
    brace: t.brace,
    punctuation: t.punctuation,
    typeName: t.typeName,
  },
});

export function toon() {
  return toonLanguage;
}
