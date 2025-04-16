import {
    ParagraphNode,
    SerializedParagraphNode,
    Spread,
    NodeKey,
    SerializedElementNode,
    SerializedLexicalNode,
    ElementNode,
    DecoratorNode,
    LexicalNode,
    EditorConfig,
} from 'lexical';
import { v4 as uuidv4 } from 'uuid';
import * as React from 'react';

// Import nodes from their respective packages
import { HeadingNode, QuoteNode, SerializedHeadingNode, SerializedQuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode, SerializedListNode, SerializedListItemNode } from '@lexical/list';
import { CodeNode, SerializedCodeNode } from '@lexical/code';
import { HorizontalRuleNode, SerializedHorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode';
import { TableNode, SerializedTableNode } from '@lexical/table';

// --- Base Tracked Node Logic (Generic) ---

// Define a common Serialized type structure for tracked nodes
export type SerializedTrackedNode = Spread<
    { blockId: string },
    SerializedLexicalNode // Use a generic base type
>;

// Helper function to add blockId to exportJSON
function exportTrackedJSON<T extends SerializedLexicalNode>(
    node: ElementNode | DecoratorNode<unknown>, // Adjust base type as needed
    baseExport: T
): Spread<{ blockId: string }, T> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const trackedNode = node as any; // Use any type assertion cautiously
    return {
        ...baseExport,
        blockId: trackedNode.__blockId,
        // Ensure type and version are correctly handled by baseExport
    };
}

// --- Tracked Paragraph Node ---

export type SerializedTrackedParagraphNode = Spread<
    { blockId: string },
    SerializedParagraphNode
>;

export class TrackedParagraphNode extends ParagraphNode {
    __blockId: string;

    constructor(blockId?: string, key?: NodeKey) {
        super(key);
        this.__blockId = blockId || uuidv4();
    }

    static getType(): string {
        return 'tracked-paragraph';
    }

    static clone(node: TrackedParagraphNode): TrackedParagraphNode {
        return new TrackedParagraphNode(node.__blockId, node.__key);
    }

    exportJSON(): SerializedTrackedParagraphNode {
        const baseExport = super.exportJSON();
        return exportTrackedJSON(this, {
            ...baseExport,
            type: 'tracked-paragraph', // Ensure correct type export
        });
    }

    static importJSON(serializedNode: SerializedTrackedParagraphNode): TrackedParagraphNode {
        // Create node with blockId. Base properties (format, indent, children) are handled by Lexical internals during parsing/replacement.
        const node = new TrackedParagraphNode(serializedNode.blockId);
        return node;
    }
}

export function $createTrackedParagraphNode(blockId?: string): TrackedParagraphNode {
    return new TrackedParagraphNode(blockId);
}

export function $isTrackedParagraphNode(node: LexicalNode | null | undefined): node is TrackedParagraphNode {
    return node instanceof TrackedParagraphNode;
}


// --- Tracked Heading Node ---

export type SerializedTrackedHeadingNode = Spread<
    { blockId: string; tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' },
    SerializedHeadingNode
>;

export class TrackedHeadingNode extends HeadingNode {
    __blockId: string;

    constructor(tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', blockId?: string, key?: NodeKey) {
        super(tag, key);
        this.__blockId = blockId || uuidv4();
    }

    static getType(): string {
        return 'tracked-heading';
    }

    static clone(node: TrackedHeadingNode): TrackedHeadingNode {
        return new TrackedHeadingNode(node.__tag, node.__blockId, node.__key);
    }

    exportJSON(): SerializedTrackedHeadingNode {
        const baseExport = super.exportJSON();
        return exportTrackedJSON(this, {
            ...baseExport,
            tag: this.__tag,
            type: 'tracked-heading',
        });
    }

    static importJSON(serializedNode: SerializedTrackedHeadingNode): TrackedHeadingNode {
        // Create node with blockId and tag. Base properties handled by internals.
        const node = new TrackedHeadingNode(serializedNode.tag, serializedNode.blockId);
        return node;
    }
}

export function $createTrackedHeadingNode(tag: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6', blockId?: string): TrackedHeadingNode {
    return new TrackedHeadingNode(tag, blockId);
}

export function $isTrackedHeadingNode(node: LexicalNode | null | undefined): node is TrackedHeadingNode {
    return node instanceof TrackedHeadingNode;
}

// --- Tracked Quote Node ---

export type SerializedTrackedQuoteNode = Spread<
    { blockId: string },
    SerializedQuoteNode
>;

export class TrackedQuoteNode extends QuoteNode {
    __blockId: string;

    constructor(blockId?: string, key?: NodeKey) {
        super(key);
        this.__blockId = blockId || uuidv4();
    }

    static getType(): string {
        return 'tracked-quote';
    }

    static clone(node: TrackedQuoteNode): TrackedQuoteNode {
        return new TrackedQuoteNode(node.__blockId, node.__key);
    }

    exportJSON(): SerializedTrackedQuoteNode {
        const baseExport = super.exportJSON();
        return exportTrackedJSON(this, {
            ...baseExport,
            type: 'tracked-quote',
        });
    }

    static importJSON(serializedNode: SerializedTrackedQuoteNode): TrackedQuoteNode {
        // Create node with blockId. Base properties handled by internals.
        const node = new TrackedQuoteNode(serializedNode.blockId);
        return node;
    }
}

export function $createTrackedQuoteNode(blockId?: string): TrackedQuoteNode {
    return new TrackedQuoteNode(blockId);
}

export function $isTrackedQuoteNode(node: LexicalNode | null | undefined): node is TrackedQuoteNode {
    return node instanceof TrackedQuoteNode;
}


// --- Tracked List Node ---

export type SerializedTrackedListNode = Spread<
    { blockId: string; listType: 'number' | 'bullet' | 'check'; tag: 'ul' | 'ol'; start: number; },
    SerializedListNode
>;

export class TrackedListNode extends ListNode {
    __blockId: string;

    constructor(listType: 'number' | 'bullet' | 'check', start: number, blockId?: string, key?: NodeKey) {
        super(listType, start, key);
        this.__blockId = blockId || uuidv4();
    }

    static getType(): string {
        return 'tracked-list';
    }

    static clone(node: TrackedListNode): TrackedListNode {
        return new TrackedListNode(node.__listType, node.__start, node.__blockId, node.__key);
    }

    exportJSON(): SerializedTrackedListNode {
        const baseExport = super.exportJSON();
        return exportTrackedJSON(this, {
            ...baseExport,
            listType: this.__listType,
            start: this.__start,
            tag: this.__tag,
            type: 'tracked-list',
        });
    }

    static importJSON(serializedNode: SerializedTrackedListNode): TrackedListNode {
        // Create node with blockId, listType, start. Base properties handled by internals.
        const node = new TrackedListNode(serializedNode.listType, serializedNode.start, serializedNode.blockId);
        return node;
    }
}

export function $createTrackedListNode(listType: 'number' | 'bullet' | 'check', start: number, blockId?: string): TrackedListNode {
    return new TrackedListNode(listType, start, blockId);
}

export function $isTrackedListNode(node: LexicalNode | null | undefined): node is TrackedListNode {
    return node instanceof TrackedListNode;
}

// --- Tracked List Item Node ---

export type SerializedTrackedListItemNode = Spread<
    { blockId: string; value: number; checked: boolean | undefined; },
    SerializedListItemNode
>;

export class TrackedListItemNode extends ListItemNode {
    __blockId: string;

    constructor(value?: number, checked?: boolean, blockId?: string, key?: NodeKey) {
        super(value, checked, key);
        this.__blockId = blockId || uuidv4();
    }

    static getType(): string {
        return 'tracked-listitem';
    }

    static clone(node: TrackedListItemNode): TrackedListItemNode {
        return new TrackedListItemNode(node.__value, node.__checked, node.__blockId, node.__key);
    }

    exportJSON(): SerializedTrackedListItemNode {
        const baseExport = super.exportJSON();
        return exportTrackedJSON(this, {
            ...baseExport,
            checked: this.__checked,
            value: this.__value,
            type: 'tracked-listitem',
        });
    }

    static importJSON(serializedNode: SerializedTrackedListItemNode): TrackedListItemNode {
        // Create node with blockId, value, checked. Base properties handled by internals.
        const node = new TrackedListItemNode(serializedNode.value, serializedNode.checked, serializedNode.blockId);
        return node;
    }
}

export function $createTrackedListItemNode(value?: number, checked?: boolean, blockId?: string): TrackedListItemNode {
    return new TrackedListItemNode(value, checked, blockId);
}

export function $isTrackedListItemNode(node: LexicalNode | null | undefined): node is TrackedListItemNode {
    return node instanceof TrackedListItemNode;
}


// --- Tracked Code Node ---

export type SerializedTrackedCodeNode = Spread<
    { blockId: string },
    SerializedCodeNode
>;

export class TrackedCodeNode extends CodeNode {
    __blockId: string;

    constructor(blockId?: string, key?: NodeKey) {
        super(key);
        this.__blockId = blockId || uuidv4();
    }

    static getType(): string {
        return 'tracked-code';
    }

    static clone(node: TrackedCodeNode): TrackedCodeNode {
        return new TrackedCodeNode(node.__blockId, node.__key);
    }

    exportJSON(): SerializedTrackedCodeNode {
        const baseExport = super.exportJSON();
        return exportTrackedJSON(this, {
            ...baseExport,
            type: 'tracked-code',
        });
    }

    static importJSON(serializedNode: SerializedTrackedCodeNode): TrackedCodeNode {
        // Create node with blockId. Base properties (language, format etc) handled by internals.
        const node = new TrackedCodeNode(serializedNode.blockId);
        // We might still need to set language explicitly if the base importJSON doesn't handle it properly from Spread
        if ('language' in serializedNode && typeof (serializedNode as any).language === 'string') {
            node.setLanguage((serializedNode as any).language);
        }
        return node;
    }
}

export function $createTrackedCodeNode(blockId?: string): TrackedCodeNode {
    return new TrackedCodeNode(blockId);
}

export function $isTrackedCodeNode(node: LexicalNode | null | undefined): node is TrackedCodeNode {
    return node instanceof TrackedCodeNode;
}


// --- Tracked Horizontal Rule Node ---
// HorizontalRuleNode is a DecoratorNode, not ElementNode

export type SerializedTrackedHorizontalRuleNode = Spread<
    { blockId: string },
    SerializedHorizontalRuleNode
>;

export class TrackedHorizontalRuleNode extends HorizontalRuleNode {
    __blockId: string;

    constructor(blockId?: string, key?: NodeKey) {
        super(key);
        this.__blockId = blockId || uuidv4();
    }

    static getType(): string {
        return 'tracked-horizontalrule';
    }

    static clone(node: TrackedHorizontalRuleNode): TrackedHorizontalRuleNode {
        return new TrackedHorizontalRuleNode(node.__blockId, node.__key);
    }

    exportJSON(): SerializedTrackedHorizontalRuleNode {
        const baseExport = super.exportJSON();
        return exportTrackedJSON(this, {
            ...baseExport,
            type: 'tracked-horizontalrule',
        });
    }

    static importJSON(serializedNode: SerializedTrackedHorizontalRuleNode): TrackedHorizontalRuleNode {
        // Create node with blockId. Base properties handled by internals.
        return new TrackedHorizontalRuleNode(serializedNode.blockId);
    }

    getTextContent(): string {
        // Horizontal rule has no text content
        return '\n';
    }

    decorate(): React.JSX.Element {
        // You might want to render the rule differently or add blockId visually
        // Assuming super.decorate() returns a valid JSX.Element
        const element = super.decorate();
        if (element === null) {
            // This case should ideally not happen based on the linter error
            // If it can, we need a fallback or throw an error.
            // For now, let's assume super.decorate() is non-null.
            // Consider adding fallback rendering if needed.
            throw new Error("Base HorizontalRuleNode decorate returned null, which was unexpected.");
        }
        // Optionally add blockId prop or data attribute to the returned element
        // Example (if element is a React component accepting props):
        // return React.cloneElement(element, { 'data-block-id': this.__blockId });
        // Example (if element is a basic HTML tag): Requires modifying what super.decorate() returns or wrapping it.
        return element;
    }
}


export function $createTrackedHorizontalRuleNode(blockId?: string): TrackedHorizontalRuleNode {
    return new TrackedHorizontalRuleNode(blockId);
}

export function $isTrackedHorizontalRuleNode(node: LexicalNode | null | undefined): node is TrackedHorizontalRuleNode {
    return node instanceof TrackedHorizontalRuleNode;
}


// --- Tracked Table Node ---

export type SerializedTrackedTableNode = Spread<
    { blockId: string },
    SerializedTableNode
>;

export class TrackedTableNode extends TableNode {
    __blockId: string;

    constructor(blockId?: string, key?: NodeKey) {
        super(key); // Assuming TableNode constructor only needs key
        this.__blockId = blockId || uuidv4();
    }

    static getType(): string {
        return 'tracked-table';
    }

    static clone(node: TrackedTableNode): TrackedTableNode {
        return new TrackedTableNode(node.__blockId, node.__key);
    }

    exportJSON(): SerializedTrackedTableNode {
        const baseExport = super.exportJSON();
        return exportTrackedJSON(this, {
            ...baseExport,
            type: 'tracked-table',
        });
    }

    static importJSON(serializedNode: SerializedTrackedTableNode): TrackedTableNode {
        // Create node with blockId. Base properties and grid structure handled by internals.
        const node = new TrackedTableNode(serializedNode.blockId);
        return node;
    }
}

// Factory function adjusted for simplified constructor
export function $createTrackedTableNode(blockId?: string): TrackedTableNode {
    // Need to ensure the TableNode has a valid initial structure (e.g., 1x1 grid?)
    // This might require calling methods after creation or adjusting the constructor assumption
    // For now, just creating the node shell.
    // TODO: Verify TableNode initialization requirements.
    return new TrackedTableNode(blockId);
}

export function $isTrackedTableNode(node: LexicalNode | null | undefined): node is TrackedTableNode {
    return node instanceof TrackedTableNode;
} 