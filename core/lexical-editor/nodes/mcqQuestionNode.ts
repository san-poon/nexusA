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
    Spread,
} from 'lexical';
import { v4 as uuidv4 } from 'uuid';

export type SerializedMCQQuestionNode = Spread<
    {
        blockId: string;
    },
    SerializedElementNode
>;

export class MCQQuestionNode extends ElementNode {
    __blockId: string;

    constructor(blockId?: string, key?: NodeKey) {
        super(key);
        this.__blockId = blockId || uuidv4();
    }

    static getType(): string {
        return 'mcq-question';
    }

    static clone(node: MCQQuestionNode): MCQQuestionNode {
        return new MCQQuestionNode(node.__blockId, node.__key);
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
        const node = $createMCQQuestionNode(serializedNode.blockId);
        return node;
    }

    // without this, using delete key will delete the question node and the whole MCQContainerNode will act crazy 
    // and it will not allow to add anything after MCQContainerNode.
    isShadowRoot(): boolean {
        return true;
    }

    exportJSON(): SerializedMCQQuestionNode {
        return {
            ...super.exportJSON(),
            blockId: this.__blockId,
            type: 'mcq-question',
            version: 1,
        };
    }
}

export function $createMCQQuestionNode(blockId?: string): MCQQuestionNode {
    return new MCQQuestionNode(blockId);
}

export function $isMCQQuestionNode(
    node: LexicalNode | null | undefined,
): node is MCQQuestionNode {
    return node instanceof MCQQuestionNode;
}