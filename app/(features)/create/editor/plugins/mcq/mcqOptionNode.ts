import {
    EditorConfig,
    ElementNode,
    LexicalEditor,
    LexicalNode,
    NodeKey,
    SerializedElementNode,
    Spread
} from "lexical";

export type SerializedMCQOptionNode = Spread<
    {
        checked: boolean;
    },
    SerializedElementNode
>;

export class MCQOptionNode extends ElementNode {
    __isChecked: boolean;

    constructor(isChecked: boolean = false, key?: NodeKey) {
        super(key);
        this.__isChecked = isChecked;
    }

    static getType(): string {
        return 'mcq-option';
    }

    static clone(node: MCQOptionNode): MCQOptionNode {
        return new MCQOptionNode(node.__isChecked, node.__key);
    }

    createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
        // Create main container for the entire option
        const containerDOM = document.createElement('div');
        containerDOM.classList.add('mcq-option');

        const inputDOM = document.createElement('input');
        inputDOM.type = 'checkbox';
        inputDOM.classList.add('mcq-option-checkbox')
        inputDOM.checked = this.__isChecked;

        // Add event handlers for checkbox clicks
        inputDOM.addEventListener('change', (event) => {
            editor.update(() => {
                const target = event.target as HTMLInputElement;
                this.setChecked(target.checked);
            });
        });

        // Assemble the components
        containerDOM.appendChild(inputDOM);

        return containerDOM;
    }

    updateDOM(prevNode: MCQOptionNode, dom: HTMLElement): boolean {
        if (prevNode.__isChecked !== this.__isChecked) {
            const checkbox = dom.querySelector('input[type="checkbox"]') as HTMLInputElement;
            if (checkbox) {
                checkbox.checked = this.__isChecked;
                return true;
            }
        }
        return false;
    }

    exportJSON(): SerializedMCQOptionNode {
        return {
            ...super.exportJSON(),
            checked: this.__isChecked,
            type: 'mcq-option',
            version: 1
        };
    }

    // Here I understood that without this, using delete key 
    // will delete the option node though there are only two options.
    isShadowRoot(): boolean {
        return true;
    }

    static importJSON(serializedNode: SerializedMCQOptionNode): MCQOptionNode {
        return $createMCQOptionNode(serializedNode.checked);
    }

    setChecked(checked: boolean): void {
        const writable = this.getWritable();
        writable.__isChecked = checked;
    }

    getChecked(): boolean {
        return this.__isChecked;
    }
}

export function $createMCQOptionNode(isChecked: boolean = false): MCQOptionNode {
    return new MCQOptionNode(isChecked);
}

export function $isMCQOptionNode(node: LexicalNode | null | undefined): node is MCQOptionNode {
    return node instanceof MCQOptionNode;
}