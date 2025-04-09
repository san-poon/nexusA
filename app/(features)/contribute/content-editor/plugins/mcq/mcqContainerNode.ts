import {
    EditorConfig,
    ElementNode,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
} from 'lexical';

export type SerializedMCQContainerNode = SerializedElementNode;

export class MCQContainerNode extends ElementNode {
    constructor(key?: NodeKey) {
        super(key);
    }

    static getType(): string {
        return 'mcq-container';
    }

    static clone(node: MCQContainerNode): MCQContainerNode {
        return new MCQContainerNode(node.__key);
    }

    createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
        const dom = document.createElement('div');
        dom.classList.add('mcq-container');

        // Create icon container
        const iconContainer = document.createElement('div');
        iconContainer.classList.add('mcq-icon-container');

        // Insert Quiz Icon
        iconContainer.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 -960 960 960" class="mcq-icon">
                <path stroke-linecap="round" stroke-linejoin="round" stroke="currentColor" fill="currentColor" d="M560-360q17 0 29.5-12.5T602-402q0-17-12.5-29.5T560-444q-17 0-29.5 12.5T518-402q0 17 12.5 29.5T560-360Zm-30-128h60q0-29 6-42.5t28-35.5q30-30 40-48.5t10-43.5q0-45-31.5-73.5T560-760q-41 0-71.5 23T446-676l54 22q9-25 24.5-37.5T560-704q24 0 39 13.5t15 36.5q0 14-8 26.5T578-596q-33 29-40.5 45.5T530-488ZM320-240q-33 0-56.5-23.5T240-320v-480q0-33 23.5-56.5T320-880h480q33 0 56.5 23.5T880-800v480q0 33-23.5 56.5T800-240H320Zm0-80h480v-480H320v480ZM160-80q-33 0-56.5-23.5T80-160v-560h80v560h560v80H160Zm160-720v480-480Z" />
            </svg>
        `;

        // Add icon container to the main container
        dom.appendChild(iconContainer);

        return dom;
    }

    updateDOM(): boolean {
        return false;
    }

    exportJSON(): SerializedMCQContainerNode {
        return {
            ...super.exportJSON(),
            type: 'mcq-container',
            version: 1,
        };
    }

    static importJSON(serializedNode: SerializedMCQContainerNode): MCQContainerNode {
        return $createMCQContainerNode();
    }
}

export function $createMCQContainerNode(): MCQContainerNode {
    return new MCQContainerNode();
}

export function $isMCQContainerNode(
    node: LexicalNode | null | undefined,
): node is MCQContainerNode {
    return node instanceof MCQContainerNode;
}