import {
    $createParagraphNode,
    $createTextNode,
    DOMConversionMap,
    DOMConversionOutput,
    DOMExportOutput,
    EditorConfig,
    ElementNode,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    SerializedLexicalNode,
} from 'lexical';

import { $createMCQOptionNode, $isMCQOptionNode, MCQOptionNode } from './mcqOptionNode';

export type SerializedMCQOptionsContainerNode = SerializedElementNode;

export class MCQOptionsContainerNode extends ElementNode {
    constructor(key?: NodeKey) {
        super(key);
    }
    static getType(): string {
        return 'mcq-options-container';
    }

    static clone(node: MCQOptionsContainerNode): MCQOptionsContainerNode {
        return new MCQOptionsContainerNode(node.__key);
    }

    createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
        const dom = document.createElement('div');
        dom.classList.add('mcq-options-container');

        // Add a container for the "Add option" button
        const addOptionButtonContainer = document.createElement('div');
        addOptionButtonContainer.classList.add('mcq-add-option-button-container');
        addOptionButtonContainer.style.display = this.canAddOption() ? 'flex' : 'none';

        // Create the "+" button
        const addOptionButton = document.createElement('button');
        addOptionButton.classList.add('mcq-add-option-button');
        addOptionButton.innerHTML = '+';
        addOptionButton.title = 'add option (ctrl + enter)';

        // Add event listener for "+" button to add new option
        addOptionButton.addEventListener('click', () => {
            editor.update(() => {
                if (this.canAddOption()) {
                    const newOption = this.addOption();
                    newOption.selectEnd();
                }
            });
        });

        addOptionButtonContainer.appendChild(addOptionButton);
        dom.appendChild(addOptionButtonContainer);

        return dom;
    }

    updateDOM(): boolean {
        // Return true to recreate the DOM using createDOM()
        // This makes possible for the "+"" button to be visible/invisible based on canAddOption()
        return true;
    }

    exportJSON(): SerializedMCQOptionsContainerNode {
        return {
            ...super.exportJSON(),
            type: 'mcq-options-container',
            version: 1,
        };
    }

    static importJSON(serializedNode: SerializedMCQOptionsContainerNode): MCQOptionsContainerNode {
        return $createMCQOptionsContainerNode();

    }

    // Helper methods for managing options
    addOption(): MCQOptionNode {
        const newOption = $createMCQOptionNode();
        this.append(newOption.append($createParagraphNode()));
        return newOption;
    }

    removeOption(optionNode: LexicalNode): boolean {
        if ($isMCQOptionNode(optionNode) && this.isParentOf(optionNode)) {
            optionNode.remove();
            return true;
        }
        return false
    }

    getOptions(): MCQOptionNode[] {
        return this.getChildren().filter($isMCQOptionNode);
    }

    // Ensure we maintain 2-4 options
    canAddOption(): boolean {
        return this.getOptions().length < 4;
    }

    canRemoveOption(): boolean {
        return this.getOptions().length > 2;
    }

    // initialize with default options
    static createWithOptions(numOptions: number = 2): MCQOptionsContainerNode {
        const container = $createMCQOptionsContainerNode();
        const optionsToCreate = Math.max(2, Math.min(4, numOptions));

        for (let i = 0; i < optionsToCreate; i++) {
            container.append($createMCQOptionNode());
        }
        return container;
    }

    append(...nodes: LexicalNode[]): this {
        const validNodes = nodes.filter($isMCQOptionNode);
        return super.append(...validNodes);
    }
}

export function $createMCQOptionsContainerNode(): MCQOptionsContainerNode {
    return new MCQOptionsContainerNode();
}

export function $isMCQOptionsContainerNode(
    node: LexicalNode | null | undefined,
): node is MCQOptionsContainerNode {
    return node instanceof MCQOptionsContainerNode;
}