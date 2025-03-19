import { EditorThemeClasses } from "lexical";
import './editorTheme.css';

const theme: EditorThemeClasses = {
  ltr: ' text-left',
  rtl: ' text-right',
  blockquote: 'border-l-4 border-gray-300 pl-4 italic',
  quote: 'bg-wash-90 dark:bg-wash-750 pl-4 pr-2 py-2 rounded-3xl border-l-4 border-wash-500 italic',

  code: ' code block rounded-xl shadow-xl dark:bg-neutral-900 overflow-x-auto text-sm',
  codeHighlight: {
    atrule: 'text-purple-600 dark:text-purple-400', // Purple for @rules
    attr: 'text-green-700 dark:text-green-400', // Green for attributes
    boolean: 'text-blue-600 dark:text-blue-400', // Blue for booleans
    builtin: 'text-blue-600 dark:text-blue-400', // Blue for built-ins
    cdata: 'text-gray-500 dark:text-gray-400', // Gray for CDATA
    char: 'text-yellow-700 dark:text-yellow-400', // Yellow for character data
    class: 'text-yellow-600 dark:text-yellow-400', // Yellow for class
    'class-name': 'text-blue-700 dark:text-blue-400', // Blue for class names
    comment: 'text-gray-500 dark:text-gray-400 italic', // Gray for comments, italicized
    constant: 'text-blue-600 dark:text-blue-400', // Blue for constants
    deleted: 'text-red-600 dark:text-red-300 line-through', // Red for deleted text, line-through
    doctype: 'text-gray-500 dark:text-gray-400', // Gray for doctype
    entity: 'text-purple-600 dark:text-purple-400', // Purple for entities
    function: 'text-yellow-600 dark:text-yellow-300', // Yellow for functions
    important: 'text-red-600 dark:text-red-500 font-medium', // Red for important, bold
    inserted: 'text-green-700 dark:text-green-400', // Green for inserted text
    keyword: 'text-red-600 dark:text-red-400 font-medium', // Purple for keywords, bold
    namespace: 'text-gray-500 dark:text-gray-400', // Gray for namespace
    number: 'text-blue-600 dark:text-blue-400', // Blue for numbers
    operator: 'text-gray-900 dark:text-gray-100', // Dark gray for operators
    prolog: 'text-gray-500 dark:text-gray-400', // Gray for prolog
    property: 'text-blue-600 dark:text-blue-400', // Blue for properties
    punctuation: 'text-gray-900 dark:text-gray-100', // Dark gray for punctuation
    regex: 'text-blue-600 dark:text-blue-300', // Blue for regex
    selector: 'text-purple-600 dark:text-purple-300', // Purple for selectors
    string: 'text-green-700 dark:text-green-300', // Green for strings
    symbol: 'text-blue-600 dark:text-blue-300', // Blue for symbols
    tag: 'text-blue-700 dark:text-blue-300', // Blue for tags
    url: 'text-blue-600 dark:text-blue-300', // Blue for URLs
    variable: 'text-orange-600 dark:text-orange-400', // Orange for variables
  },

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