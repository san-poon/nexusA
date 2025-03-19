import {
    $getNodeByKey,
    $getSelection,
    $isNodeSelection,
    $isRangeSelection,
    $setSelection,
    BaseSelection,
    CLICK_COMMAND,
    COMMAND_PRIORITY_LOW,
    createCommand,
    DRAGSTART_COMMAND,
    KEY_BACKSPACE_COMMAND,
    KEY_DELETE_COMMAND,
    KEY_ENTER_COMMAND,
    KEY_ESCAPE_COMMAND,
    LexicalCommand,
    LexicalEditor,
    LineBreakNode,
    NodeKey,
    ParagraphNode,
    RootNode,
    SELECTION_CHANGE_COMMAND,
    TextNode
} from "lexical";
import { JSX, Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useLexicalNodeSelection } from '@lexical/react/useLexicalNodeSelection';
import { useCollaborationContext } from '@lexical/react/LexicalCollaborationContext';
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { LexicalNestedComposer } from '@lexical/react/LexicalNestedComposer';
import { $isImageNode } from "./ImageNode";
import { mergeRegister } from "@lexical/utils";

import brokenImage from '../../../lib/images/image-broken.svg';
import { useSharedHistoryContext } from "../../context/SharedHistoryContext";
import { LinkNode } from "@lexical/link";
import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin";
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin";
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin";
import { ContentEditable } from "@lexical/react/LexicalContentEditable";
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import ImageResizer from "@/components/ui/ImageResizer";
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin";
import { HorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { cn } from "@/lib/utils";
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin";
import { HeadingNode } from "@lexical/rich-text";


export const RIGHT_CLICK_IMAGE_COMMAND: LexicalCommand<MouseEvent> =
    createCommand('RIGHT_CLICK_IMAGE_COMMAND');

export default function ImageComponent({ src, altText, nodeKey, width, height, maxWidth, resizable, showCaption, caption, captionsEnabled }: {
    src: string;
    altText: string;
    width: 'inherit' | number;
    maxWidth: number;
    height: 'inherit' | number;
    caption: LexicalEditor;
    showCaption: boolean;
    captionsEnabled: boolean;
    nodeKey: NodeKey;
    resizable: boolean;
}): JSX.Element {
    const imageRef = useRef<null | HTMLImageElement>(null)
    const buttonRef = useRef<null | HTMLButtonElement>(null);
    const activeEditorRef = useRef<LexicalEditor | null>(null);
    const [isResizing, setIsResizing] = useState<boolean>(false);
    const [selection, setSelection] = useState<null | BaseSelection>(null);
    const [isLoadError, setIsLoadError] = useState<boolean>(false);
    const [isSelected, setSelected, clearSelection] = useLexicalNodeSelection(nodeKey);
    const { isCollabActive } = useCollaborationContext();
    const [editor] = useLexicalComposerContext();

    const $onDelete = useCallback(
        (payload: KeyboardEvent) => {
            const deleteSelection = $getSelection();
            if (isSelected && $isNodeSelection(deleteSelection)) {
                const event: KeyboardEvent = payload;
                event.preventDefault();
                editor.update(() => {
                    deleteSelection.getNodes().forEach((node) => {
                        if ($isImageNode(node)) {
                            node.remove();
                        }
                    });
                });
            }
            return false;
        },
        [editor, isSelected]
    );

    const $onEnter = useCallback(
        (event: KeyboardEvent) => {
            const latestSelection = $getSelection();
            const buttonElem = buttonRef.current;
            if (isSelected &&
                $isNodeSelection(latestSelection) &&
                latestSelection.getNodes().length === 1
            ) {
                if (showCaption) {
                    // More focus into nested editor
                    $setSelection(null);
                    event.preventDefault();
                    caption.focus();
                    return true;
                } else if (
                    buttonElem !== null &&
                    buttonElem !== document.activeElement
                ) {
                    event.preventDefault();
                    buttonElem.focus();
                    return true;
                }
            }
            return false;
        },
        [caption, isSelected, showCaption],
    );

    const $onEscape = useCallback(
        (event: KeyboardEvent) => {
            if (
                activeEditorRef.current === caption ||
                buttonRef.current === event.target
            ) {
                $setSelection(null);
                editor.update(() => {
                    setSelected(true);
                    const parentRootElement = editor.getRootElement();
                    if (parentRootElement !== null) {
                        parentRootElement.focus();
                    }
                });
                return true;
            }
            return false;
        },
        [caption, editor, setSelected],
    );

    const onClick = useCallback(
        (payload: MouseEvent) => {
            const event = payload;

            if (isResizing) {
                return true;
            }
            if (event.target === imageRef.current) {
                if (event.shiftKey) {
                    setSelected(!isSelected);
                } else {
                    clearSelection();
                    setSelected(true);
                }
                return true;
            }
            return false;
        },
        [isResizing, isSelected, setSelected, clearSelection],
    )

    const onRightClick = useCallback(
        (event: MouseEvent): void => {
            editor.getEditorState().read(() => {
                const latestSelection = $getSelection();
                const domElement = event.target as HTMLElement;
                if (
                    domElement.tagName === 'IMG' &&
                    $isRangeSelection(latestSelection) &&
                    latestSelection.getNodes().length === 1
                ) {
                    editor.dispatchCommand(
                        RIGHT_CLICK_IMAGE_COMMAND,
                        event as MouseEvent,
                    );
                }
            });
        },
        [editor],
    );

    useEffect(() => {
        let isMounted = true;
        const rootElement = editor.getRootElement();
        const unregister = mergeRegister(
            editor.registerUpdateListener(({ editorState }) => {
                if (isMounted) {
                    setSelection(editorState.read(() => $getSelection()))
                }
            }),
            editor.registerCommand(
                SELECTION_CHANGE_COMMAND,
                (_, activeEditor) => {
                    activeEditorRef.current = activeEditor;
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand<MouseEvent>(
                CLICK_COMMAND,
                onClick,
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand<MouseEvent>(
                RIGHT_CLICK_IMAGE_COMMAND,
                onClick,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                DRAGSTART_COMMAND,
                (event) => {
                    if (event.target === imageRef.current) {
                        // TODO  This is just a temporary workaround for FF to behave like other browsers.
                        // Ideally, this handles drag & drop too (and all browsers).
                        event.preventDefault();
                        return true;
                    }
                    return false;
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_DELETE_COMMAND,
                $onDelete,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_BACKSPACE_COMMAND,
                $onDelete,
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand(
                KEY_ENTER_COMMAND,
                $onEnter,
                COMMAND_PRIORITY_LOW
            ),
            editor.registerCommand(
                KEY_ESCAPE_COMMAND,
                $onEscape,
                COMMAND_PRIORITY_LOW,
            ),
        );

        rootElement?.addEventListener('contextmenu', onRightClick);

        return () => {
            isMounted = false;
            unregister();
            rootElement?.removeEventListener('contextmenu', onRightClick);
        };
    }, [
        clearSelection,
        editor,
        isResizing,
        isSelected,
        nodeKey,
        $onDelete,
        $onEnter,
        $onEscape,
        onClick,
        onRightClick,
        setSelected,
    ]);

    const setShowCaption = () => {
        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageNode(node)) {
                node.setShowCaption(true);
            }
        });
    };

    const onResizeEnd = (
        nextWidth: 'inherit' | number,
        nextHeight: 'inherit' | number,
    ) => {
        // Delay hiding the resize bars for click case
        setTimeout(() => {
            setIsResizing(false);
        }, 200);

        editor.update(() => {
            const node = $getNodeByKey(nodeKey);
            if ($isImageNode(node)) {
                node.setWidthAndHeight(nextWidth, nextHeight);
            }
        });
    };

    const onResizeStart = () => {
        setIsResizing(true);
    };

    const { historyState } = useSharedHistoryContext();

    const draggable = isSelected && $isNodeSelection(selection) && !isResizing;
    const isFocused = isSelected || isResizing;

    return (
        <Suspense fallback={null}>
            <>
                <div draggable={draggable} className="overflow-hidden">
                    {isLoadError ? (
                        <BrokenImage />
                    ) : (
                        <LazyImage
                            className={
                                isFocused
                                    ? `focused ${$isNodeSelection(selection) ? 'draggable' : ''}`
                                    : null
                            }
                            src={src}
                            altText={altText}
                            imageRef={imageRef}
                            width={width}
                            height={height}
                            maxWidth={maxWidth}
                            onError={() => setIsLoadError(true)}
                        />
                    )}
                </div>

                {showCaption && (
                    <div className="image-caption-container">
                        <LexicalNestedComposer
                            initialEditor={caption}
                            initialNodes={[
                                RootNode,
                                TextNode,
                                LineBreakNode,
                                ParagraphNode,
                                LinkNode,
                                HorizontalRuleNode,
                            ]}>
                            <AutoFocusPlugin />
                            <HorizontalRulePlugin />
                            <HistoryPlugin externalHistoryState={historyState} />
                            <RichTextPlugin
                                contentEditable={
                                    <ContentEditable
                                        className={cn("ImageNode__contentEditable min-h-[20px] tracking-tight border-0 resize-none cursor-text block relative outline-0 p-1 select-text text-xs w-[calc(100%-20px)] whitespace-pre-wrap")} />
                                }
                                ErrorBoundary={LexicalErrorBoundary}
                            />
                        </LexicalNestedComposer>
                    </div>
                )}
                {resizable && $isNodeSelection(selection) && isFocused && (
                    <ImageResizer
                        showCaption={showCaption}
                        setShowCaption={setShowCaption}
                        editor={editor}
                        buttonRef={buttonRef}
                        imageRef={imageRef}
                        maxWidth={maxWidth}
                        onResizeStart={onResizeStart}
                        onResizeEnd={onResizeEnd}
                        captionsEnabled={!isLoadError && captionsEnabled}
                    />
                )}
            </>
        </Suspense>
    )
}

function BrokenImage() {
    return (
        <img
            src={brokenImage}
            className=" h-48 w-48 opacity-20"
            draggable={false}
        />
    );
}

function LazyImage({ altText, className, imageRef, src, width, height, maxWidth, onError, }: {
    src: string;
    altText: string;
    height: 'inherit' | number;
    width: 'inherit' | number;
    maxWidth: number;
    className: string | null;
    imageRef: { current: null | HTMLImageElement };
    onError: () => void;
}) {
    useSuspenseImage(src);
    return (
        <img
            className={className || undefined}
            src={src}
            alt={altText}
            style={{
                height,
                width,
                maxWidth
            }}
            onError={onError}
            draggable="false"
            ref={imageRef}
        />
    )
}


const imageCache = new Set();

function useSuspenseImage(src: string) {
    if (!imageCache.has(src)) {
        throw new Promise((resolve) => {
            const img = new Image();
            img.src = src;
            img.onload = () => {
                imageCache.add(src);
                resolve(null)
            };
            img.onerror = () => {
                imageCache.add(src);
            }
        });
    }
}