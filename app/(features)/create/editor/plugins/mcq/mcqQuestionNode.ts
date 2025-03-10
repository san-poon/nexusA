import {
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    ElementNode,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
} from 'lexical';

type SerializedMCQQuestionNode = SerializedElementNode;

export class MCQQuestionNode extends ElementNode {
    constructor(key?: NodeKey) {
        super(key);
    }

    static getType(): string {
        return 'mcq-question';
    }

    static clone(node: MCQQuestionNode): MCQQuestionNode {
        return new MCQQuestionNode(node.__key);
    }

    createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
        const dom = document.createElement('div');
        dom.classList.add('mcq-question');

        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    static importJSON(
        serializedNode: SerializedMCQQuestionNode,
    ): MCQQuestionNode {
        return $createMCQQuestionNode();
    }

    // without this, using delete key will delete the question node and the whole MCQContainerNode will act crazy 
    // and it will not allow to add anything after MCQContainerNode.
    isShadowRoot(): boolean {
        return true;
    }

    exportJSON(): SerializedMCQQuestionNode {
        return {
            ...super.exportJSON(),
            type: 'mcq-question',
            version: 1,
        };
    }
}

export function $createMCQQuestionNode(): MCQQuestionNode {
    return new MCQQuestionNode();
}

export function $isMCQQuestionNode(
    node: LexicalNode | null | undefined,
): node is MCQQuestionNode {
    return node instanceof MCQQuestionNode;
}