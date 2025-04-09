import { EditorThemeClasses } from "lexical";
import './editorTheme.css';

export const CODE_HIGHLIGHT_THEME_CLASSES = {
  atrule: 'text-violet-500 dark:text-violet-400',
  attr: 'text-sky-500 dark:text-sky-400',
  boolean: 'text-cyan-500 dark:text-cyan-400',
  builtin: 'text-blue-500 dark:text-blue-400',
  cdata: 'text-gray-500 dark:text-gray-400',
  char: 'text-pink-500 dark:text-pink-400',
  class: 'text-amber-500 dark:text-amber-400',
  'class-name': 'text-indigo-500 dark:text-indigo-400',
  comment: 'text-gray-400 dark:text-gray-500 italic',
  constant: 'text-teal-500 dark:text-teal-400',
  deleted: 'text-red-500 dark:text-red-300 line-through',
  doctype: 'text-gray-500 dark:text-gray-400',
  entity: 'text-violet-500 dark:text-violet-400',
  function: 'text-emerald-500 dark:text-emerald-400',
  important: 'text-red-500 dark:text-red-400 font-medium',
  inserted: 'text-green-500 dark:text-green-400',
  keyword: 'text-cyan-500 font-medium',
  namespace: 'text-gray-500 dark:text-gray-400',
  normal: 'text-cyan-500',
  number: 'text-orange-500 dark:text-orange-400',
  operator: 'text-sky-500',
  prolog: 'text-gray-500 dark:text-gray-400',
  property: 'text-blue-500 dark:text-blue-400',
  punctuation: 'text-gray-700 dark:text-gray-300',
  regex: 'text-slate-500',
  selector: 'text-green-500 dark:text-green-400',
  string: 'text-amber-500 dark:text-amber-400',
  symbol: 'text-cyan-500',
  tag: 'text-violet-500',
  url: 'text-blue-500 dark:text-blue-400',
  variable: 'text-lime-500',
};

const theme: EditorThemeClasses = {
  ltr: ' text-left',
  rtl: ' text-right',
  blockquote: 'border-l-4 border-gray-300 pl-4 italic',
  quote: 'bg-wash-90 dark:bg-wash-750 pl-4 pr-2 py-2 rounded-3xl border-l-4 border-wash-500 italic',

  code: ' code block rounded-xl shadow-xl dark:bg-neutral-900 overflow-x-auto text-sm',
  codeHighlight: CODE_HIGHLIGHT_THEME_CLASSES,

  heading: {
    h1: 'text-4xl mt-0 mb-4 tracking-tighter',
    h2: 'text-2xl mt-6 mb-3 tracking-tighter',
    h3: 'text-xl mt-6 mb-2 tracking-tighter',
    h4: 'text-lg mt-5 mb-2',
    h5: 'text-base mt-5 mb-1',
    h6: 'text-base mt-4 mb-0.5'
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
    ol: 'list-decimal leading-8 list-inside marker:text-neutral-500',
    ul: 'list-disc leading-8 list-inside marker:text-neutral-500',
  },
  paragraph: 'leading-relaxed my-4 whitespace-pre-wrap min-h-8',

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
    strikethrough: 'line-through text-wash-500',
    underlineStrikethrough: 'underline line-through',
    code: 'codeText bg-wash-80 dark:bg-wash-720 px-2 py-0.5 rounded-sm text-sm',
    subscript: 'text-[0.8em] align-sub !important',
    superscript: 'text-[0.8em] align-super',
  },

};

export default theme;