import './Collapsible.css';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
    $findMatchingParent,
    $insertNodeToNearestRoot,
    mergeRegister,
} from '@lexical/utils';
import {
    $createParagraphNode,
    $getNodeByKey,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    createCommand,
    DELETE_CHARACTER_COMMAND,
    ElementNode,
    INSERT_PARAGRAPH_COMMAND,
    KEY_ARROW_DOWN_COMMAND,
    KEY_ARROW_LEFT_COMMAND,
    KEY_ARROW_RIGHT_COMMAND,
    KEY_ARROW_UP_COMMAND,
    LexicalNode,
    NodeKey,
} from 'lexical';
import { useEffect } from 'react';

import {
    $createCollapsibleContainerNode,
    $isCollapsibleContainerNode,
    CollapsibleContainerNode,
} from '@/core/lexical-editor/nodes/CollapsibleContainerNode';
import {
    $createCollapsibleContentNode,
    $isCollapsibleContentNode,
    CollapsibleContentNode,
} from '@/core/lexical-editor/nodes/CollapsibleContentNode';
import {
    $createCollapsibleTitleNode,
    $isCollapsibleTitleNode,
    CollapsibleTitleNode,
} from '@/core/lexical-editor/nodes/CollapsibleTitleNode';

export const INSERT_COLLAPSIBLE_COMMAND = createCommand<void>();
export const TOGGLE_COLLAPSIBLE_COMMAND = createCommand<NodeKey>();

export default function CollapsiblePlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {

        // Verifies required nodes are registered
        if (
            !editor.hasNodes([
                CollapsibleContainerNode,
                CollapsibleTitleNode,
                CollapsibleContentNode,
            ])
        ) {
            throw new Error(
                'CollapsiblePlugin: CollapsibleContainerNode, CollapsibleTitleNode, or CollapsibleContentNode not registered on editor',
            );
        }

        // Handles up/left arrow key navigation
        const $onEscapeUp = () => {
            const selection = $getSelection();
            if (
                $isRangeSelection(selection) &&
                selection.isCollapsed() &&
                selection.anchor.offset === 0
            ) {
                const container = $findMatchingParent(
                    selection.anchor.getNode(),
                    $isCollapsibleContainerNode,
                );

                // Adds paragraph before collapsible if it's the first node in the editor
                if ($isCollapsibleContainerNode(container)) {
                    const parent = container.getParent<ElementNode>();
                    if (
                        parent !== null &&
                        parent.getFirstChild<LexicalNode>() === container &&
                        selection.anchor.key ===
                        container.getFirstDescendant<LexicalNode>()?.getKey()
                    ) {
                        container.insertBefore($createParagraphNode());
                    }
                }
            }

            return false;
        };

        // Handles down/right arrow navigation
        const $onEscapeDown = () => {
            const selection = $getSelection();
            if ($isRangeSelection(selection) && selection.isCollapsed()) {
                const container = $findMatchingParent(
                    selection.anchor.getNode(),
                    $isCollapsibleContainerNode,
                );

                // Adds paragraph after this collapsible if its the last node in the editor
                if ($isCollapsibleContainerNode(container)) {
                    const parent = container.getParent<ElementNode>();
                    if (
                        parent !== null &&
                        parent.getLastChild<LexicalNode>() === container
                    ) {
                        const titleParagraph = container.getFirstDescendant<LexicalNode>();
                        const contentParagraph = container.getLastDescendant<LexicalNode>();

                        if (
                            (contentParagraph !== null &&
                                selection.anchor.key === contentParagraph.getKey() &&
                                selection.anchor.offset ===
                                contentParagraph.getTextContentSize()) ||
                            (titleParagraph !== null &&
                                selection.anchor.key === titleParagraph.getKey() &&
                                selection.anchor.offset === titleParagraph.getTextContentSize())
                        ) {
                            container.insertAfter($createParagraphNode());
                        }
                    }
                }
            }

            return false;
        };

        return mergeRegister(
            //  If a CollapsibleContentNode somehow ends up outside a CollapsibleContainerNode, 
            // this transform unwraps it, preserving its children 
            // but removing the invalid container structure.
            editor.registerNodeTransform(CollapsibleContentNode, (node) => {
                const parent = node.getParent<ElementNode>();
                if (!$isCollapsibleContainerNode(parent)) {
                    const children = node.getChildren<LexicalNode>();
                    for (const child of children) {
                        node.insertBefore(child);
                    }
                    node.remove();
                }
            }),

            // If a CollapsibleTitleNode ends up outside a CollapsibleContainerNode, 
            // this transform converts it back to a regular paragraph, 
            // preserving its children.
            editor.registerNodeTransform(CollapsibleTitleNode, (node) => {
                const parent = node.getParent<ElementNode>();
                if (!$isCollapsibleContainerNode(parent)) {
                    node.replace(
                        $createParagraphNode().append(...node.getChildren<LexicalNode>()),
                    );
                    return;
                }
            }),

            // This transformation ensures that a CollapsibleContainerNode always contains exactly one CollapsibleTitleNode and one CollapsibleContentNode.
            // If the container doesn't meet this structure, it unwraps the nodes and removes the invalid container.
            editor.registerNodeTransform(CollapsibleContainerNode, (node) => {
                const children = node.getChildren<LexicalNode>();
                if (
                    children.length !== 2 ||
                    !$isCollapsibleTitleNode(children[0]) ||
                    !$isCollapsibleContentNode(children[1])
                ) {
                    for (const child of children) {
                        node.insertBefore(child);
                    }
                    node.remove();
                }
            }),

            // This handles the case when container is collapsed and we delete its previous sibling
            // into it, it would cause collapsed content deleted (since it's display: none, and selection
            // swallows it when deletes single char). Instead we expand container, which is although
            // not perfect, but avoids bigger problem
            editor.registerCommand(
                DELETE_CHARACTER_COMMAND,
                () => {
                    const selection = $getSelection();
                    if (
                        !$isRangeSelection(selection) ||
                        !selection.isCollapsed() ||
                        selection.anchor.offset !== 0
                    ) {
                        return false;
                    }

                    const anchorNode = selection.anchor.getNode();
                    const topLevelElement = anchorNode.getTopLevelElement();
                    if (topLevelElement === null) {
                        return false;
                    }

                    const container = topLevelElement.getPreviousSibling<LexicalNode>();
                    if (!$isCollapsibleContainerNode(container) || container.getOpen()) {
                        return false;
                    }

                    container.setOpen(true);
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),

            // When collapsible is the last child pressing down/right arrow will insert paragraph
            // below it to allow adding more content. It's similar what $insertBlockNode
            // (mainly for decorators), except it'll always be possible to continue adding
            // new content even if trailing paragraph is accidentally deleted
            editor.registerCommand(
                KEY_ARROW_DOWN_COMMAND,
                $onEscapeDown,
                COMMAND_PRIORITY_LOW,
            ),

            editor.registerCommand(
                KEY_ARROW_RIGHT_COMMAND,
                $onEscapeDown,
                COMMAND_PRIORITY_LOW,
            ),

            // When collapsible is the first child pressing up/left arrow will insert paragraph
            // above it to allow adding more content. It's similar what $insertBlockNode
            // (mainly for decorators), except it'll always be possible to continue adding
            // new content even if leading paragraph is accidentally deleted
            editor.registerCommand(
                KEY_ARROW_UP_COMMAND,
                $onEscapeUp,
                COMMAND_PRIORITY_LOW,
            ),

            editor.registerCommand(
                KEY_ARROW_LEFT_COMMAND,
                $onEscapeUp,
                COMMAND_PRIORITY_LOW,
            ),

            // Enter goes from Title to Content rather than a new line inside Title
            editor.registerCommand(
                INSERT_PARAGRAPH_COMMAND,
                () => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const titleNode = $findMatchingParent(
                            selection.anchor.getNode(),
                            (node) => $isCollapsibleTitleNode(node),
                        );

                        if ($isCollapsibleTitleNode(titleNode)) {
                            const container = titleNode.getParent<ElementNode>();
                            if (container && $isCollapsibleContainerNode(container)) {
                                if (!container.getOpen()) {
                                    container.toggleOpen();
                                }
                                titleNode.getNextSibling()?.selectEnd();
                                return true;
                            }
                        }
                    }

                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                INSERT_COLLAPSIBLE_COMMAND,
                () => {
                    editor.update(() => {
                        const title = $createCollapsibleTitleNode();
                        const paragraph = $createParagraphNode();
                        $insertNodeToNearestRoot(
                            $createCollapsibleContainerNode(true).append(
                                title.append(paragraph),
                                $createCollapsibleContentNode().append($createParagraphNode()),
                            ),
                        );
                        paragraph.select();
                    });
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor]);

    return null;
}