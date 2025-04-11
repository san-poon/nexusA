"use client"

import { AutoFocusPlugin } from "@lexical/react/LexicalAutoFocusPlugin"
import { ContentEditable } from "@lexical/react/LexicalContentEditable"
import { HistoryPlugin } from "@lexical/react/LexicalHistoryPlugin"
import { HorizontalRulePlugin } from "@lexical/react/LexicalHorizontalRulePlugin"
import { LexicalComposer } from "@lexical/react/LexicalComposer"
import { LexicalErrorBoundary } from "@lexical/react/LexicalErrorBoundary"
import { LinkPlugin } from "@lexical/react/LexicalLinkPlugin"
import { ListPlugin } from "@lexical/react/LexicalListPlugin"
import { MarkdownShortcutPlugin } from "@lexical/react/LexicalMarkdownShortcutPlugin"
import { RichTextPlugin } from "@lexical/react/LexicalRichTextPlugin"
import { TablePlugin } from "@lexical/react/LexicalTablePlugin"
import type { EditorState } from "lexical"

import ComponentPickerPlugin from "./plugins/ComponentPickerPlugin"
import defaultEditorNodes from "../lib/defaultEditorNodes"
import theme from "./editorTheme"
import CodeHighlightPlugin from "./plugins/CodeHighlightPlugin"
import ImagesPlugin from "./plugins/image/ImagesPlugin"
import EquationsPlugin from "./plugins/equation/EquationsPlugin"
import CollapsiblePlugin from "./plugins/collapsible/CollapsiblePlugin"
import { useState } from "react"
import FloatingTextFormatToolbarPlugin from "./plugins/floating/FloatingTextFormatToolbarPlugin"
import FloatingLinkEditorPlugin from "./plugins/floating/FloatingLinkEditorPlugin"
import AutoLinkPlugin from "./plugins/AutoLinkPlugin"
import MCQPlugin from "./plugins/mcq/mcqPlugin"
import ActionsPlugin from "./plugins/actions/ActionsPlugin"
import EditorStateOnChangePlugin from "./plugins/EditorStateOnChangePlugin"
import ContentReader from "../../learn/components/content-reader"

import { useToc } from "../toc-editor/toc-context"

import ToolbarPlugin from "./plugins/toolbar-plugin"
import { Button } from "@/components/ui/button"
import { BookOpen, PencilIcon } from "lucide-react"
import TableCellResizerPlugin from "./plugins/table/table-cell-resizer/TableCellResizer"
import TableActionMenuPlugin from "./plugins/table/TableActionMenuPlugin"
import TableHoverActionsPlugin from "./plugins/table/TableHoverActionsPlugin"
import { cn } from "@/lib/utils"

export default function ContentEditor() {
    const { state, updateContent } = useToc()
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null)
    const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false)
    const [showContentReader, setShowContentReader] = useState<boolean>(false)

    const selectedItem = state.tocTree[state.selectedId]

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem)
        }
    }

    const onEditorStateChange = (editorState: EditorState) => {
        const serializedState = JSON.stringify(editorState.toJSON())
        updateContent(selectedItem.id, serializedState)
    }

    const initialConfig = {
        editorState: selectedItem.content,
        namespace: "LessonEditor",
        theme,
        nodes: [...defaultEditorNodes],
        onError: (error: any) => {
            console.error(error)
        },
    }

    const editorContent = (
        <div>
            <ToolbarPlugin />
            <ActionsPlugin />
            <AutoLinkPlugin />
            <RichTextPlugin
                contentEditable={
                    <div className="relative py-16 z-0 overflow-auto resize-x">
                        <div ref={onRef} className="-z-1 flex-auto relative resize-x">
                            <ContentEditable className="min-h-[92vh] w-full resize-none pb-[92vh] outline-0" />
                        </div>
                    </div>
                }
                ErrorBoundary={LexicalErrorBoundary}
            />

            <AutoFocusPlugin />
            <CollapsiblePlugin />
            <EditorStateOnChangePlugin onChange={onEditorStateChange} />
            <EquationsPlugin />
            <HistoryPlugin />
            <MarkdownShortcutPlugin />
            <CodeHighlightPlugin />
            <ComponentPickerPlugin />
            <HorizontalRulePlugin />
            <ImagesPlugin />
            <ListPlugin />
            <LinkPlugin />
            <MCQPlugin />
            <TablePlugin />
            <TableCellResizerPlugin />
            <TableActionMenuPlugin />
            <TableHoverActionsPlugin />

            {floatingAnchorElem && (
                <>
                    <FloatingLinkEditorPlugin
                        anchorElem={floatingAnchorElem}
                        isLinkEditMode={isLinkEditMode}
                        setIsLinkEditMode={setIsLinkEditMode}
                    />
                    <FloatingTextFormatToolbarPlugin anchorElem={floatingAnchorElem} setIsLinkEditMode={setIsLinkEditMode} />
                </>
            )}
        </div>
    )

    return (
        <div className="relative">
            <Button
                onClick={() => setShowContentReader(!showContentReader)}
                className={cn(
                    "fixed z-20 bottom-2 left-5/11 w-1/11",
                    "transition-all duration-300 ease-in-out",
                    "shadow-md rounded-full p-3",
                    "hover:shadow-lg hover:scale-105",
                    "border border-gray-200 dark:border-gray-800",
                    "bg-white dark:bg-emerald-800",
                )}
                aria-label={showContentReader ? "Switch to edit mode" : "Switch to read mode"}
            >
                <div
                    className={cn(
                        "transition-all duration-300 ease-in-out",
                        showContentReader ? "rotate-0" : "rotate-180 opacity-0 absolute",
                    )}
                >
                    <BookOpen size={24} aria-hidden="true" />
                </div>
                <div
                    className={cn(
                        "transition-all duration-300 ease-in-out",
                        !showContentReader ? "rotate-0" : "rotate-180 opacity-0 absolute",
                    )}
                >
                    <PencilIcon size={24} aria-hidden="true" />
                </div>
            </Button>
            <LexicalComposer key={selectedItem.id} initialConfig={initialConfig}>
                <div
                    className={cn(
                        "lg:block transition-opacity duration-300 ease-in-out",
                        showContentReader ? "opacity-100" : "opacity-100",
                    )}
                >
                    {showContentReader ? (
                        <ContentReader lexicalEditorState={JSON.parse(selectedItem.content)} className="py-16" />
                    ) : (
                        editorContent
                    )}
                </div>
            </LexicalComposer>
        </div>
    )
}
