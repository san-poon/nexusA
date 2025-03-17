import type { Klass, LexicalNode } from 'lexical';

import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { MarkNode } from '@lexical/mark';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ImageNode } from '../plugins/images-plugin/ImageNode';
import { EquationNode } from './EquationNode';
import { CollapsibleContentNode } from '../plugins/collapsible/CollapsibleContentNode';
import { CollapsibleContainerNode } from '../plugins/collapsible/CollapsibleContainerNode';
import { CollapsibleTitleNode } from '../plugins/collapsible/CollapsibleTitleNode';
import { MCQContainerNode } from '../plugins/mcq/mcqContainerNode';
import { MCQQuestionNode } from '../plugins/mcq/mcqQuestionNode';
import { MCQOptionNode } from '../plugins/mcq/mcqOptionNode';
import { MCQOptionsContainerNode } from '../plugins/mcq/mcqOptionsContainerNode';
import { ExplanationNode } from '../plugins/mcq/explanationNode';


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