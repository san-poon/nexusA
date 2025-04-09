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
        // Track the last backspace timestamp for double-backspace detection
        let lastBackspaceTime = 0;
        const DOUBLE_BACKSPACE_THRESHOLD = 500; // ms

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
                if (!$isMCQOptionsContainerNode(optionsContainer)) return false;
                const firstOption = optionsContainer.getFirstChild();
                if (firstOption) {
                    firstOption.selectEnd();
                    return true;
                }
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
        const navigateToNextOption = (node: LexicalNode): boolean => {
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
                    newOption.selectEnd();
                    return true;
                }
                // Navigate to the explanation node
                else {
                    const mcqContainer = optionsContainer.getParent();
                    if (!$isMCQContainerNode(mcqContainer)) return false;

                    const explanation = mcqContainer.getLastChild();
                    if (!$isExplanationNode(explanation)) return false;

                    explanation.selectEnd();
                    return true;
                }
            }
        };

        // Helper function to handle backspace key at the start of a option
        // it only applies to 3rd and 4th option
        const handleBackspaceInOption = (node: LexicalNode): boolean => {
            // Find if we're in MCQ Option
            const option = $findMatchingParent(node, $isMCQOptionNode);
            if (!option) return false;

            //  Only handle if the option is empty
            if (option.getTextContent().trim() !== '') return false;

            // Get the options container
            const optionsContainer = option.getParent();
            if (!$isMCQOptionsContainerNode(optionsContainer)) return false;

            // Proceed only if there are more than 2 options
            if (!optionsContainer.canRemoveOption()) return false;

            // Get all options to find the previous option
            const options = optionsContainer.getOptions();
            const currentIndex = options.indexOf(option);

            if (currentIndex > 0) {
                const previousOption = options[currentIndex - 1];
                previousOption.selectEnd();
                optionsContainer.removeOption(option);
                return true;
            }

            return false
        }


        return mergeRegister(
            // Insert new MCQ
            editor.registerCommand(
                INSERT_MCQ_COMMAND,
                () => {
                    editor.update(() => {
                        // Create necessary nodes
                        const mcqContainerNode = $createMCQContainerNode();
                        const questionNode = $createMCQQuestionNode();
                        const optionsContainerNode = $createMCQOptionsContainerNode();
                        const optionNode = $createMCQOptionNode().append($createParagraphNode().append($createTextNode('option...')));
                        const optionNode2 = $createMCQOptionNode().append($createParagraphNode());
                        const explantionNode = $createExplanationNode().append($createParagraphNode().append($createTextNode('explanation...')))
                        const paragraph = $createParagraphNode().append($createTextNode('?...'));
                        $insertNodeToNearestRoot(
                            mcqContainerNode.append(
                                questionNode.append(paragraph),
                                optionsContainerNode.append(optionNode, optionNode2),
                                explantionNode,
                            ),
                        );
                        paragraph.select();
                    });
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),


            // Add new MCQ Option (max 4)
            editor.registerCommand(
                ADD_MCQ_OPTION_COMMAND,
                () => {
                    editor.update(() => {
                        const selection = $getSelection();
                        if (!$isRangeSelection(selection)) return false;

                        const node = selection.anchor.getNode();
                        const optionsContainer = $findMatchingParent(node, $isMCQOptionsContainerNode);
                        if (!optionsContainer) return false;

                        // Proceed only if there are less than 4 options
                        if (!optionsContainer.canAddOption()) return false;
                        const newOption = optionsContainer.addOption();

                        //Select the end of the new option
                        newOption.selectEnd();
                        return true;
                    })
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),

            // Remove MCQ Option
            editor.registerCommand(
                REMOVE_MCQ_OPTION_COMMAND,
                (nodeKey: NodeKey) => {
                    editor.update(() => {
                        const node = $getNodeByKey(nodeKey);
                        if (!$isMCQOptionNode(node)) return false;

                        const optionsContainer = node.getParent();
                        if (!$isMCQOptionsContainerNode(optionsContainer)) return false;

                        // Only proceed if there are more than 2 options
                        if (!optionsContainer.canRemoveOption()) return false;
                        optionsContainer.removeOption(node);

                        return true;

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

            // Handle backspace at the start of question to delete MCQContainerNode
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

                    // Only p if we're at the very start of the question
                    if (questionNode.getFirstDescendant() !== node) return false;

                    const currentTime = Date.now();

                    // If this is the first backspace or too much time has passed since the last one
                    if (currentTime - lastBackspaceTime > DOUBLE_BACKSPACE_THRESHOLD) {
                        lastBackspaceTime = currentTime;
                        return false; // Let the backspace happen normally but don't delete the MCQ
                    }

                    // This is a double backspace within the threshold time
                    lastBackspaceTime = 0; // Reset the timer

                    // Remove mcq container node
                    const mcqContainer = questionNode.getParent();
                    if (!$isMCQContainerNode(mcqContainer)) return false;
                    const paragraph = $createParagraphNode();
                    mcqContainer.insertBefore(paragraph);
                    mcqContainer.remove();
                    paragraph.select();

                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),

            // Handle backspace at the start of option which is empty
            // this is to handle the case where user has only 2 options and wants to remove the selectedoption
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                () => {
                    const selection = $getSelection();
                    if (!$isRangeSelection(selection) || !selection.isCollapsed() || selection.anchor.offset !== 0) {
                        return false;
                    }
                    const node = selection.anchor.getNode();
                    return handleBackspaceInOption(node);
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor]);

    return null;
}