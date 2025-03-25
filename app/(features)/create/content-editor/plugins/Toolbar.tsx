'use client';

import { $createCodeNode, $isCodeNode, CODE_LANGUAGE_FRIENDLY_NAME_MAP, getLanguageFriendlyName } from '@lexical/code';
import { $isListNode, INSERT_ORDERED_LIST_COMMAND, INSERT_UNORDERED_LIST_COMMAND, ListNode } from '@lexical/list';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $createHeadingNode, $createQuoteNode, $isHeadingNode } from '@lexical/rich-text';
import {
    $isParentElementRTL,
    $setBlocksType,
} from '@lexical/selection';
import {
    $findMatchingParent,
    $getNearestNodeOfType,
    mergeRegister,
} from '@lexical/utils';
import {
    $createParagraphNode,
    $getNodeByKey,
    $getSelection,
    $isElementNode,
    $isRangeSelection,
    $isRootOrShadowRoot,
    CAN_REDO_COMMAND,
    CAN_UNDO_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    ElementFormatType,
    FORMAT_ELEMENT_COMMAND,
    INDENT_CONTENT_COMMAND,
    LexicalEditor,
    NodeKey,
    OUTDENT_CONTENT_COMMAND,
    REDO_COMMAND,
    SELECTION_CHANGE_COMMAND,
    UNDO_COMMAND,
} from 'lexical';
import { JSX, useCallback, useEffect, useState } from 'react';
import * as React from 'react';

// Import shadcn components
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { CodeIcon, Heading1Icon, Heading2Icon, Heading3Icon, ListOrderedIcon, QuoteIcon, RedoIcon, TextIcon, UndoIcon } from 'lucide-react';
import { BulletListIcon } from '@/components/icons';


export default function ToolbarPlugin(): JSX.Element {
    const [editor] = useLexicalComposerContext();
    const [activeEditor, setActiveEditor] = useState(editor);
    const [isEditable, setIsEditable] = useState(() => editor.isEditable());
    const [canUndo, setCanUndo] = useState(false);
    const [canRedo, setCanRedo] = useState(false);
    const [blockType, setBlockType] = useState<keyof typeof blockTypeToBlockName>('paragraph');
    const [selectedElementKey, setSelectedElementKey] = useState<NodeKey | null>(null);
    const [codeLanguage, setCodeLanguage] = useState('');
    const [isRTL, setIsRTL] = useState(false);
    const [elementFormat, setElementFormat] = useState<ElementFormatType>('left');

    const $updateToolbar = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            // Update block type
            const anchorNode = selection.anchor.getNode();
            let element =
                anchorNode.getKey() === 'root'
                    ? anchorNode
                    : $findMatchingParent(anchorNode, (e) => {
                        const parent = e.getParent();
                        return parent !== null && $isRootOrShadowRoot(parent);
                    });

            if (element === null) {
                element = anchorNode.getTopLevelElementOrThrow();
            }

            const elementKey = element.getKey();
            const elementDOM = activeEditor.getElementByKey(elementKey);

            // Set text direction (RTL)
            setIsRTL($isParentElementRTL(selection));

            if (elementDOM !== null) {
                setSelectedElementKey(elementKey);
                if ($isListNode(element)) {
                    const parentList = $getNearestNodeOfType<ListNode>(
                        anchorNode,
                        ListNode,
                    );
                    const type = parentList
                        ? parentList.getListType()
                        : element.getListType();
                    setBlockType(type as keyof typeof blockTypeToBlockName);
                } else {
                    const type = $isHeadingNode(element)
                        ? element.getTag()
                        : element.getType();
                    if (type in blockTypeToBlockName) {
                        setBlockType(type as keyof typeof blockTypeToBlockName);
                    }
                    if ($isCodeNode(element)) {
                        const language = element.getLanguage() as string;
                        setCodeLanguage(language ? language : '');
                        return;
                    }
                }
            }

            // Set element format
            let matchingParent;
            const parent = anchorNode.getParent();
            if (parent) {
                matchingParent = $findMatchingParent(
                    anchorNode,
                    (parentNode) => $isElementNode(parentNode) && !parentNode.isInline(),
                );
            }

            setElementFormat(
                $isElementNode(matchingParent)
                    ? matchingParent.getFormatType()
                    : $isElementNode(anchorNode)
                        ? anchorNode.getFormatType()
                        : parent?.getFormatType() || 'left',
            );
        }
    }, [activeEditor]);

    // Register event listeners
    useEffect(() => {
        return mergeRegister(
            editor.registerEditableListener((editable) => {
                setIsEditable(editable);
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_payload, newEditor) => {
                    $updateToolbar();
                    setActiveEditor(newEditor);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            editor.registerCommand(
                CAN_UNDO_COMMAND,
                (payload) => {
                    setCanUndo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            editor.registerCommand(
                CAN_REDO_COMMAND,
                (payload) => {
                    setCanRedo(payload);
                    return false;
                },
                COMMAND_PRIORITY_CRITICAL,
            ),
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    $updateToolbar();
                });
            }),
        );
    }, [editor, $updateToolbar]);

    useEffect(() => {
        return activeEditor.registerUpdateListener(({ editorState }) => {
            editorState.read(() => {
                $updateToolbar();
            });
        });
    }, [activeEditor, $updateToolbar]);

    // Set language for code blocks
    const onCodeLanguageSelect = useCallback(
        (value: string) => {
            activeEditor.update(() => {
                if (selectedElementKey !== null) {
                    const node = $getNodeByKey(selectedElementKey);
                    if ($isCodeNode(node)) {
                        node.setLanguage(value);
                    }
                }
            });
        },
        [activeEditor, selectedElementKey],
    );

    return (
        <div className="flex flex-wrap items-center gap-1 py-2 fixed top-16 z-20 bg-white dark:bg-wash-800">
            {/* History Controls */}
            <Button
                variant="ghost"
                size="sm"
                onClick={() => activeEditor.dispatchCommand(UNDO_COMMAND, undefined)}
                disabled={!canUndo || !isEditable}
                aria-label="Undo"
            >
                <UndoIcon className="h-4 w-4" />
            </Button>
            <Button
                variant="ghost"
                size="sm"
                onClick={() => activeEditor.dispatchCommand(REDO_COMMAND, undefined)}
                disabled={!canRedo || !isEditable}
                aria-label="Redo"
            >
                <RedoIcon className="h-4 w-4" />
            </Button>

            <Separator orientation="vertical" className="mx-2 h-6" />

            {/* Block type dropdown */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="min-w-[120px] justify-between">
                        {blockTypeToBlockName[blockType]}
                        <span className="ml-2">
                            &#11167;
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem onClick={() => formatParagraph(editor)}>
                        <TextIcon className="h-3 w-3" />
                        <span className="ps-2">Normal</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => formatHeading(editor, 'h1', blockType)}>
                        <Heading1Icon className="h-3 w-3" />
                        <span className="ps-2">Heading 1</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => formatHeading(editor, 'h2', blockType)}>
                        <Heading2Icon className="h-3 w-3" />
                        <span className="ps-2">Heading 2</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => formatHeading(editor, 'h3', blockType)}>
                        <Heading3Icon className="h-3 w-3" />
                        <span className="ps-2">Heading 3</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => formatBulletList(editor, blockType)}>
                        <BulletListIcon className="h-3 w-3" />
                        <span className="ps-2">Bullet List</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => formatNumberedList(editor, blockType)}>
                        <ListOrderedIcon className="h-3 w-3" />
                        <span className="ps-2">Numbered List</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => formatQuote(editor, blockType)}>
                        <QuoteIcon className="h-3 w-3" />
                        <span className="ps-2">Quote</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => formatCode(editor, blockType)}>
                        <CodeIcon className="h-3 w-3" />
                        <span className="ps-2">Code Block</span>
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* Code language selection (shown only for code blocks) */}
            {blockType === 'code' && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="min-w-[120px] justify-between">
                            {codeLanguage ? getLanguageFriendlyName(codeLanguage) : 'Select language'}
                            <span className="ml-2">
                                &#11167;
                            </span>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start">
                        {CODE_LANGUAGE_OPTIONS.map(([value, label]) => (
                            <DropdownMenuItem
                                key={value}
                                onClick={() => onCodeLanguageSelect(value)}
                            >
                                {label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            <Separator orientation="vertical" className="mx-2 h-6" />

            {/* Alignment */}
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="min-w-[100px] justify-between">
                        {elementFormat === 'left'
                            ? 'Left'
                            : elementFormat === 'center'
                                ? 'Center'
                                : elementFormat === 'right'
                                    ? 'Right'
                                    : 'Justify'}
                        <span className="ml-2">
                            &#11167;
                        </span>
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start">
                    <DropdownMenuItem
                        onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'left')}
                    >
                        Left Align
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'center')}
                    >
                        Center Align
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'right')}
                    >
                        Right Align
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => activeEditor.dispatchCommand(FORMAT_ELEMENT_COMMAND, 'justify')}
                    >
                        Justify
                    </DropdownMenuItem>
                    <Separator orientation="horizontal" className="my-2" />
                    {/* Indentation */}
                    <DropdownMenuItem
                        onClick={() => activeEditor.dispatchCommand(OUTDENT_CONTENT_COMMAND, undefined)}
                        aria-label="Outdent"
                    >
                        Outdent
                    </DropdownMenuItem>
                    <DropdownMenuItem
                        onClick={() => activeEditor.dispatchCommand(INDENT_CONTENT_COMMAND, undefined)}
                        aria-label="Indent"
                    >
                        Indent
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>

            {/* <Separator orientation="vertical" className="mx-2 h-6" />

             Text direction
            <Button
                variant="outline"
                size="sm"
                onClick={() => {
                    activeEditor.update(() => {
                        const selection = $getSelection();
                        if ($isRangeSelection(selection)) {
                            const nodes = selection.getNodes();

                            nodes.forEach(node => {
                                const parent = node.getParent();
                                if (parent) {
                                    parent.setDirection(isRTL ? 'ltr' : 'rtl');
                                }
                            });
                        }
                    });
                }}
                aria-label={isRTL ? "Left-to-Right" : "Right-to-Left"}
            >
                {isRTL ? "RTL" : "LTR"}
            </Button> */}

        </div>
    );
}

// Define block type to name mapping
const blockTypeToBlockName = {
    bullet: 'Bullet List',
    check: 'Check List',
    code: 'Code Block',
    h1: 'Heading 1',
    h2: 'Heading 2',
    h3: 'Heading 3',
    number: 'Numbered List',
    paragraph: 'Normal',
    quote: 'Quote',
};

// Code language options
function getCodeLanguageOptions(): [string, string][] {
    const options: [string, string][] = [];

    for (const [lang, friendlyName] of Object.entries(
        CODE_LANGUAGE_FRIENDLY_NAME_MAP,
    )) {
        options.push([lang, friendlyName]);
    }

    return options;
}

const CODE_LANGUAGE_OPTIONS = getCodeLanguageOptions();

// Helper functions for formatting
function formatParagraph(editor: LexicalEditor) {
    editor.update(() => {
        const selection = $getSelection();
        $setBlocksType(selection, () => $createParagraphNode());
    });
}

function formatHeading(
    editor: LexicalEditor,
    headingType: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6',
    blockType: string
) {
    if (blockType !== headingType) {
        editor.update(() => {
            const selection = $getSelection();
            $setBlocksType(selection, () => $createHeadingNode(headingType));
        });
    }
}

function formatBulletList(editor: LexicalEditor, blockType: string) {
    if (blockType !== 'bullet') {
        editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
    } else {
        formatParagraph(editor);
    }
}

function formatNumberedList(editor: LexicalEditor, blockType: string) {
    if (blockType !== 'number') {
        editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
    } else {
        formatParagraph(editor);
    }
}

function formatQuote(editor: LexicalEditor, blockType: string) {
    if (blockType !== 'quote') {
        editor.update(() => {
            const selection = $getSelection();
            $setBlocksType(selection, () => $createQuoteNode());
        })
    }
}

function formatCode(editor: LexicalEditor, blockType: string) {
    if (blockType !== 'code') {
        editor.update(() => {
            let selection = $getSelection();
            if (!selection) return;
            if ($isRangeSelection(selection) || selection.isCollapsed()) {
                $setBlocksType(selection, () => $createCodeNode());
            } else {
                const textContent = selection.getTextContent();
                const codeNode = $createCodeNode();
                selection.insertNodes([codeNode]);
                selection = $getSelection();
                if ($isRangeSelection(selection)) {
                    selection.insertRawText(textContent);
                }
            }
        });
    }
}