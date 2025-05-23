import './index.css';

import {
    $createLinkNode,
    $isAutoLinkNode,
    $isLinkNode,
    TOGGLE_LINK_COMMAND,
} from '@lexical/link';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $findMatchingParent, mergeRegister } from '@lexical/utils';
import {
    $getSelection,
    $isLineBreakNode,
    $isRangeSelection,
    BaseSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_CRITICAL,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    KEY_ESCAPE_COMMAND,
    LexicalEditor,
    SELECTION_CHANGE_COMMAND,
} from 'lexical';
import { Dispatch, useCallback, useEffect, useRef, useState } from 'react';
import * as React from 'react';
import { createPortal } from 'react-dom';

import { getSelectedNode } from '@/core/lexical-editor/utils';
import { setFloatingElemPositionForLinkEditor } from '@/core/lexical-editor/utils';
import { sanitizeUrl } from '@/lib/utils/url';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CheckIcon, PencilIcon, TrashIcon, XIcon } from 'lucide-react';

function FloatingLinkEditor({
    editor,
    isLink,
    setIsLink,
    anchorElem,
    isLinkEditMode,
    setIsLinkEditMode,
}: {
    editor: LexicalEditor;
    isLink: boolean;
    setIsLink: Dispatch<boolean>;
    anchorElem: HTMLElement;
    isLinkEditMode: boolean;
    setIsLinkEditMode: Dispatch<boolean>;
}): React.JSX.Element {
    const editorRef = useRef<HTMLDivElement | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const [linkUrl, setLinkUrl] = useState('');
    const [editedLinkUrl, setEditedLinkUrl] = useState('https://');
    const [lastSelection, setLastSelection] = useState<BaseSelection | null>(
        null,
    );

    const $updateLinkEditor = useCallback(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
            const node = getSelectedNode(selection);
            const linkParent = $findMatchingParent(node, $isLinkNode);

            if (linkParent) {
                setLinkUrl(linkParent.getURL());
            } else if ($isLinkNode(node)) {
                setLinkUrl(node.getURL());
            } else {
                setLinkUrl('');
            }
            if (isLinkEditMode) {
                setEditedLinkUrl(linkUrl);
            }
        }
        const editorElem = editorRef.current;
        const nativeSelection = window.getSelection();
        const activeElement = document.activeElement;

        if (editorElem === null) {
            return;
        }

        const rootElement = editor.getRootElement();

        if (
            selection !== null &&
            nativeSelection !== null &&
            rootElement !== null &&
            rootElement.contains(nativeSelection.anchorNode) &&
            editor.isEditable()
        ) {
            const domRect: DOMRect | undefined =
                nativeSelection.focusNode?.parentElement?.getBoundingClientRect();
            if (domRect) {
                domRect.y += 40;
                setFloatingElemPositionForLinkEditor(domRect, editorElem, anchorElem);
            }
            setLastSelection(selection);
        } else if (!activeElement || activeElement.className !== 'link-input') {
            if (rootElement !== null) {
                setFloatingElemPositionForLinkEditor(null, editorElem, anchorElem);
            }
            setLastSelection(null);
            setIsLinkEditMode(false);
            setLinkUrl('');
        }

        return true;
    }, [anchorElem, editor, setIsLinkEditMode, isLinkEditMode, linkUrl]);

    useEffect(() => {
        const scrollerElem = anchorElem.parentElement;

        const update = () => {
            editor.getEditorState().read(() => {
                $updateLinkEditor();
            });
        };

        window.addEventListener('resize', update);

        if (scrollerElem) {
            scrollerElem.addEventListener('scroll', update);
        }

        return () => {
            window.removeEventListener('resize', update);

            if (scrollerElem) {
                scrollerElem.removeEventListener('scroll', update);
            }
        };
    }, [anchorElem.parentElement, editor, $updateLinkEditor]);

    useEffect(() => {
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    $updateLinkEditor();
                });
            }),

            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                () => {
                    $updateLinkEditor();
                    return true;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                () => {
                    if (isLink) {
                        setIsLink(false);
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_HIGH,
            ),
        );
    }, [editor, $updateLinkEditor, setIsLink, isLink]);

    useEffect(() => {
        editor.getEditorState().read(() => {
            $updateLinkEditor();
        });
    }, [editor, $updateLinkEditor]);

    useEffect(() => {
        if (isLinkEditMode && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isLinkEditMode, isLink]);

    const monitorInputInteraction = (
        event: React.KeyboardEvent<HTMLInputElement>,
    ) => {
        if (event.key === 'Enter') {
            event.preventDefault();
            handleLinkSubmission();
        } else if (event.key === 'Escape') {
            event.preventDefault();
            setIsLinkEditMode(false);
        }
    };

    const handleLinkSubmission = () => {
        if (lastSelection !== null) {
            if (linkUrl !== '') {
                editor.dispatchCommand(TOGGLE_LINK_COMMAND, sanitizeUrl(editedLinkUrl));
                editor.update(() => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const parent = getSelectedNode(selection).getParent();
                        if ($isAutoLinkNode(parent)) {
                            const linkNode = $createLinkNode(parent.getURL(), {
                                rel: parent.__rel,
                                target: parent.__target,
                                title: parent.__title,
                            });
                            parent.replace(linkNode, true);
                        }
                    }
                });
            }
            setEditedLinkUrl('https://');
            setIsLinkEditMode(false);
        }
    };

    return (
        <div ref={editorRef} className="absolute top-0 left-0 z-10 h-10 flex shadow-2xl rounded-lg  bg-cyan-300 dark:bg-cyan-700 dark:shadow-none will-change-transform">
            {!isLink ? null : isLinkEditMode ? (
                <div className='flex items-center justify-center gap-1 md:gap-2 p-2'>
                    <Input
                        ref={inputRef}
                        className="link-input max-w-96 border-none"
                        value={editedLinkUrl}
                        onChange={(event) => {
                            setEditedLinkUrl(event.target.value);
                        }}
                        onKeyDown={(event) => {
                            monitorInputInteraction(event);
                        }}
                    />
                    <span className='flex items-center ps-2 gap-2'>
                        <Button
                            className="link-cancel"
                            type="button"
                            tabIndex={0}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                                setIsLinkEditMode(false);
                            }}
                        >
                            <XIcon className='size-4' />
                        </Button>

                        <Button
                            className="link-confirm"
                            type="button"
                            tabIndex={0}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={handleLinkSubmission}
                        >
                            <CheckIcon className='size-4' />
                        </Button>
                    </span>
                </div>
            ) : (
                <div className='flex items-center justify-center px-2'>
                    <a
                        href={sanitizeUrl(linkUrl)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm"
                    >
                        {linkUrl}
                    </a>
                    <span className='flex items-center gap-2 ps-2'>
                        <Button
                            className="link-edit"
                            type="button"
                            tabIndex={0}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                                setEditedLinkUrl(linkUrl);
                                setIsLinkEditMode(true);
                            }}
                        >
                            <PencilIcon className='size-4' />
                        </Button>
                        <Button
                            className="link-trash"
                            type="button"
                            tabIndex={0}
                            onMouseDown={(event) => event.preventDefault()}
                            onClick={() => {
                                editor.dispatchCommand(TOGGLE_LINK_COMMAND, null);
                            }}
                        >
                            <TrashIcon className='size-4' />
                        </Button>
                    </span>
                </div>
            )}
        </div>
    );
}

function useFloatingLinkEditorToolbar(
    editor: LexicalEditor,
    anchorElem: HTMLElement,
    isLinkEditMode: boolean,
    setIsLinkEditMode: Dispatch<boolean>,
): React.JSX.Element | null {
    const [activeEditor, setActiveEditor] = useState(editor);
    const [isLink, setIsLink] = useState(false);

    useEffect(() => {
        function $updateToolbar() {
            const selection = $getSelection();
            if ($isRangeSelection(selection)) {
                const focusNode = getSelectedNode(selection);
                const focusLinkNode = $findMatchingParent(focusNode, $isLinkNode);
                const focusAutoLinkNode = $findMatchingParent(
                    focusNode,
                    $isAutoLinkNode,
                );
                if (!(focusLinkNode || focusAutoLinkNode)) {
                    setIsLink(false);
                    return;
                }
                const badNode = selection
                    .getNodes()
                    .filter((node) => !$isLineBreakNode(node))
                    .find((node) => {
                        const linkNode = $findMatchingParent(node, $isLinkNode);
                        const autoLinkNode = $findMatchingParent(node, $isAutoLinkNode);
                        return (
                            (focusLinkNode && !focusLinkNode.is(linkNode)) ||
                            (linkNode && !linkNode.is(focusLinkNode)) ||
                            (focusAutoLinkNode && !focusAutoLinkNode.is(autoLinkNode)) ||
                            (autoLinkNode &&
                                (!autoLinkNode.is(focusAutoLinkNode) ||
                                    autoLinkNode.getIsUnlinked()))
                        );
                    });
                if (!badNode) {
                    setIsLink(true);
                } else {
                    console.log('Bad node');
                    setIsLink(false);
                }
            }
        }
        return mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                editorState.read(() => {
                    $updateToolbar();
                });
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
                CLICK_COMMAND,
                (payload) => {
                    const selection = $getSelection();
                    if ($isRangeSelection(selection)) {
                        const node = getSelectedNode(selection);
                        const linkNode = $findMatchingParent(node, $isLinkNode);
                        if ($isLinkNode(linkNode) && (payload.metaKey || payload.ctrlKey)) {
                            window.open(linkNode.getURL(), '_blank');
                            return true;
                        }
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
        );
    }, [editor]);

    return createPortal(
        <FloatingLinkEditor
            editor={activeEditor}
            isLink={isLink}
            anchorElem={anchorElem}
            setIsLink={setIsLink}
            isLinkEditMode={isLinkEditMode}
            setIsLinkEditMode={setIsLinkEditMode}
        />,
        anchorElem,
    );
}

export default function FloatingLinkEditorPlugin({
    anchorElem = document.body,
    isLinkEditMode,
    setIsLinkEditMode,
}: {
    anchorElem?: HTMLElement;
    isLinkEditMode: boolean;
    setIsLinkEditMode: Dispatch<boolean>;
}): React.JSX.Element | null {
    const [editor] = useLexicalComposerContext();
    return useFloatingLinkEditorToolbar(
        editor,
        anchorElem,
        isLinkEditMode,
        setIsLinkEditMode,
    );
}