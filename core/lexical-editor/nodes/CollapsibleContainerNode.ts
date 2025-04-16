/**
 * Copyright (c) Meta Platforms, Inc. and affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    ElementNode,
    isHTMLElement,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    Spread,
} from 'lexical';
import { IS_CHROME } from '@/lib/utils/environment';
import invariant from '@/lib/utils/invariant';
import { v4 as uuidv4 } from 'uuid';

import { setDomHiddenUntilFound } from '../utils';

export type SerializedCollapsibleContainerNode = Spread<
    {
        open: boolean;
        blockId: string;
    },
    SerializedElementNode
>;

export class CollapsibleContainerNode extends ElementNode {
    __open: boolean;
    __blockId: string;

    constructor(open: boolean, blockId?: string, key?: NodeKey) {
        super(key);
        this.__open = open;
        this.__blockId = blockId || uuidv4();
    }

    static getType(): string {
        return 'collapsible-container';
    }

    static clone(node: CollapsibleContainerNode): CollapsibleContainerNode {
        return new CollapsibleContainerNode(node.__open, node.__blockId, node.__key);
    }

    createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
        // details is not well supported in Chrome #5582
        let dom: HTMLElement;
        if (IS_CHROME) {
            dom = document.createElement('div');
            dom.setAttribute('open', '');
        } else {
            const detailsDom = document.createElement('details');
            detailsDom.open = this.__open;
            detailsDom.addEventListener('toggle', () => {
                const open = editor.getEditorState().read(() => this.getOpen());
                if (open !== detailsDom.open) {
                    editor.update(() => this.toggleOpen());
                }
            });
            dom = detailsDom;
        }
        dom.classList.add('Collapsible__container');

        return dom;
    }

    updateDOM(
        prevNode: CollapsibleContainerNode,
        dom: HTMLDetailsElement,
    ): boolean {
        const currentOpen = this.__open;
        if (prevNode.__open !== currentOpen) {
            // details is not well supported in Chrome #5582
            if (IS_CHROME) {
                const contentDom = dom.children[1];
                invariant(
                    isHTMLElement(contentDom),
                    'Expected contentDom to be an HTMLElement',
                );
                if (currentOpen) {
                    dom.setAttribute('open', '');
                    contentDom.hidden = false;
                } else {
                    dom.removeAttribute('open');
                    setDomHiddenUntilFound(contentDom);
                }
            } else {
                dom.open = this.__open;
            }
        }

        return false;
    }

    static importDOM(): DOMConversionMap<HTMLDetailsElement> | null {
        return {
            details: (domNode: HTMLDetailsElement) => {
                return {
                    conversion: $convertDetailsElement,
                    priority: 1,
                };
            },
        };
    }

    static importJSON(
        serializedNode: SerializedCollapsibleContainerNode,
    ): CollapsibleContainerNode {
        const node = $createCollapsibleContainerNode(serializedNode.open, serializedNode.blockId);
        return node;
    }

    exportDOM(): DOMExportOutput {
        const element = document.createElement('details');
        element.classList.add('Collapsible__container');
        element.setAttribute('open', this.__open.toString());
        return { element };
    }

    exportJSON(): SerializedCollapsibleContainerNode {
        return {
            ...super.exportJSON(),
            open: this.__open,
            blockId: this.__blockId,
            type: 'collapsible-container',
            version: 1,
        };
    }

    setOpen(open: boolean): void {
        const writable = this.getWritable();
        writable.__open = open;
    }

    getOpen(): boolean {
        return this.getLatest().__open;
    }

    toggleOpen(): void {
        this.setOpen(!this.getOpen());
    }

    getBlockId(): string {
        return this.getLatest().__blockId;
    }
}

export function $createCollapsibleContainerNode(
    isOpen: boolean,
    blockId?: string
): CollapsibleContainerNode {
    return new CollapsibleContainerNode(isOpen, blockId);
}

export function $isCollapsibleContainerNode(
    node: LexicalNode | null | undefined,
): node is CollapsibleContainerNode {
    return node instanceof CollapsibleContainerNode;
}

export function $convertDetailsElement(
    domNode: HTMLDetailsElement,
): DOMConversionOutput | null {
    const isOpen = domNode.open !== undefined ? domNode.open : true;
    const node = $createCollapsibleContainerNode(isOpen, uuidv4());
    return {
        node,
    };
}