// CodeMirror 6 editor factory for Devnip
// Wraps CM6 initialization with language-specific highlighting
import { EditorView, keymap, placeholder as cmPlaceholder } from '@codemirror/view';
import { EditorState, Compartment } from '@codemirror/state';
import { json } from '@codemirror/lang-json';
import { yaml } from '@codemirror/lang-yaml';
import { markdown } from '@codemirror/lang-markdown';
import { HighlightStyle, syntaxHighlighting, StreamLanguage } from '@codemirror/language';
import { tags } from '@lezer/highlight';

// ─── Theme: match Devnip's CSS variable design ───
const devnipTheme = EditorView.theme({
  '&': {
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
  },
  '&.cm-focused': {
    outline: 'none',
  },
  '.cm-scroller': {
    fontFamily: 'var(--font-mono)',
    lineHeight: '1.6',
  },
  '.cm-content': {
    caretColor: 'var(--text)',
    padding: '10px 0',
  },
  '.cm-line': {
    padding: '0 12px',
  },
  '.cm-gutters': {
    display: 'none',
  },
  '.cm-activeLine': {
    backgroundColor: 'transparent',
  },
  '.cm-selectionBackground': {
    backgroundColor: 'var(--primary-ring)',
  },
  '&.cm-focused .cm-selectionBackground': {
    backgroundColor: 'var(--primary-ring)',
  },
  '.cm-cursor': {
    borderLeftColor: 'var(--text)',
  },
  // Placeholder
  '.cm-placeholder': {
    color: 'var(--text-muted)',
    fontStyle: 'normal',
  },
}, { dark: false });

// Standalone mode: larger font
const standaloneTheme = EditorView.theme({
  '&': {
    fontSize: '13px',
  },
});

// ─── Syntax highlight color tokens (centralized for easy theming) ───
const HIGHLIGHT_COLORS = {
  // GitHub Light Default
  light: {
    key: '#953800',
    string: '#0a3069',
    number: '#0550ae',
    bool: '#0550ae',
    keyword: '#cf222e',
    punctuation: '#24292f',
    comment: '#6e7781',
    heading: '#0550ae',
    link: '#0969da',
    monospace: '#0550ae',
    meta: '#8250df',
    atom: '#0550ae',
  },
  // GitHub Dark Default
  dark: {
    key: '#ffa657',
    string: '#a5d6ff',
    number: '#79c0ff',
    bool: '#79c0ff',
    keyword: '#ff7b72',
    punctuation: '#c9d1d9',
    comment: '#8b949e',
    heading: '#79c0ff',
    link: '#58a6ff',
    monospace: '#79c0ff',
    meta: '#d2a8ff',
    atom: '#79c0ff',
  },
};

function buildHighlightStyle(colors) {
  return HighlightStyle.define([
    { tag: tags.propertyName, color: colors.key },
    { tag: tags.string, color: colors.string },
    { tag: tags.number, color: colors.number },
    { tag: tags.bool, color: colors.bool },
    { tag: tags.null, color: colors.bool },
    { tag: tags.keyword, color: colors.keyword },
    { tag: tags.punctuation, color: colors.punctuation },
    { tag: tags.comment, color: colors.comment, fontStyle: 'italic' },
    { tag: tags.heading, color: colors.heading, fontWeight: 'bold' },
    { tag: tags.emphasis, fontStyle: 'italic' },
    { tag: tags.strong, fontWeight: 'bold' },
    { tag: tags.link, color: colors.link, textDecoration: 'underline' },
    { tag: tags.monospace, color: colors.monospace },
    { tag: tags.meta, color: colors.meta },
    { tag: tags.atom, color: colors.atom },
  ]);
}

const devnipHighlight = buildHighlightStyle(HIGHLIGHT_COLORS.light);
const devnipHighlightDark = buildHighlightStyle(HIGHLIGHT_COLORS.dark);

// ─── Custom StreamLanguage for QueryString ───
const queryStringLang = StreamLanguage.define({
  token(stream) {
    if (stream.match(/[&?#]/)) return 'punctuation';
    if (stream.match(/=/)) return 'punctuation';
    // Key (before =)
    if (stream.match(/[^=&?#]+(?==)/)) return 'propertyName';
    // Value (after =)
    if (stream.match(/[^&?#]+/)) return 'string';
    stream.next();
    return null;
  },
});

// ─── Custom StreamLanguage for JWT ───
const jwtLang = StreamLanguage.define({
  startState() {
    return { part: 0 };
  },
  token(stream, state) {
    if (stream.match('.')) {
      state.part++;
      return 'punctuation';
    }
    if (stream.match(/[^.]+/)) {
      if (state.part === 0) return 'propertyName';  // header
      if (state.part === 1) return 'string';         // payload
      return 'number';                                // signature
    }
    stream.next();
    return null;
  },
});

// ─── Custom StreamLanguage for Cron ───
const cronLang = StreamLanguage.define({
  token(stream) {
    if (stream.eatSpace()) return null;
    if (stream.match(/\*\/\d+/)) return 'number';
    if (stream.match('*')) return 'punctuation';
    if (stream.match(/\d+-\d+/)) return 'number';
    if (stream.match(/\d+/)) return 'number';
    if (stream.match(/[,/]/)) return 'punctuation';
    stream.next();
    return null;
  },
});

// ─── Language config map ───
function getLanguageExtension(lang) {
  switch (lang) {
    case 'json': return json();
    case 'yaml': return yaml();
    case 'markdown': return markdown();
    case 'querystring': return queryStringLang;
    case 'jwt': return jwtLang;
    case 'cron': return cronLang;
    default: return [];
  }
}

// ─── Determine if dark mode is active ───
function isDarkMode() {
  const theme = document.documentElement.getAttribute('data-theme');
  if (theme === 'dark') return true;
  if (theme === 'light') return false;
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

// ─── Track all editor instances with their highlight compartments ───
const editorInstances = [];

function getHighlightExtension() {
  const dark = isDarkMode();
  return syntaxHighlighting(dark ? devnipHighlightDark : devnipHighlight);
}

// ─── Create a CodeMirror editor ───
// Options:
//   parent: HTMLElement - container to mount editor
//   lang: string - language type (json, yaml, markdown, querystring, jwt, cron)
//   placeholder: string - placeholder text
//   readOnly: boolean - if true, editor is not editable
//   onChange: (value: string) => void - called when content changes
//   singleLine: boolean - if true, single line mode (for cron input)
//   isStandalone: boolean - if true, use larger font
export function createEditor({
  parent,
  lang = 'json',
  placeholder = '',
  readOnly = false,
  onChange = null,
  singleLine = false,
  isStandalone = false,
}) {
  const langExt = getLanguageExtension(lang);
  const highlightCompartment = new Compartment();

  const extensions = [
    devnipTheme,
    highlightCompartment.of(getHighlightExtension()),
    EditorView.lineWrapping,
  ];

  if (isStandalone) {
    extensions.push(standaloneTheme);
  }

  if (placeholder) {
    extensions.push(cmPlaceholder(placeholder));
  }

  if (readOnly) {
    extensions.push(EditorState.readOnly.of(true));
    extensions.push(EditorView.editable.of(false));
  }

  if (langExt) {
    if (Array.isArray(langExt)) {
      extensions.push(...langExt);
    } else {
      extensions.push(langExt);
    }
  }

  if (onChange) {
    extensions.push(EditorView.updateListener.of(update => {
      if (update.docChanged) {
        onChange(update.state.doc.toString());
      }
    }));
  }

  // Single line: prevent Enter key
  if (singleLine) {
    extensions.push(keymap.of([{
      key: 'Enter',
      run: () => true, // consume the keypress
    }]));
  }

  const view = new EditorView({
    state: EditorState.create({
      doc: '',
      extensions,
    }),
    parent,
  });

  // Track for theme switching
  editorInstances.push({ view, compartment: highlightCompartment });

  return view;
}

// ─── Update all editors' highlight theme ───
export function updateEditorsTheme() {
  const ext = getHighlightExtension();
  for (const { view, compartment } of editorInstances) {
    view.dispatch({
      effects: compartment.reconfigure(ext),
    });
  }
}

// ─── Utility: get/set editor content ───
export function getEditorValue(view) {
  return view.state.doc.toString();
}

export function setEditorValue(view, value) {
  const currentValue = view.state.doc.toString();
  if (currentValue === value) return;
  view.dispatch({
    changes: {
      from: 0,
      to: view.state.doc.length,
      insert: value || '',
    },
  });
}

// ─── Utility: focus editor ───
export function focusEditor(view) {
  view.focus();
}
