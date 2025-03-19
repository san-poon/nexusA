import { EditorThemeClasses } from "lexical";
import './editorTheme.css';

export const CODE_HIGHLIGHT_THEME_CLASSES = {
  atrule: 'text-violet-500 dark:text-violet-400', // Violet for @rules
  attr: 'text-sky-500 dark:text-sky-400', // Sky for attributes
  boolean: 'text-cyan-500 dark:text-cyan-400', // Cyan for booleans
  builtin: 'text-blue-500 dark:text-blue-400', // Blue for built-ins
  cdata: 'text-gray-500 dark:text-gray-400', // Gray for CDATA
  char: 'text-pink-500 dark:text-pink-400', // Pink for character data
  class: 'text-amber-500 dark:text-amber-400', // Amber for classes
  'class-name': 'text-indigo-500 dark:text-indigo-400', // Indigo for class names
  comment: 'text-gray-400 dark:text-gray-500 italic', // Gray for comments, italicized
  constant: 'text-teal-500 dark:text-teal-400', // Teal for constants
  deleted: 'text-red-500 dark:text-red-300 line-through', // Red for deleted text, line-through
  doctype: 'text-gray-500 dark:text-gray-400', // Gray for doctype
  entity: 'text-violet-500 dark:text-violet-400', // Violet for entities
  function: 'text-emerald-500 dark:text-emerald-400', // Green for functions
  important: 'text-red-500 dark:text-red-400 font-medium', // Red for important, bold
  inserted: 'text-green-500 dark:text-green-400', // Green for inserted text
  keyword: 'text-teal-500 dark:text-teal-400 font-medium', // Indigo for keywords, bold
  namespace: 'text-gray-500 dark:text-gray-400', // Gray for namespace
  normal: 'text-gray-900 dark:text-gray-100', // Normal text
  number: 'text-orange-500 dark:text-orange-400', // Orange for numbers
  operator: 'text-pink-500 dark:text-pink-400', // Pink for operators
  prolog: 'text-gray-500 dark:text-gray-400', // Gray for prolog
  property: 'text-blue-500 dark:text-blue-400', // Blue for properties
  punctuation: 'text-gray-700 dark:text-gray-300', // Gray for punctuation
  regex: 'text-violet-500 dark:text-violet-400', // Violet for regex
  selector: 'text-green-500 dark:text-green-400', // Green for selectors
  string: 'text-amber-500 dark:text-amber-400', // Amber for strings
  symbol: 'text-sky-500 dark:text-sky-400', // Sky for symbols
  tag: 'text-red-500 dark:text-red-400', // Red for tags
  url: 'text-blue-500 dark:text-blue-400', // Blue for URLs
  variable: 'text-fuchsia-500 dark:text-fuchsia-400', // Fuchsia for variables
};

const theme: EditorThemeClasses = {
  ltr: ' text-left',
  rtl: ' text-right',
  blockquote: 'border-l-4 border-gray-300 pl-4 italic',
  quote: 'bg-wash-90 dark:bg-wash-750 pl-4 pr-2 py-2 rounded-3xl border-l-4 border-wash-500 italic',

  code: ' code block rounded-xl shadow-xl dark:bg-neutral-900 overflow-x-auto text-sm',
  codeHighlight: CODE_HIGHLIGHT_THEME_CLASSES,

  heading: {
    h1: 'text-4xl font-medium mt-6 mb-4 tracking-tight',
    h2: 'text-3xl font-medium mt-5 mb-3 tracking-tight',
    h3: 'text-2xl font-medium mt-4 mb-2 tracking-tight',
    h4: 'text-xl font-medium mt-3 mb-2',
    h5: 'text-lg font-medium mt-2 mb-1',
    h6: 'text-base font-medium mt-1 mb-0.5'
  },
  hr: 'hr',
  image: 'editor-image',
  inlineImage: 'inline-editor-image',
  link: "no-underline hover:underline underline-offset-4 text-cyan-600 dark:text-cyan-200 transition-colors cursor-pointer",
  list: {
    checklist: '',
    listitem: 'my-0 ps-1 lg:ps-6',
    listitemChecked: '',
    listitemUnchecked: '',
    nested: {
      listitem: '',
    },
    ol: 'list-decimal leading-8 list-inside marker:text-neutral-700 dark:marker:text-neutral-300',
    ul: 'list-disc leading-8 list-inside marker:text-neutral-700 dark:marker:text-neutral-300',
  },
  paragraph: 'leading-8 my-4 realtive whitespace-pre-wrap',

  table: 'table',
  tableCell: "tableCell",
  tableCellActionButton: 'tableCellActionButton',
  tableCellActionButtonContainer: 'tableCellActionButtonContainer',
  tableCellEditing: 'tableCellEditing',
  tableCellHeader: 'tableCellHeader',
  tableCellPrimarySelected: 'tableCellPrimarySelected',
  tableCellResizer: 'tableCellResizer',
  tableCellSelected: 'tableCellSelected',
  tableCellSortedIndicator: 'tableCellSortedIndicator',
  tableResizeRuler: 'tableResizeRuler',
  tableSelected: 'tableSelected',
  tableRow: '',
  tableAddRows: 'tableAddRows',
  tableAddColumns: 'tableAddColumns',
  tableCellResizeRuler: 'tableCellResizeRuler',

  text: {
    bold: 'font-bold dark:opacity-90',
    italic: 'italic',
    underline: 'underline underline-offset-4',
    strikethrough: 'line-through',
    underlineStrikethrough: 'underline line-through',
    code: 'codeText bg-wash-80 dark:bg-wash-720 px-1 rounded-sm text-sm',
    subscript: 'text-[0.8em] align-sub !important',
    superscript: 'text-[0.8em] align-super',
  },

};

export default theme;