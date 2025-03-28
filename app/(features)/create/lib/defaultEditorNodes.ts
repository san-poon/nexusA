import type { Klass, LexicalNode } from 'lexical';

import { CodeNode, CodeHighlightNode } from '@lexical/code';
import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { MarkNode } from '@lexical/mark';
import { TableNode, TableCellNode, TableRowNode } from '@lexical/table';
import { ImageNode } from '../content-editor/plugins/image/ImageNode';
import { EquationNode } from '../content-editor/plugins/equation/EquationNode';
import { CollapsibleContentNode } from '../content-editor/plugins/collapsible/CollapsibleContentNode';
import { CollapsibleContainerNode } from '../content-editor/plugins/collapsible/CollapsibleContainerNode';
import { CollapsibleTitleNode } from '../content-editor/plugins/collapsible/CollapsibleTitleNode';
import { MCQContainerNode } from '../content-editor/plugins/mcq/mcqContainerNode';
import { MCQQuestionNode } from '../content-editor/plugins/mcq/mcqQuestionNode';
import { MCQOptionNode } from '../content-editor/plugins/mcq/mcqOptionNode';
import { MCQOptionsContainerNode } from '../content-editor/plugins/mcq/mcqOptionsContainerNode';
import { ExplanationNode } from '../content-editor/plugins/mcq/explanationNode';


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