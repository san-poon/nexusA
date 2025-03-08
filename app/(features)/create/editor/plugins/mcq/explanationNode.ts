import {
    ElementNode,
    LexicalNode,
    NodeKey,
    SerializedElementNode
} from "lexical";

export type SerializedExplanationNode = SerializedElementNode;

export class ExplanationNode extends ElementNode {
    static getType(): string {
        return "explanation";
    }


    constructor(key?: NodeKey) {
        super(key);
    }

    static clone(node: ExplanationNode): ExplanationNode {
        return new ExplanationNode(node.__key);
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
            type: "explanation",
            version: 1,
        };
    }

    static importJSON(): ExplanationNode {
        return $createExplanationNode();
    }

    isShadowRoot(): boolean {
        return true;
    }
}

export function $createExplanationNode(): ExplanationNode {
    return new ExplanationNode();
}

export function $isExplanationNode(
    node: LexicalNode | null | undefined
): node is ExplanationNode {
    return node instanceof ExplanationNode;
}
