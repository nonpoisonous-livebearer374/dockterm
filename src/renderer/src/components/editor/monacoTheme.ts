import type { editor } from 'monaco-editor'

/** Monaco theme tuned to DockTerm's palette (tokens.css) so the editor, terminal,
 * and chrome read as one product. */
export const dockTermDark: editor.IStandaloneThemeData = {
  base: 'vs-dark',
  inherit: true,
  rules: [
    { token: 'comment', foreground: '6b6b76', fontStyle: 'italic' },
    { token: 'keyword', foreground: 'a78bfa' },
    { token: 'string', foreground: '86efac' },
    { token: 'number', foreground: 'fbbf24' },
    { token: 'regexp', foreground: '5eead4' },
    { token: 'type', foreground: '5eead4' },
    { token: 'type.identifier', foreground: '5eead4' },
    { token: 'function', foreground: '93b4ff' },
    { token: 'variable', foreground: 'e8e8ed' },
    { token: 'constant', foreground: 'fbbf24' },
    { token: 'tag', foreground: '93b4ff' },
    { token: 'attribute.name', foreground: 'c4b5fd' },
    { token: 'delimiter', foreground: 'a0a0ab' }
  ],
  colors: {
    'editor.background': '#0d0d0f',
    'editor.foreground': '#e8e8ed',
    'editorLineNumber.foreground': '#3a3a45',
    'editorLineNumber.activeForeground': '#a0a0ab',
    'editor.selectionBackground': '#7c6bff44',
    'editor.inactiveSelectionBackground': '#7c6bff22',
    'editor.lineHighlightBackground': '#15151d',
    'editor.lineHighlightBorder': '#00000000',
    'editorCursor.foreground': '#7c6bff',
    'editorIndentGuide.background1': '#1f1f29',
    'editorIndentGuide.activeBackground1': '#34343f',
    'editorWhitespace.foreground': '#26262e',
    'editorGutter.background': '#0d0d0f',
    'editorWidget.background': '#131318',
    'editorWidget.border': '#26262e',
    'editorSuggestWidget.background': '#16161c',
    'editorSuggestWidget.selectedBackground': '#7c6bff22',
    'input.background': '#0d0d0f',
    'scrollbarSlider.background': '#34343f80',
    'scrollbarSlider.hoverBackground': '#46465290',
    'editorOverviewRuler.border': '#00000000'
  }
}
