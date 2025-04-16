import {
    ElementNode,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    Spread
} from "lexical";
import { v4 as uuidv4 } from 'uuid';

export type SerializedExplanationNode = Spread<
    {
        blockId: string;
    },
    SerializedElementNode
>;

export class ExplanationNode extends ElementNode {
    __blockId: string;

    static getType(): string {
        return "explanation";
    }

    constructor(blockId?: string, key?: NodeKey) {
        super(key);
        this.__blockId = blockId || uuidv4();
    }

    static clone(node: ExplanationNode): ExplanationNode {
        return new ExplanationNode(node.__blockId, node.__key);
    }

    createDOM(): HTMLElement {
        const dom = document.createElement("div");
        dom.classList.add("explanation-container");
        return dom;
    }

    updateDOM(): boolean {
        // Return false to indicate the DOM doesn't need to be recreated
        // when the node is updated
        return false;
    }

    exportJSON(): SerializedExplanationNode {
        return {
            ...super.exportJSON(),
            blockId: this.__blockId,
            type: "explanation",
            version: 1,
        };
    }

    static importJSON(serializedNode: SerializedExplanationNode): ExplanationNode {
        const node = $createExplanationNode(serializedNode.blockId);
        return node;
    }

    isShadowRoot(): boolean {
        return true;
    }

    getBlockId(): string {
        return this.getLatest().__blockId;
    }
}

export function $createExplanationNode(blockId?: string): ExplanationNode {
    return new ExplanationNode(blockId);
}

export function $isExplanationNode(
    node: LexicalNode | null | undefined
): node is ExplanationNode {
    return node instanceof ExplanationNode;
}
