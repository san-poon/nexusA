import './mcq.css';

import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, $insertNodeToNearestRoot, mergeRegister } from '@lexical/utils';
import {
    $createParagraphNode,
    $createTextNode,
    $getNodeByKey,
    $getSelection,
    $isRangeSelection,
    COMMAND_PRIORITY_LOW,
    createCommand,
    ElementNode,
    INSERT_PARAGRAPH_COMMAND,
    KEY_BACKSPACE_COMMAND,
    KEY_ENTER_COMMAND,
    LexicalCommand,
    LexicalNode,
    NodeKey,
} from 'lexical';
import { useEffect } from 'react';

import { $createMCQContainerNode, $isMCQContainerNode, MCQContainerNode } from './mcqContainerNode';
import { $createMCQQuestionNode, $isMCQQuestionNode, MCQQuestionNode } from './mcqQuestionNode';
import { $createMCQOptionsContainerNode, $isMCQOptionsContainerNode, MCQOptionsContainerNode } from './mcqOptionsContainerNode';
import { $createMCQOptionNode, $isMCQOptionNode } from './mcqOptionNode';
import { MCQOptionNode } from './mcqOptionNode';
import { $createExplanationNode, $isExplanationNode } from './explanationNode';

export const INSERT_MCQ_COMMAND: LexicalCommand<void> = createCommand();
export const ADD_MCQ_OPTION_COMMAND: LexicalCommand<void> = createCommand();
export const REMOVE_MCQ_OPTION_COMMAND: LexicalCommand<NodeKey> = createCommand();

export default function MCQPlugin(): null {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (
            !editor.hasNodes([
                MCQContainerNode,
                MCQQuestionNode,
                MCQOptionsContainerNode,
                MCQOptionNode,
            ])
        ) {
            throw new Error('MCQPlugin: MCQNodes not registered on editor.\nImport the necessary nodes in defaultEditorNode.ts');
        }

        // Helper function to handle navigation between MCQ section
        const navigateToNextSection = (node: LexicalNode): boolean => {
            const mcqContainer = $findMatchingParent(node, $isMCQContainerNode);
            if (!mcqContainer) return false;

            // Find the current node (question, options container, or explanation)
            const currentNode = $findMatchingParent(
                node,
                (n) => $isMCQQuestionNode(n) || $isMCQOptionsContainerNode(n) || $isExplanationNode(n)
            );

            if (!currentNode) return false;

            // if we are in question, we want to go to first option
            if ($isMCQQuestionNode(currentNode)) {
                const optionsContainer = currentNode.getNextSibling();
                optionsContainer?.selectStart();
                return true;
            }

            // if we are in explanation, we want to get out of the MCQContainerNode
            // as a whole, creating its new sibling pargraph
            else if ($isExplanationNode(currentNode)) {
                const parent = mcqContainer.getParent();
                if (parent) {
                    const newParagraph = $createParagraphNode();
                    mcqContainer.insertAfter(newParagraph);
                    newParagraph.select();
                    return true;
                }
            }

            return false;
        }

        // helper function to navigate between options within the options container
        const navigateToNextOption = (node: MCQOptionNode): boolean => {
            const option = $findMatchingParent(node, $isMCQOptionNode);
            if (!option) return false;

            // Get the options container
            const optionsContainer = option.getParent();
            if (!$isMCQOptionsContainerNode(optionsContainer)) return false;

            // Get all options
            const options = optionsContainer.getOptions();
            const optionIndex = options.indexOf(option);

            // If there's a next option, navigate to it
            if (optionIndex < options.length - 1) {
                const nextOption = options[optionIndex + 1];
                nextOption.selectEnd();
                return true;
            }
            else { // this is the last option
                // if the options are less than the max no. of options allowed
                if (optionIndex === options.length - 1 && optionsContainer.canAddOption()) {
                    const newOption = optionsContainer.addOption();
                    newOption.selectStart();
                    return true;
                }
                // This is the last option and we can't add more.
                // Navigate to the explanation 
                else {
                    const mcqContainer = optionsContainer.getParent();
                    if (!$isMCQContainerNode(mcqContainer)) return false;

                    const explanation = mcqContainer.getLastChild();
                    if (!$isExplanationNode(explanation)) return false;
                    else {
                        explanation.selectEnd();
                        return true;
                    }
                }
            }
        };


        return mergeRegister(
            // Insert new MCQ
            editor.registerCommand(
                INSERT_MCQ_COMMAND,
                () => {
                    editor.update(() => {
                        // Create necessary nodes
                        const mcqContainerNode = $createMCQContainerNode();
                        const questionNode = $createMCQQuestionNode();
                        const optionContainerNode = $createMCQOptionsContainerNode();
                        const optionNode = $createMCQOptionNode().append($createParagraphNode().append($createTextNode('option...')));
                        const optionNode2 = $createMCQOptionNode().append($createParagraphNode().append($createTextNode('option...')));
                        const explantionNode = $createExplanationNode().append($createParagraphNode().append($createTextNode('explanation...')))
                        const paragraph = $createParagraphNode().append($createTextNode('?...'));
                        $insertNodeToNearestRoot(
                            mcqContainerNode.append(
                                questionNode.append(paragraph),
                                optionContainerNode.append(optionNode, optionNode2),
                                explantionNode,
                            ),
                        );
                        paragraph.select();
                    });
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),

            // Handle Ctrl + Enter to navigate between question, options and explanation
            editor.registerCommand(
                KEY_ENTER_COMMAND,
                (event) => {
                    if (!event || !event.ctrlKey) return false;

                    const selection = $getSelection();
                    if (!$isRangeSelection(selection)) return false;

                    const node = selection.anchor.getNode();

                    const nodeParent = $findMatchingParent(node,
                        (n) => $isMCQOptionNode(n) || $isExplanationNode(n) || $isMCQQuestionNode(n)
                    );
                    if (!nodeParent) return false;
                    if ($isMCQOptionNode(nodeParent)) {
                        navigateToNextOption(nodeParent);
                        return true;
                    }
                    if ($isMCQQuestionNode(nodeParent) || $isExplanationNode(nodeParent)) {
                        navigateToNextSection(nodeParent);
                        return true;
                    }

                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),

            // Handle backspace at the start of question to collapse MCQContainerNode
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                () => {
                    const selection = $getSelection();
                    if (!$isRangeSelection(selection) || !selection.isCollapsed() || selection.anchor.offset !== 0) {
                        return false;
                    }

                    const node = selection.anchor.getNode();
                    const questionNode = $findMatchingParent(node, $isMCQQuestionNode);
                    if (!questionNode) return false;

                    // Only collapse if we're at the very start of the question
                    if (questionNode.getFirstDescendant() !== node) return false;

                    // Remove mcq container node. There is no logic in keeping it's inner nodes if user doesn't want MCQ.
                    const mcqContainer = questionNode.getParent();
                    if (!$isMCQContainerNode(mcqContainer)) return false;
                    const paragraph = $createParagraphNode();
                    mcqContainer.insertBefore(paragraph);
                    mcqContainer.remove();
                    paragraph.select();

                    return true;
                },
                COMMAND_PRIORITY_LOW,
            )
        );
    }, [editor]);

    return null;
}