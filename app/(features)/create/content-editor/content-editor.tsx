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
import defaultEditorNodes from '../lib/defaultEditorNodes';
import theme from './editorTheme';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import ImagesPlugin from './plugins/image/ImagesPlugin';
import EquationsPlugin from './plugins/equation/EquationsPlugin';
import CollapsiblePlugin from './plugins/collapsible/CollapsiblePlugin';
import { useState } from 'react';
import FloatingTextFormatToolbarPlugin from './plugins/floating/FloatingTextFormatToolbarPlugin';
import FloatingLinkEditorPlugin from './plugins/floating/FloatingLinkEditorPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import MCQPlugin from './plugins/mcq/mcqPlugin';
import ActionsPlugin from './plugins/actions/ActionsPlugin';
import EditorStateOnChangePlugin from './plugins/EditorStateOnChangePlugin';
import ContentReader from '../../learn/components/content-reader';

import { useToc } from '../toc-editor/toc-context';

import ToolbarPlugin from './plugins/toolbar-plugin';
import { Button } from '@/components/ui/button';
import { BookOpen, PencilIcon } from 'lucide-react';

export default function ContentEditor() {
    const { state, updateContent } = useToc();
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
    const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);
    const [showContentReader, setShowContentReader] = useState<boolean>(false);

    const selectedItem = state.tocTree[state.selectedId];

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };

    const onEditorStateChange = (editorState: EditorState) => {
        const serializedState = JSON.stringify(editorState.toJSON());
        updateContent(selectedItem.id, serializedState);
    };

    const initialConfig = {
        editorState: selectedItem.content,
        namespace: "LessonEditor",
        theme,
        nodes: [...defaultEditorNodes],
        onError: (error: any) => {
            console.error(error);
        },
    };

    const editorContent = (
        <div>
            <ToolbarPlugin />
            <ActionsPlugin />
            <AutoLinkPlugin />
            <RichTextPlugin
                contentEditable={
                    <div className='relative py-16 z-0 overflow-auto resize-x'>
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

    return (
        <div className="relative">
            <Button
                onClick={() => setShowContentReader(!showContentReader)}
                className="fixed z-20 bottom-2 left-5/11 w-1/11 bg-white dark:bg-emerald-800"
            >
                {showContentReader
                    ? <BookOpen size={24} aria-label='Read' />
                    : <PencilIcon size={24} aria-label='Edit' />}
            </Button>
            <LexicalComposer
                key={selectedItem.id}
                initialConfig={initialConfig}
            >
                <div className="lg:block">
                    {showContentReader
                        ? <ContentReader lexicalEditorState={JSON.parse(selectedItem.content)} className="py-16" />
                        : editorContent}
                </div>
            </LexicalComposer>
        </div>
    );
}