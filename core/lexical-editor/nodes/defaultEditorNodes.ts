import type { Klass, LexicalNode } from 'lexical';

import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { MarkNode } from '@lexical/mark';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ImageNode } from './ImageNode';
import { EquationNode } from './EquationNode';
import { CollapsibleContentNode } from './CollapsibleContentNode';
import { CollapsibleContainerNode } from './CollapsibleContainerNode';
import { CollapsibleTitleNode } from './CollapsibleTitleNode';
import { MCQContainerNode } from './mcqContainerNode';
import { MCQQuestionNode } from './mcqQuestionNode';
import { MCQOptionNode } from './mcqOptionNode';
import { MCQOptionsContainerNode } from './mcqOptionsContainerNode';
import { ExplanationNode } from './explanationNode';


const defaultEditorNodes: Array<Klass<LexicalNode>> = [
  CollapsibleContentNode,
  CollapsibleContainerNode,
  CollapsibleTitleNode,
  EquationNode,
  ExplanationNode,
  HeadingNode,
  QuoteNode,
  ListNode,
  ListItemNode,
  CodeNode,
  CodeHighlightNode,
  LinkNode,
  AutoLinkNode,
  HorizontalRuleNode,
  ImageNode,
  MarkNode,
  MCQContainerNode,
  MCQQuestionNode,
  MCQOptionNode,
  MCQOptionsContainerNode,
  TableNode,
  TableCellNode,
  TableRowNode,
];

export default defaultEditorNodes;