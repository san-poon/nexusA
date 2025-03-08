import {
    $createParagraphNode,
    $isElementNode,
    DOMConversionMap,
    DOMConversionOutput,
    EditorConfig,
    ElementNode,
    LexicalEditor,
    LexicalNode,
    RangeSelection,
    SerializedElementNode,
} from 'lexical';
import { IS_CHROME } from '../../shared/environment';
import invariant from '../../shared/invariant';

import { $isCollapsibleContainerNode } from './CollapsibleContainerNode';
import { $isCollapsibleContentNode } from './CollapsibleContentNode';

type SerializedCollapsibleTitleNode = SerializedElementNode;

// Helper function to convert HTML summary elements to CollapsibleTitleNodes
// Used during copy-paste or HTML conversion operations
export function $convertSummaryElement(
    domNode: HTMLElement,
): DOMConversionOutput | null {
    const node = $createCollapsibleTitleNode();
    return {
        node,
    };
}

export class CollapsibleTitleNode extends ElementNode {
    // Unique identifier for this node type in the Lexical ecosystem
    static getType(): string {
        return 'collapsible-title';
    }

    // Required for copy-paste operations - creates a new instance with the same key
    static clone(node: CollapsibleTitleNode): CollapsibleTitleNode {
        return new CollapsibleTitleNode(node.__key);
    }

    // Creates the actual DOM element that represents this node in the editor
    createDOM(config: EditorConfig, editor: LexicalEditor): HTMLElement {
        const dom = document.createElement('summary');
        dom.classList.add('Collapsible__title');
        // Chrome-specific click handler for toggling the collapsible section
        if (IS_CHROME) {
            dom.addEventListener('click', () => {
                editor.update(() => {
                    const collapsibleContainer = this.getLatest().getParentOrThrow();
                    invariant(
                        $isCollapsibleContainerNode(collapsibleContainer),
                        'Expected parent node to be a CollapsibleContainerNode',
                    );
                    collapsibleContainer.toggleOpen();
                });
            });
        }
        return dom;
    }

    updateDOM(prevNode: CollapsibleTitleNode, dom: HTMLElement): boolean {
        // Returning false tells Lexical that this node does not need its
        // DOM element replacing with a new copy from createDOM.
        return false;
    }

    // Defines how HTML should be converted to this node type
    // Used during paste operations or HTML import
    static importDOM(): DOMConversionMap | null {
        return {
            summary: (domNode: HTMLElement) => ({
                conversion: $convertSummaryElement,
                priority: 1,
            }),
        };
    }

    static importJSON(
        serializedNode: SerializedCollapsibleTitleNode,
    ): CollapsibleTitleNode {
        return $createCollapsibleTitleNode();
    }

    exportJSON(): SerializedCollapsibleTitleNode {
        return {
            ...super.exportJSON(),
            type: 'collapsible-title',
            version: 1,
        };
    }

    // Handles backspace at the start of the title
    // Moves the title node before its parent container
    collapseAtStart(_selection: RangeSelection): boolean {
        this.getParentOrThrow().insertBefore(this);
        return true;
    }

    // Cleanup transformation - removes empty title nodes
    static transform(): (node: LexicalNode) => void {
        return (node: LexicalNode) => {
            invariant(
                $isCollapsibleTitleNode(node),
                'node is not a CollapsibleTitleNode',
            );
            if (node.isEmpty()) {
                node.remove();
            }
        };
    }

    // Handles Enter key press in the title
    // Creates a new paragraph either inside the content area (if open)
    // or after the collapsible container (if closed)
    insertNewAfter(_: RangeSelection, restoreSelection = true): ElementNode {
        const containerNode = this.getParentOrThrow();

        if (!$isCollapsibleContainerNode(containerNode)) {
            throw new Error(
                'CollapsibleTitleNode expects to be child of CollapsibleContainerNode',
            );
        }

        if (containerNode.getOpen()) {
            // If collapsible is open, create paragraph in content area
            const contentNode = this.getNextSibling();
            if (!$isCollapsibleContentNode(contentNode)) {
                throw new Error(
                    'CollapsibleTitleNode expects to have CollapsibleContentNode sibling',
                );
            }

            const firstChild = contentNode.getFirstChild();
            if ($isElementNode(firstChild)) {
                return firstChild;
            } else {
                const paragraph = $createParagraphNode();
                contentNode.append(paragraph);
                return paragraph;
            }
        } else {
            // If collapsible is closed, create paragraph after the container
            const paragraph = $createParagraphNode();
            containerNode.insertAfter(paragraph, restoreSelection);
            return paragraph;
        }
    }
}

// Helper function to create new CollapsibleTitleNode instances
export function $createCollapsibleTitleNode(): CollapsibleTitleNode {
    return new CollapsibleTitleNode();
}

// Type guard to check if a node is a CollapsibleTitleNode
export function $isCollapsibleTitleNode(
    node: LexicalNode | null | undefined,
): node is CollapsibleTitleNode {
    return node instanceof CollapsibleTitleNode;
}