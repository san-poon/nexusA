'use client';

import {
    $createParagraphNode,
    $createRangeSelection,
    $getSelection,
    $insertNodes,
    $isNodeSelection,
    $isRootOrShadowRoot,
    $setSelection,
    COMMAND_PRIORITY_EDITOR,
    COMMAND_PRIORITY_HIGH,
    COMMAND_PRIORITY_LOW,
    createCommand,
    DRAGOVER_COMMAND,
    DRAGSTART_COMMAND,
    DROP_COMMAND,
    LexicalCommand,
    LexicalEditor
} from "lexical";
import { useEffect, useState } from "react";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { $wrapNodeInElement, CAN_USE_DOM, mergeRegister } from '@lexical/utils';

import {
    $createImageNode,
    $isImageNode,
    ImageNode,
    ImagePayload
} from '../nodes/ImageNode';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export type InsertImagePayload = Readonly<ImagePayload>;

export const INSERT_IMAGE_COMMAND: LexicalCommand<InsertImagePayload> = createCommand('INSERT_IMAGE_COMMAND');


export function InsertImageDialog({ activeEditor, onClose }: {
    activeEditor: LexicalEditor;
    onClose: () => void;
}) {
    const [mode, setMode] = useState<'url' | 'file'>('file');

    const onClick = (payload: InsertImagePayload) => {
        activeEditor.dispatchCommand(INSERT_IMAGE_COMMAND, payload);
        onClose();
    }

    return (
        <>
            {mode === 'url' &&
                <div>
                    <InsertImageUriDialogBody onClick={onClick} />
                    <div className="flex justify-end">
                        <Button
                            variant='outline'
                            className="mb-5 size-4 p-0 m-0"
                            onClick={() => setMode('file')}
                        >
                            File
                        </Button>
                    </div>
                </div>
            }
            {mode === 'file' &&
                <div>
                    <InsertImageUploadedDialogBody onClick={onClick} />
                    <div className="flex justify-end">
                        <Button
                            variant='outline'
                            className="mb-5 size-4 p-0 m-0"
                            onClick={() => setMode('url')}
                        >
                            URL
                        </Button>
                    </div>
                </div>
            }
        </>
    )
}

export function InsertImageUriDialogBody({ onClick }: { onClick: (payload: InsertImagePayload) => void; }) {
    const [src, setSrc] = useState('');
    const [altText, setAltText] = useState('');

    const isDisabled = src === '';

    return (
        <>
            <div className="flex-col space-y-1">
                <div className="flex items-center">
                    <Label className="w-1/3">Image URL</Label>
                    <Input
                        placeholder="https://source.unsplash.com/random"
                        onChange={(e) => setSrc(e.target.value)}
                        value={src}
                    />
                </div>
                <div className="flex items-center">
                    <Label className="w-1/3">Alt Text</Label>
                    <Input
                        placeholder="description of image"
                        onChange={(e) => setAltText(e.target.value)}
                        value={altText}
                    />
                </div>
            </div>
            <div className="flex justify-center mt-5">
                <Button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onClick({ altText, src })}
                >
                    Confirm
                </Button>
            </div>
        </>
    );
}

export function InsertImageUploadedDialogBody({ onClick, }: {
    onClick: (payload: InsertImagePayload) => void;
}) {
    const [src, setSrc] = useState('');
    const [altText, setAltText] = useState('');

    const isDisabled = src === '';

    const loadImage = (files: FileList | null) => {
        const reader = new FileReader();
        reader.onload = function () {
            if (typeof reader.result === 'string') {
                setSrc(reader.result);
            }
            return '';
        };
        if (files !== null) {
            reader.readAsDataURL(files[0]);
        }
    }


    return (
        <>
            <div className="flex-col space-y-1">
                <div className="flex items-center">
                    <Label className="w-1/3">Image Upload</Label>
                    <Input
                        type="file"
                        accept="image/*"
                        placeholder="https://source.unsplash.com/random"
                        onChange={(e) => { loadImage(e.target.files) }}
                    />
                </div>
                <div className="flex items-center">
                    <Label className="w-1/3">Alt Text</Label>
                    <Input
                        placeholder="description of image"
                        onChange={(e) => setAltText(e.target.value)}
                        value={altText}
                    />
                </div>
            </div>
            <div className="flex justify-center mt-5">
                <Button
                    type="button"
                    disabled={isDisabled}
                    onClick={() => onClick({ altText, src })}
                >
                    Confirm
                </Button>
            </div>
        </>
    )
}



export default function ImagesPlugin({ captionsEnabled }: {
    captionsEnabled?: boolean;
}) {
    const [editor] = useLexicalComposerContext();

    useEffect(() => {
        if (!editor.hasNodes([ImageNode])) {
            throw new Error('Imagesplugin: ImageNode not registered on editor');
        }

        return mergeRegister(
            editor.registerCommand<InsertImagePayload>(
                INSERT_IMAGE_COMMAND,
                (payload) => {
                    const imageNode = $createImageNode(payload);
                    $insertNodes([imageNode]);
                    if ($isRootOrShadowRoot(imageNode.getParentOrThrow())) {
                        $wrapNodeInElement(imageNode, $createParagraphNode).selectEnd();
                    }
                    return true;
                },
                COMMAND_PRIORITY_EDITOR,
            ),
            editor.registerCommand<DragEvent>(
                DRAGSTART_COMMAND,
                (event) => {
                    return $onDragStart(event);
                },
                COMMAND_PRIORITY_HIGH
            ),
            editor.registerCommand<DragEvent>(
                DRAGOVER_COMMAND,
                (event) => {
                    return $onDragover(event);
                },
                COMMAND_PRIORITY_LOW,
            ),
            editor.registerCommand<DragEvent>(
                DROP_COMMAND,
                (event) => {
                    return $onDrop(event, editor);
                },
                COMMAND_PRIORITY_HIGH
            ),
        );

    }, [captionsEnabled, editor]);
    return null;
}

const TRANSPARENT_IMAGE =
    'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7';
let img: HTMLImageElement;

function getTransparentImg(): HTMLImageElement {
    if (!img && typeof document !== 'undefined') {
        img = document.createElement('img');
        img.src = TRANSPARENT_IMAGE;
    }
    return img;
}

function $onDragStart(event: DragEvent): boolean {
    const node = $getImageNodeInSelection();
    if (!node) {
        return false;
    }
    const dataTransfer = event.dataTransfer;
    if (!dataTransfer) {
        return false;
    }
    dataTransfer.setData('text/plain', '_');
    if (typeof document !== 'undefined') {
        dataTransfer.setDragImage(getTransparentImg(), 0, 0);
    }
    dataTransfer.setData(
        'application/x-lexical-drag',
        JSON.stringify({
            data: {
                altText: node.__altText,
                caption: node.__caption,
                height: node.__height,
                key: node.getKey(),
                maxWidth: node.__maxWidth,
                showCaption: node.__showCaption,
                src: node.__src,
                width: node.__width,
            },
            type: 'image'
        }),
    );
    return true;
}

function $onDragover(event: DragEvent): boolean {
    const node = $getImageNodeInSelection();
    if (!node) {
        return false
    }
    if (!canDropImage(event)) {
        event.preventDefault();
    }
    return true;
}

function $onDrop(event: DragEvent, editor: LexicalEditor): boolean {
    const node = $getImageNodeInSelection();
    if (!node) {
        return false;
    }
    const data = getDragImageData(event);
    if (!data) {
        return false;
    }
    event.preventDefault();
    if (canDropImage(event)) {
        const range = getDragSelection(event);
        node.remove();
        const rangeSelection = $createRangeSelection();
        if (range !== null && range !== undefined) {
            rangeSelection.applyDOMRange(range);
        }
        $setSelection(rangeSelection);
        editor.dispatchCommand(INSERT_IMAGE_COMMAND, data);
    }

    return true;
}


function $getImageNodeInSelection(): ImageNode | null {
    const selection = $getSelection();
    if (!$isNodeSelection(selection)) {
        return null;
    }
    const nodes = selection.getNodes();
    const node = nodes[0];
    return $isImageNode(node) ? node : null;
}



function canDropImage(event: DragEvent): boolean {
    const target = event.target;
    return !!(
        target &&
        target instanceof HTMLElement &&
        !target.closest('code, span.editor.image') &&
        target.parentElement &&
        target.parentElement.closest('div.ContentEditable__root')
    );
}


function getDragImageData(event: DragEvent): null | InsertImagePayload {
    const dragData = event.dataTransfer?.getData('application/x-lexical-drag');
    if (!dragData) {
        return null;
    }

    const { type, data } = JSON.parse(dragData);
    if (type !== 'image') {
        return null;
    }
    return data;
}

declare global {
    interface DragEvent {
        rangeOffSet?: number;
        rangeParent?: Node;
    }
}

function getDragSelection(event: DragEvent): Range | null | undefined {
    let range;
    const target = event.target as null | Element | Document;
    const targetWindow =
        target === null
            ? null
            : target.nodeType === 9
                ? (target as Document).defaultView
                : (target as Element).ownerDocument.defaultView;
    const domSelection = getDOMSelection(targetWindow);
    if (document.caretRangeFromPoint) {
        range = document.caretRangeFromPoint(event.clientX, event.clientY);
    } else if (event.rangeParent && domSelection !== null) {
        domSelection.collapse(event.rangeParent, event.rangeOffSet || 0);
        range = domSelection.getRangeAt(0);
    } else {
        throw Error(`Cannot get the selection when dragging.`)
    }

    return range;
}

const getDOMSelection = (targetWindow: Window | null): Selection | null =>
    CAN_USE_DOM ? (targetWindow || window).getSelection() : null;