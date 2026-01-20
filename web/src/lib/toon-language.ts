import { StreamLanguage, StringStream } from '@codemirror/language';
import { tags as t } from '@lezer/highlight';

/**
 * TOON (Token-Oriented Object Notation) Syntax Highlighter
 * 
 * TOON is a compact, human-readable encoding of JSON for LLM prompts.
 * It combines YAML-like indentation with CSV-style tabular arrays.
 * 
 * Syntax examples:
 *   # Comment
 *   key: value
 *   nested:
 *     child: value
 *   array[3]: item1,item2,item3
 *   table[2]{id,name,active}:
 *     1,Alice,true
 *     2,Bob,false
 */

interface ToonState {
  // Are we parsing a header line (before the colon)?
  inHeader: boolean;
  // Are we inside braces {fields}?
  inBraces: boolean;
  // Are we inside brackets [count]?
  inBrackets: boolean;
  // Current indentation level
  indent: number;
  // Are we at the start of a line (for detecting keys)?
  atLineStart: boolean;
  // Have we seen a colon on this line? (for key: value detection)
  seenColon: boolean;
  // Are we in a data row (indented content after header)?
  inDataRow: boolean;
  // Are we inside a JSON array/object literal?
  jsonDepth: number;
}

const toonLanguage = StreamLanguage.define<ToonState>({
  name: 'toon',
  startState(): ToonState {
    return {
      inHeader: false,
      inBraces: false,
      inBrackets: false,
      indent: 0,
      atLineStart: true,
      seenColon: false,
      inDataRow: false,
      jsonDepth: 0,
    };
  },

  token(stream: StringStream, state: ToonState): string | null {
    // Handle start of line
    if (stream.sol()) {
      state.atLineStart = true;
      state.seenColon = false;
      state.inHeader = false;
      state.inBraces = false;
      state.inBrackets = false;
      state.jsonDepth = 0;
      
      // Measure indentation
      const spaces = stream.match(/^[ \t]*/);
      if (spaces) {
        state.indent = stream.pos;
        // If there's content after spaces, we're in a data row
        if (!stream.eol() && state.indent > 0) {
          state.inDataRow = true;
        } else {
          state.inDataRow = false;
        }
        if (state.indent > 0) {
          state.atLineStart = false;
          return null; // Don't highlight indentation
        }
      }
    }

    // Skip any remaining whitespace
    if (stream.eatSpace()) {
      return null;
    }

    // Comments - # to end of line
    if (stream.match(/^#.*/)) {
      return 'comment';
    }

    // Handle JSON literals embedded in values
    if (state.jsonDepth > 0) {
      const ch = stream.peek();
      if (ch === '{' || ch === '[') {
        state.jsonDepth++;
        stream.next();
        return 'brace';
      }
      if (ch === '}' || ch === ']') {
        state.jsonDepth--;
        stream.next();
        return 'brace';
      }
      if (ch === '"') {
        stream.next();
        while (!stream.eol()) {
          const c = stream.next();
          if (c === '\\') {
            stream.next(); // skip escaped char
          } else if (c === '"') {
            break;
          }
        }
        return 'string';
      }
      if (stream.match(/^-?\d+\.?\d*(?:[eE][+-]?\d+)?/)) {
        return 'number';
      }
      if (stream.match(/^true|^false/)) {
        return 'bool';
      }
      if (stream.match(/^null/)) {
        return 'null';
      }
      if (stream.eat(',') || stream.eat(':')) {
        return 'punctuation';
      }
      // JSON key or other content
      if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*/)) {
        return 'propertyName';
      }
      stream.next();
      return null;
    }

    // Start of JSON literal
    if ((stream.peek() === '[' || stream.peek() === '{') && !state.inBrackets && !state.inBraces) {
      // Check if this looks like a JSON literal (not a TOON header bracket)
      if (state.seenColon || state.inDataRow) {
        state.jsonDepth = 1;
        stream.next();
        return 'brace';
      }
    }

    // At line start or after indent - look for key/header pattern
    if (state.atLineStart || (!state.seenColon && !state.inDataRow)) {
      state.atLineStart = false;
      
      // Match header/key name: identifier followed by optional [count] and/or {fields} and :
      // Examples: schema{...}:, nodes[4]{...}:, required[2]:, context:, key:
      if (stream.match(/^[a-zA-Z_$][a-zA-Z0-9_$]*/)) {
        state.inHeader = true;
        const next = stream.peek();
        // Check what follows to determine token type
        if (next === '[' || next === '{' || next === ':') {
          return 'keyword'; // Section/key name
        }
        // Could be a key in YAML-style notation
        return 'keyword';
      }
    }

    // Inside header - handle brackets, braces, and their contents
    if (state.inHeader) {
      // Opening bracket for count [N]
      if (stream.eat('[')) {
        state.inBrackets = true;
        return 'squareBracket';
      }
      
      // Number inside brackets (the count)
      if (state.inBrackets) {
        if (stream.match(/^\d+/)) {
          return 'number';
        }
        if (stream.eat(']')) {
          state.inBrackets = false;
          return 'squareBracket';
        }
      }
      
      // Opening brace for field list {fields}
      if (stream.eat('{')) {
        state.inBraces = true;
        return 'brace';
      }
      
      // Inside braces - field names
      if (state.inBraces) {
        if (stream.eat(',')) {
          return 'punctuation';
        }
        // Field name (including $ prefix for JSON Schema fields like $id, $schema)
        if (stream.match(/^\$?[a-zA-Z_][a-zA-Z0-9_]*/)) {
          return 'propertyName';
        }
        if (stream.eat('}')) {
          state.inBraces = false;
          return 'brace';
        }
      }
      
      // Colon ends header, starts value/data section
      if (stream.eat(':')) {
        state.inHeader = false;
        state.seenColon = true;
        return 'punctuation';
      }
    }

    // After colon on same line (inline value) or in data rows
    if (state.seenColon || state.inDataRow) {
      // Quoted strings (double quotes)
      if (stream.peek() === '"') {
        stream.next();
        while (!stream.eol()) {
          const ch = stream.next();
          if (ch === '\\') {
            stream.next(); // skip escaped character
          } else if (ch === '"') {
            // Check for escaped quote ""
            if (stream.peek() === '"') {
              stream.next();
            } else {
              break;
            }
          }
        }
        return 'string';
      }

      // Single quoted strings
      if (stream.peek() === "'") {
        stream.next();
        while (!stream.eol()) {
          const ch = stream.next();
          if (ch === '\\') {
            stream.next();
          } else if (ch === "'") {
            break;
          }
        }
        return 'string';
      }

      // Comma separator
      if (stream.eat(',')) {
        return 'punctuation';
      }

      // Colon (for YAML-style key: value in nested content)
      if (stream.eat(':')) {
        state.seenColon = true;
        return 'punctuation';
      }

      // Boolean values
      if (stream.match(/^true(?=,|$|\s|]|})/)) {
        return 'bool';
      }
      if (stream.match(/^false(?=,|$|\s|]|})/)) {
        return 'bool';
      }

      // Null
      if (stream.match(/^null(?=,|$|\s|]|})/)) {
        return 'null';
      }

      // Numbers (integer, float, negative, scientific notation)
      if (stream.match(/^-?\d+\.?\d*(?:[eE][+-]?\d+)?(?=,|$|\s|]|})/)) {
        return 'number';
      }

      // URLs (common patterns)
      if (stream.match(/^https?:\/\/[^\s,]+/)) {
        return 'url';
      }

      // Pipe-separated enum values (e.g., electronics|clothing|food)
      if (stream.match(/^[a-zA-Z_][a-zA-Z0-9_]*(?:\|[a-zA-Z_][a-zA-Z0-9_]*)+/)) {
        return 'atom';
      }

      // Regex/pattern (starts with ^ or contains regex chars)
      if (stream.match(/^\^[^\s,]+/)) {
        return 'regexp';
      }

      // Type keywords commonly used in schemas
      if (stream.match(/^(?:string|number|integer|boolean|object|array|null)(?=,|$|\s)/)) {
        return 'typeName';
      }

      // Date/time patterns (ISO format)
      if (stream.match(/^\d{4}-\d{2}-\d{2}(?:T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:\d{2})?)?(?=,|$|\s)/)) {
        return 'number';
      }

      // UUID pattern
      if (stream.match(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}(?=,|$|\s)/)) {
        return 'string2';
      }

      // Email pattern (simple detection)
      if (stream.match(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?=,|$|\s)/)) {
        return 'string2';
      }

      // Generic value - read until comma or end of line
      // But be careful not to consume everything
      if (stream.match(/^[^,\n\r\[\]{}]+/)) {
        const value = stream.current().trim();
        
        // Empty or whitespace-only value
        if (!value) {
          return null;
        }
        
        return 'string';
      }
    }

    // Fallback: consume one character
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
    string2: t.special(t.string),
    number: t.number,
    bool: t.bool,
    null: t.null,
    squareBracket: t.squareBracket,
    brace: t.brace,
    punctuation: t.punctuation,
    typeName: t.typeName,
    comment: t.lineComment,
    url: t.url,
    atom: t.atom,
    regexp: t.regexp,
  },
});

export function toon() {
  return toonLanguage;
}
