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
import { EditorState, ParagraphNode } from "lexical"
import { v4 as uuidv4 } from 'uuid'

import ComponentPickerPlugin from "@/core/lexical-editor/plugins/ComponentPickerPlugin"
import defaultEditorNodes from "@/core/lexical-editor/nodes/defaultEditorNodes"
import theme from "@/core/lexical-editor/editorTheme"
import CodeHighlightPlugin from "@/core/lexical-editor/plugins/CodeHighlightPlugin"
import ImagesPlugin from "@/core/lexical-editor/plugins/image/ImagesPlugin"
import EquationsPlugin from "@/core/lexical-editor/plugins/equation/EquationsPlugin"
import CollapsiblePlugin from "@/core/lexical-editor/plugins/collapsible/CollapsiblePlugin"
import { useState } from "react"
import FloatingTextFormatToolbarPlugin from "@/core/lexical-editor/plugins/floating/FloatingTextFormatToolbarPlugin"
import FloatingLinkEditorPlugin from "@/core/lexical-editor/plugins/floating/FloatingLinkEditorPlugin"
import AutoLinkPlugin from "@/core/lexical-editor/plugins/AutoLinkPlugin"
import MCQPlugin from "@/core/lexical-editor/plugins/mcq/mcqPlugin"
import ActionsPlugin from "@/core/lexical-editor/plugins/actions/ActionsPlugin"
import EditorStateOnChangePlugin from "@/core/lexical-editor/plugins/EditorStateOnChangePlugin"
import ContentReader from "@/app/(features)/learn/[course-id]/content-reader"

import { useToc } from "@/components/features/toc-editor/toc-context"

import ToolbarPlugin from "@/core/lexical-editor/plugins/toolbar-plugin"
import { Button } from "@/components/ui/button"
import { BookOpen, PencilIcon } from "lucide-react"
import TableCellResizerPlugin from "@/core/lexical-editor/plugins/table/table-cell-resizer/TableCellResizer"
import TableActionMenuPlugin from "@/core/lexical-editor/plugins/table/TableActionMenuPlugin"
import TableHoverActionsPlugin from "@/core/lexical-editor/plugins/table/TableHoverActionsPlugin"
import { cn } from "@/lib/utils/utils"
import {
    TrackedParagraphNode,
    TrackedHeadingNode,
    TrackedQuoteNode,
    TrackedListNode,
    TrackedListItemNode,
    TrackedCodeNode,
    TrackedHorizontalRuleNode,
    TrackedTableNode
} from '@/core/lexical-editor/nodes/trackedNodes';

import { HeadingNode, QuoteNode } from '@lexical/rich-text'
import { ListNode, ListItemNode } from '@lexical/list'
import { CodeNode } from '@lexical/code'
import { HorizontalRuleNode } from '@lexical/react/LexicalHorizontalRuleNode'
import { TableNode } from '@lexical/table'


const replacementConfigs = [
    {
        replace: ParagraphNode,
        with: (node: ParagraphNode) => {
            return new TrackedParagraphNode(uuidv4())
        },
        withKlass: TrackedParagraphNode,
    },
    {
        replace: HeadingNode,
        with: (node: HeadingNode) => {
            return new TrackedHeadingNode(node.getTag(), uuidv4());
        },
        withKlass: TrackedHeadingNode,
    },
    {
        replace: QuoteNode,
        with: (node: QuoteNode) => {
            return new TrackedQuoteNode(uuidv4())
        },
        withKlass: TrackedQuoteNode,
    },
    {
        replace: ListNode,
        with: (node: ListNode) => {
            return new TrackedListNode(node.getListType(), node.getStart(), uuidv4())
        },
        withKlass: TrackedListNode,
    },
    {
        replace: ListItemNode,
        with: (node: ListItemNode) => {
            return new TrackedListItemNode(node.getValue(), node.getChecked(), uuidv4())
        },
        withKlass: TrackedListItemNode,
    },
    {
        replace: CodeNode,
        with: (node: CodeNode) => {
            return new TrackedCodeNode(uuidv4())
        },
        withKlass: TrackedCodeNode,
    },
    {
        replace: HorizontalRuleNode,
        with: (node: HorizontalRuleNode) => {
            return new TrackedHorizontalRuleNode(uuidv4())
        },
        withKlass: TrackedHorizontalRuleNode,
    },
    {
        replace: TableNode,
        with: (node: TableNode) => {
            return new TrackedTableNode(uuidv4())
        },
        withKlass: TrackedTableNode,
    }
]

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
        const editorStateJson = editorState.toJSON()
        const serializedState = JSON.stringify(editorStateJson)
        updateContent(selectedItem.id, serializedState)
    }

    const allNodes = [
        ...defaultEditorNodes,
        TrackedParagraphNode,
        TrackedHeadingNode,
        TrackedQuoteNode,
        TrackedListNode,
        TrackedListItemNode,
        TrackedCodeNode,
        TrackedHorizontalRuleNode,
        TrackedTableNode,
        ...replacementConfigs,
    ]

    const initialConfig = {
        editorState: selectedItem.content,
        namespace: "LessonEditor",
        theme,
        nodes: allNodes,
        onError: (error: any) => {
            console.error("Lexical Editor Error:", error)
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
