import { cn } from "@/lib/utils";
import { SerializedListItemNode, SerializedListNode } from "@lexical/list";
import { SerializedHeadingNode } from "@lexical/rich-text";
import { SerializedEditorState, SerializedLexicalNode, SerializedParagraphNode, SerializedRootNode, SerializedTextNode } from "lexical";
import { SerializedImageNode } from "@/app/(features)/create/editor/plugins/image/ImageNode";
import { SerializedHorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { SerializedCollapsibleContainerNode } from "@/app/(features)/create/editor/plugins/collapsible/CollapsibleContainerNode";
import { SerializedCollapsibleTitleNode } from "@/app/(features)/create/editor/plugins/collapsible/CollapsibleTitleNode";
import { SerializedCollapsibleContentNode } from "@/app/(features)/create/editor/plugins/collapsible/CollapsibleContentNode";
import Image from "next/image";

import "@/app/(features)/create/editor/plugins/collapsible/Collapsible.css";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MCQContainerBlock from "./MCQContainerBlock";
import { SerializedMCQContainerNode } from "@/app/(features)/create/editor/plugins/mcq/mcqContainerNode";
import { SerializedMCQQuestionNode } from "@/app/(features)/create/editor/plugins/mcq/mcqQuestionNode";
import { SerializedMCQOptionsContainerNode } from "@/app/(features)/create/editor/plugins/mcq/mcqOptionsContainerNode";
import { SerializedMCQOptionNode } from "@/app/(features)/create/editor/plugins/mcq/mcqOptionNode";
import { SerializedExplanationNode } from "@/app/(features)/create/editor/plugins/mcq/explanationNode";


interface ReaderProps {
    lexicalEditorState: SerializedEditorState<SerializedLexicalNode> | undefined;
    className?: string;
}
export default function Reader({ lexicalEditorState, className = "" }: ReaderProps) {
    let parsedState: any = null;
    if (lexicalEditorState) {
        try {
            parsedState = typeof lexicalEditorState === 'string' ? JSON.parse(lexicalEditorState) : lexicalEditorState;
        } catch (e) {
            console.error('Error parsing editor state', e);
        }
    }

    if (!parsedState || !parsedState.root) {
        return <div className="text-red-500 text-2xl">Invalid editor state</div>

    }
    return (
        <div className={cn(" leading-relaxed", className)}>
            <ContentBlock node={parsedState.root} />
        </div>
    );
}

export function ContentBlock({ node }: { node: SerializedLexicalNode }) {
    if (!node || !node.type) {
        return null;
    }

    switch (node.type) {
        case 'text':
            return <Text node={node as SerializedTextNode} />;
        case 'paragraph':
            return <Paragraph node={node as SerializedParagraphNode} />;
        case 'heading':
            return <Heading node={node as SerializedHeadingNode} />;
        case 'list':
            return <ListBlock node={node as SerializedListNode} />;
        case 'listitem':
            return <ListItem node={node as SerializedListItemNode} />;
        case 'image':
            return <ImageBlock node={node as SerializedImageNode} />;
        case 'horizontalrule':
            return <HorizontalRuleBlock node={node as SerializedHorizontalRuleNode} />;
        case 'collapsible-container':
            return <CollapsibleContainerBlock node={node as SerializedCollapsibleContainerNode} />;
        case 'collapsible-title':
            return <CollapsibleTitleBlock node={node as SerializedCollapsibleTitleNode} />;
        case 'collapsible-content':
            return <CollapsibleContentBlock node={node as SerializedCollapsibleContentNode} />;
        case "mcq-container":
            return <MCQContainerBlock node={node as SerializedMCQContainerNode} />;
        case "mcq-question":
            return <MCQQuestionBlock node={node as SerializedMCQQuestionNode} />;
        case "mcq-options-container":
            return (
                <MCQOptionsContainerBlock
                    node={node as SerializedMCQOptionsContainerNode}
                />
            );
        case "mcq-option":
            return <MCQOptionBlock node={node as SerializedMCQOptionNode} />;
        case "explanation":
            return <ExplanationBlock node={node as SerializedExplanationNode} />;


        case 'root': // Root just render its children
            return <Root node={node as SerializedRootNode} />;
        default:
            if (process.env.NODE_ENV !== 'production') {
                console.warn(`Unknown node type: ${node.type}`);
            }
            return null;
    }
}

export function Children({ children }: { children: SerializedLexicalNode[] }) {
    if (!children) return null;
    return children.map((child, index) => {
        const key = child.type + index;
        return <ContentBlock key={key} node={child} />
    });
}

export function ImageBlock({ node }: { node: SerializedImageNode }) {
    return (
        <span>
            <img
                src={node.src}
                alt={node.altText}
                height={node.height}
                width={node.width}
                className="max-w-full min-w-1 inline my-1 md:my-2 lg:my-4"
            />
        </span>
    );
}

export function HorizontalRuleBlock({ node }: { node: SerializedHorizontalRuleNode }) {
    return <hr className="my-4 border-1 border-wash-300 dark:border-wash-600" />;
}

export function CollapsibleContainerBlock({ node }: { node: SerializedCollapsibleContainerNode }) {
    const titleNode = node.children.find((child) => child.type === 'collapsible-title');
    const contentNode = node.children.find((child) => child.type === 'collapsible-content');
    return (
        <Accordion type="single" collapsible className='w-full bg-wash-100 dark:bg-wash-700 rounded-3xl p-2 lg:p-6'>
            <AccordionItem value="details">
                <div className="pb-6">
                    <h3 className="text-xl font-medium mt-2">
                        <ContentBlock node={titleNode as SerializedCollapsibleTitleNode} />
                    </h3>
                    <div className="flex justify-center pb-2 ">
                        <AccordionTrigger className="text-sm hover:no-underline dark:bg-emerald-800 bg-emerald-100 rounded-full px-6 py-2 w-auto inline-flex">
                            Show Details
                        </AccordionTrigger>
                    </div>
                </div>
                <AccordionContent className="pt-8 text-base border-t-2 border-wash-300 dark:border-wash-600">
                    <ContentBlock node={contentNode as SerializedCollapsibleContentNode} />
                </AccordionContent>
            </AccordionItem>
        </Accordion>
    );
}

export function CollapsibleTitleBlock({ node }: { node: SerializedCollapsibleTitleNode }) {
    return (
        <Children children={node.children} />
    );
}

export function CollapsibleContentBlock({ node }: { node: SerializedCollapsibleContentNode }) {
    return (
        <div className="Collapsible__content">
            <Children children={node.children} />
        </div>
    );
}
export function MCQQuestionBlock({
    node,
}: {
    node: SerializedMCQQuestionNode;
}) {
    return <div><Children children={node.children} /></div>;
}

export function MCQOptionsContainerBlock({
    node,
}: {
    node: SerializedMCQOptionsContainerNode;
}) {
    return <Children children={node.children} />;
}

export function MCQOptionBlock({
    node,
}: {
    node: SerializedMCQOptionNode;
}) {
    return <Children children={node.children} />;
}

export function ExplanationBlock({
    node,
}: {
    node: SerializedExplanationNode;
}) {
    return <Children children={node.children} />;
}


export function Root({ node }: { node: SerializedRootNode }) {
    return <Children children={node.children} />;
}

export function ListBlock({ node }: { node: SerializedListNode }) {
    const Tag = node.listType === 'bullet' ? 'ul' : 'ol'; // currently supports listype "bullet" and "number" but not checked list.
    const className = node.listType === 'bullet' ? "list-disc" : "list-decimal";
    return (
        <Tag className={cn("leading-8 list-inside marker:text-neutral-700 dark:marker:text-neutral-300", className)}>
            <Children children={node.children} />
        </Tag>
    );
}

export function ListItem({ node }: { node: SerializedListItemNode }) {
    return (
        <li className="my-0 ps-1 lg:ps-6">
            <Children children={node.children} />
        </li>
    );
}


//whitespace-pre-wrap preserves whitespace
// min-h-8 preserves empty paragraph from collapsing.
export function Paragraph({ node }: { node: SerializedParagraphNode }) {
    return (
        <p className="leading-8 my-4 whitespace-pre-wrap min-h-8">
            <Children children={node.children} />
        </p>
    );
}

export function Heading({ node }: { node: SerializedHeadingNode }) {
    const Tag = node.tag || 'h4'; // Default to h4
    let className = "";
    switch (Tag) {
        case 'h1': className = "text-4xl font-medium mt-6 mb-4 tracking-tight"; break;
        case 'h2': className = "text-3xl font-medium mt-5 mb-3 tracking-tight"; break;
        case 'h3': className = "text-2xl font-medium mt-4 mb-2 tracking-tight"; break;
        case 'h4': className = "text-xl font-medium mt-3 mb-2"; break;
        case 'h5': className = "text-lg font-medium mt-2 mb-1"; break;
        case 'h6': className = "text-base font-medium mt-1 mb-0.5"; break;
        default: className = "text-xl font-medium mt-3 mb-2"; break;
    }
    return (
        <Tag className={className}>
            <Children children={node.children} />
        </Tag>
    );
}

export function Text({ node }: { node: SerializedTextNode }) {

    let content = node.text;
    let className = "";
    if (node.format) {
        let formats = node.format;
        for (const format in formatClassMap) {
            if ((formats & parseInt(format)) === parseInt(format)) {
                className += formatClassMap[format] + " ";
            }
        }
    }

    return <span className={className}>
        {content}
    </span>
}

const FORMAT_BOLD = 1;
const FORMAT_ITALIC = 2;
const FORMAT_UNDERLINE = 8;
const FORMAT_STRIKETHROUGH = 4;
const FORMAT_SUPERSCRIPT = 64;
const FORMAT_SUBSCRIPT = 32;
const FORMAT_CODE = 16;

const formatClassMap: Record<number, string> = {
    [FORMAT_BOLD]: 'font-bold',
    [FORMAT_ITALIC]: 'italic',
    [FORMAT_UNDERLINE]: 'underline',
    [FORMAT_STRIKETHROUGH]: 'line-through',
    [FORMAT_SUPERSCRIPT]: 'align-super',
    [FORMAT_SUBSCRIPT]: 'align-sub',
    [FORMAT_CODE]: 'font-mono bg-wash-300 dark:bg-wash-600 text-wash-900 dark:text-wash-100 p-1 rounded-sm',
};