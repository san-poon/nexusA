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
import { $createParagraphNode, $createTextNode, $getRoot } from 'lexical';


import ComponentPickerPlugin from './plugins/ComponentPickerPlugin';
import defaultEditorNodes from './nodes/defaultEditorNodes';
import theme from './editorTheme';
import CodeHighlightPlugin from './plugins/CodeHighlightPlugin';
import { $createHeadingNode } from '@lexical/rich-text';
import { $createListItemNode, $createListNode } from '@lexical/list';
import ImagesPlugin from './plugins/ImagesPlugin';
import EquationsPlugin from './plugins/EquationsPlugin';
import CollapsiblePlugin from './plugins/collapsible/CollapsiblePlugin';
import { useState } from 'react';
import FloatingTextFormatToolbarPlugin from './plugins/floating-plugins/FloatingTextFormatToolbarPlugin';
import FloatingLinkEditorPlugin from './plugins/floating-plugins/FloatingLinkEditorPlugin';
import AutoLinkPlugin from './plugins/AutoLinkPlugin';
import MCQPlugin from './plugins/mcq/mcqPlugin';

export default function Editor() {
    const [floatingAnchorElem, setFloatingAnchorElem] = useState<HTMLDivElement | null>(null);
    const [isLinkEditMode, setIsLinkEditMode] = useState<boolean>(false);

    const onRef = (_floatingAnchorElem: HTMLDivElement) => {
        if (_floatingAnchorElem !== null) {
            setFloatingAnchorElem(_floatingAnchorElem);
        }
    };

    return (
        <LexicalComposer initialConfig={initialConfig}>

            <div className='min-h-[92vh] w-full max-w-(--breakpoint-lg) dark:lg:border border-wash-600 rounded-3xl lg:shadow-2xl dark:shadow-none my-4 lg:my-8 p-6 lg:p-12'>
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


        </LexicalComposer>
    );
}




const initialConfig = {
    editorState: $prepopulatedRichText,
    namespace: "LessonEditor",
    theme,
    nodes: [...defaultEditorNodes],
    onError: (error: any) => {
        console.error(error);
    },
}


function $prepopulatedRichText() {
    const root = $getRoot();
    if (root.getFirstChild() === null) {
        const heading = $createHeadingNode('h1');
        heading.append($createTextNode('Crafting a Good Lesson'));
        root.append(heading);

        const paragraph = $createParagraphNode();
        paragraph.append(
            $createTextNode('A good lesson often starts with a captivating introduction. The introduction is where you '),
            $createTextNode('convince learners the ').toggleFormat('italic'),
            $createTextNode('importance ').toggleFormat('bold').toggleFormat('italic'),
            $createTextNode("of the lesson.")
        );
        root.append(paragraph);

        const heading2 = $createHeadingNode('h2');
        heading2.append($createTextNode('You will learn'));
        root.append(heading2);

        const list = $createListNode('bullet');
        list.append(
            $createListItemNode().append(
                $createTextNode('Why and how to structure a lesson')
            ),
            $createListItemNode().append(
                $createTextNode("Why to use different content types")
            ),
            $createListItemNode().append(
                $createTextNode("How to make a lesson engaging")
            ),
        );
        root.append(list);

        const heading3 = $createHeadingNode('h2');
        heading3.append($createTextNode('Lesson Structure'));
        root.append(heading3);

        const paragraph2 = $createParagraphNode();
        paragraph2.append(
            $createTextNode("Structuring lesson well can make a difference between a book that is pleasant to read and re-read, and one that is hard to follow along. A good lesson has simple structure that is consistent with other lessons. A good lesson can have a following structure:"),
        );
        root.append(paragraph2);

        const list2 = $createListNode("number")
        list2.append(
            $createListItemNode().append($createTextNode("Introduction")),
            $createListItemNode().append($createTextNode("Objective (clear & testable)")),
            $createListItemNode().append($createTextNode("Main Content")),
            $createListItemNode().append($createTextNode("Summary")),
            $createListItemNode().append($createTextNode("Exercises"))
        );
        root.append(list2);

    }
}
