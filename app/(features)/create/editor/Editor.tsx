'use client';

import { AutoFocusPlugin } from '@lexical/react/LexicalAutoFocusPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { HorizontalRulePlugin } from '@lexical/react/LexicalHorizontalRulePlugin';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { MarkdownShortcutPlugin } from '@lexical/react/LexicalMarkdownShortcutPlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { EditorState } from 'lexical';


import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import defaultEditorNodes from './nodes/defaultEditorNodes';
import theme from './editorTheme';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import ImagesPlugin from './plugins/image/ImagesPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import CollapsiblePlugin from './plugins/collapsible/CollapsiblePlugin';
import { useEffect, useState } from 'react';
import FloatingTextFormatToolbarPlugin from './plugins/floating/FloatingTextFormatToolbarPlugin';
import FloatingLinkEditorPlugin from './plugins/floating/FloatingLinkEditorPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import MCQPlugin from './plugins/mcq/mcqPlugin';
import ActionsPlugin from './plugins/actions/ActionsPlugin';
import { useMobile } from '@/components/hooks/use-mobile';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import EditorStateOnChangePlugin from './plugins/EditorStateOnChangePlugin';
import { SerializedEditorState, SerializedLexicalNode } from 'lexical';
import Reader from '../../learn/components/Reader';

import lexicalStateSample from '../lib/lexical-state-sample.json';
import ToolbarPlugin from './plugins/Toolbar';

export default function Editor() {

    const [editorState, setEditorState] = useState<SerializedEditorState<SerializedLexicalNode> | undefined>();
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
    const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
    const isMobile = useMobile();
    const [activeTab, setActiveTab] = useState('editor');

    // If we're switching from desktop to mobile, set the active tab to editor
    useEffect(() => {
        if (isMobile) {
            setActiveTab('editor');
        }
    }, [isMobile])

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };
    const onEditorStateChange = (editorState: EditorState) => {
        setEditorState(editorState.toJSON());
    };

    const editorContent = (
        <div>
            <ToolbarPlugin />
            <ActionsPlugin />
            <AutoLinkPlugin />
            <RichTextPlugin
                contentEditable={
                    <div className='relative z-0 overflow-auto resize-x'>
                        <div ref={onRef} className=' -z-1 flex-auto relative resize-x'>
                            <ContentEditable className='min-h-[92vh] w-full resize-none pb-[92vh] outline-0' />
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


            {floatingAnchorElem && (
                <>
                    <FloatingLinkEditorPlugin
                        anchorElem={floatingAnchorElem}
                        isLinkEditMode={isLinkEditMode}
                        setIsLinkEditMode={setIsLinkEditMode}
                    />
                    <FloatingTextFormatToolbarPlugin
                        anchorElem={floatingAnchorElem}
                        setIsLinkEditMode={setIsLinkEditMode}
                    />
                </>
            )}
        </div>
    );

    const readerContent = (
        <Reader lexicalEditorState={editorState} />
    )

    return (
        <LexicalComposer initialConfig={initialConfig}>
            {isMobile ? (
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full ">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="editor">Editor</TabsTrigger>
                        <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>
                    <TabsContent value="editor">
                        {editorContent}
                    </TabsContent>
                    <TabsContent value="preview" className="mt-4">
                        {readerContent}
                    </TabsContent>
                </Tabs>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 w-full max-w-(--breakpoint-xl) mx-auto">
                    <div className="w-full px-4 lg:px-6 pb-16 sm:border border-wash-300 dark:border-wash-600 rounded-3xl dark:shadow-none">
                        {editorContent}
                    </div>
                    <div className="w-full px-4 lg:px-6 py-16 sm:border border-wash-300 dark:border-wash-600 rounded-3xl dark:shadow-none">
                        {readerContent}
                    </div>
                </div>
            )

            }
        </LexicalComposer>
    );
}




const initialConfig = {
    editorState: JSON.stringify(lexicalStateSample),
    namespace: "LessonEditor",
    theme,
    nodes: [...defaultEditorNodes],
    onError: (error: any) => {
        console.error(error);
    },
}