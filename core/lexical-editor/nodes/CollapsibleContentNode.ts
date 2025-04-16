import {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    ElementNode,
    LexicalEditor,
    LexicalNode,
    SerializedElementNode,
    Spread,
    NodeKey,
} from 'lexical';
import { IS_CHROME } from '@/lib/utils/environment';
import invariant from '@/lib/utils/invariant';
import { v4 as uuidv4 } from 'uuid';

import { $isCollapsibleContainerNode } from './CollapsibleContainerNode';
import { domOnBeforeMatch, setDomHiddenUntilFound } from '../utils';

export type SerializedCollapsibleContentNode = Spread<
    {
        blockId: string;
    },
    SerializedElementNode
>;

export function $convertCollapsibleContentElement(
    domNode: HTMLElement,
): DOMConversionOutput | null {
    const node = $createCollapsibleContentNode(uuidv4());
    return {
        node,
    };
}

export class CollapsibleContentNode extends ElementNode {
    __blockId: string;

    static getType(): string {
        return 'collapsible-content';
    }

    static clone(node: CollapsibleContentNode): CollapsibleContentNode {
        return new CollapsibleContentNode(node.__blockId, node.__key);
    }

    constructor(blockId?: string, key?: NodeKey) {
        super(key);
        this.__blockId = blockId || uuidv4();
    }

    createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
        const dom = document.createElement('div');
        dom.classList.add('Collapsible__content');
        if (IS_CHROME) {
            editor.getEditorState().read(() => {
                const containerNode = this.getParentOrThrow();
                invariant(
                    $isCollapsibleContainerNode(containerNode),
                    'Expected parent node to be a CollapsibleContainerNode',
                );
                if (!containerNode.__open) {
                    setDomHiddenUntilFound(dom);
                }
            });
            domOnBeforeMatch(dom, () => {
                editor.update(() => {
                    const containerNode = this.getParentOrThrow().getLatest();
                    invariant(
                        $isCollapsibleContainerNode(containerNode),
                        'Expected parent node to be a CollapsibleContainerNode',
                    );
                    if (!containerNode.__open) {
                        containerNode.toggleOpen();
                    }
                });
            });
        }
        return dom;
    }

    updateDOM(prevNode: CollapsibleContentNode, dom: HTMLElement): boolean {
        return false;
    }

    static importDOM(): DOMConversionMap | null {
        return {
            div: (domNode: HTMLElement) => {
                if (!domNode.hasAttribute('data-lexical-collapsible-content')) {
                    return null;
                }
                return {
                    conversion: $convertCollapsibleContentElement,
                    priority: 2,
                };
            },
        };
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('div');
        element.classList.add('Collapsible__content');
        element.setAttribute('data-lexical-collapsible-content', 'true');
        return { element };
    }

    static importJSON(
        serializedNode: SerializedCollapsibleContentNode,
    ): CollapsibleContentNode {
        const node = $createCollapsibleContentNode(serializedNode.blockId);
        return node;
    }

    isShadowRoot(): boolean {
        return true;
    }

    exportJSON(): SerializedCollapsibleContentNode {
        return {
            ...super.exportJSON(),
            blockId: this.__blockId,
            type: 'collapsible-content',
            version: 1,
        };
    }

    getBlockId(): string {
        return this.getLatest().__blockId;
    }
}

export function $createCollapsibleContentNode(blockId?: string): CollapsibleContentNode {
    return new CollapsibleContentNode(blockId);
}

export function $isCollapsibleContentNode(
    node: LexicalNode | null | undefined,
): node is CollapsibleContentNode {
    return node instanceof CollapsibleContentNode;
}