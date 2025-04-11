import { cn } from "@/lib/utils";
import { SerializedListItemNode, SerializedListNode } from "@lexical/list";
import { SerializedHeadingNode } from "@lexical/rich-text";
import { SerializedEditorState, SerializedLexicalNode, SerializedParagraphNode, SerializedRootNode, SerializedTextNode } from "lexical";
import { SerializedImageNode } from "@/app/(features)/contribute/content-editor/plugins/image/ImageNode";
import { SerializedHorizontalRuleNode } from "@lexical/react/LexicalHorizontalRuleNode";
import { SerializedCollapsibleContainerNode } from "@/app/(features)/contribute/content-editor/plugins/collapsible/CollapsibleContainerNode";
import { SerializedCollapsibleTitleNode } from "@/app/(features)/contribute/content-editor/plugins/collapsible/CollapsibleTitleNode";
import { SerializedCollapsibleContentNode } from "@/app/(features)/contribute/content-editor/plugins/collapsible/CollapsibleContentNode";

import "@/app/(features)/contribute/content-editor/plugins/collapsible/Collapsible.css";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import MCQContainerBlock from "./MCQContainerBlock";
import { SerializedMCQContainerNode } from "@/app/(features)/contribute/content-editor/plugins/mcq/mcqContainerNode";
import { SerializedMCQQuestionNode } from "@/app/(features)/contribute/content-editor/plugins/mcq/mcqQuestionNode";
import { SerializedMCQOptionsContainerNode } from "@/app/(features)/contribute/content-editor/plugins/mcq/mcqOptionsContainerNode";
import { SerializedMCQOptionNode } from "@/app/(features)/contribute/content-editor/plugins/mcq/mcqOptionNode";
import { SerializedExplanationNode } from "@/app/(features)/contribute/content-editor/plugins/mcq/explanationNode";
import { SerializedEquationNode } from "@/app/(features)/contribute/content-editor/plugins/equation/EquationNode";
import KatexRenderer from "@/app/(features)/contribute/content-editor/plugins/equation/KatexRenderer";
import { CodeHighlightNode, SerializedCodeNode } from "@lexical/code";
import { CODE_HIGHLIGHT_THEME_CLASSES } from "../../contribute/content-editor/editorTheme";
import { SerializedLinkNode } from "@lexical/link";


interface ReaderProps {
    lexicalEditorState: SerializedEditorState<SerializedLexicalNode> | undefined;
    className?: string;
}
export default function ContentReader({ lexicalEditorState, className = "" }: ReaderProps) {
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
        <div className={cn("", className)}>
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
        case 'code':
            return <CodeBlock node={node as SerializedCodeNode} />

        case 'link':
            return <LinkBlock node={node as SerializedLinkNode} />;
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
        case 'equation':
            return <EquationBlock node={node as SerializedEquationNode} />;
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

export function Children({ nodes }: { nodes: SerializedLexicalNode[] }) {
    if (!nodes) return null;
    return nodes.map((child, index) => {
        const key = child.type + index;
        return <ContentBlock key={key} node={child} />
    });
}

export function LinkBlock({ node }: { node: SerializedLinkNode }) {
    if (!node.url || !node.children) return null;
    return (
        <a
            href={node.url}
            target="_blank"
            rel={node.rel || 'noopener noreferrer'}
            className="no-underline hover:underline underline-offset-4 text-cyan-600 dark:text-cyan-200 transition-colors cursor-pointer"
        >
            <Children nodes={node.children} />
        </a>
    )
}


export function ImageBlock({ node }: { node: SerializedImageNode }) {
    return (
        <img
            src={node.src}
            alt={node.altText}
            height={node.height}
            width={node.width}
            className="max-w-full min-w-1 inline"
        />
    );
}

export function EquationBlock({ node }: {
    node: SerializedEquationNode;
}) {
    return <KatexRenderer equation={node.equation} inline={node.inline} onDoubleClick={() => null} />;
}
export function HorizontalRuleBlock({ node }: { node: SerializedHorizontalRuleNode }) {
    return <hr className="my-4 border-1 border-wash-300 dark:border-wash-600" />;
}

export function CollapsibleContainerBlock({ node }: { node: SerializedCollapsibleContainerNode }) {
    const titleNode = node.children.find((child) => child.type === 'collapsible-title');
    const contentNode = node.children.find((child) => child.type === 'collapsible-content');
    return (
        <Accordion type="single" collapsible className='w-full bg-wash-100 dark:bg-wash-700 dark:text-neutral-200 rounded-3xl p-2 lg:p-6'>
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
        <Children nodes={node.children} />
    );
}

export function CollapsibleContentBlock({ node }: { node: SerializedCollapsibleContentNode }) {
    return (
        <div className="Collapsible__content">
            <Children nodes={node.children} />
        </div>
    );
}
export function MCQQuestionBlock({
    node,
}: {
    node: SerializedMCQQuestionNode;
}) {
    return <div><Children nodes={node.children} /></div>;
}

export function MCQOptionsContainerBlock({
    node,
}: {
    node: SerializedMCQOptionsContainerNode;
}) {
    return <Children nodes={node.children} />;
}

export function MCQOptionBlock({
    node,
}: {
    node: SerializedMCQOptionNode;
}) {
    return <Children nodes={node.children} />;
}

export function ExplanationBlock({
    node,
}: {
    node: SerializedExplanationNode;
}) {
    return <Children nodes={node.children} />;
}


export function Root({ node }: { node: SerializedRootNode }) {
    return <Children nodes={node.children} />;
}

export function ListBlock({ node }: { node: SerializedListNode }) {
    const Tag = node.listType === 'bullet' ? 'ul' : 'ol'; // currently supports listype "bullet" and "number" but not checked list.
    const className = node.listType === 'bullet' ? "list-disc" : "list-decimal";
    return (
        <Tag className={cn("leading-8 list-inside marker:text-neutral-500", className)}>
            <Children nodes={node.children} />
        </Tag>
    );
}

export function ListItem({ node }: { node: SerializedListItemNode }) {
    return (
        <li className="my-0 ps-1 lg:ps-6">
            <Children nodes={node.children} />
        </li>
    );
}


//whitespace-pre-wrap preserves whitespace
// min-h-8 preserves empty paragraph from collapsing.
export function Paragraph({ node }: { node: SerializedParagraphNode }) {
    return (
        <p className="min-h-8 whitespace-pre-wrap text-justify my-2 lg:my-3">
            <Children nodes={node.children} />
        </p>
    );
}

export function Heading({ node }: { node: SerializedHeadingNode }) {
    const Tag = node.tag || 'h4'; // Default to h4
    let className = "";
    switch (Tag) {
        case 'h1': className = "text-4xl mt-0 mb-4 tracking-tight"; break;
        case 'h2': className = "text-2xl mt-6 mb-3 tracking-tight"; break;
        case 'h3': className = "text-xl mt-6 mb-2 tracking-tight"; break;
        case 'h4': className = "text-lg mt-5 mb-2"; break;
        case 'h5': className = "text-base mt-5 mb-1"; break;
        case 'h6': className = "text-base mt-4 mb-0.5"; break;
        default: className = "text-lg mt-5 mb-2"; break;
    }
    return (
        <Tag className={className}>
            <Children nodes={node.children} />
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
    [FORMAT_BOLD]: 'font-bold dark:opacity-90',
    [FORMAT_ITALIC]: 'italic',
    [FORMAT_UNDERLINE]: 'underline underline-offset-4',
    [FORMAT_STRIKETHROUGH]: 'line-through text-wash-500',
    [FORMAT_SUPERSCRIPT]: 'text-[0.8em] align-super !important',
    [FORMAT_SUBSCRIPT]: 'text-[0.8em] align-sub !important',
    [FORMAT_CODE]: 'font-mono bg-wash-80 dark:bg-wash-720 px-2 py-0.5 rounded-sm text-sm',
};

export function CodeBlock({ node }: { node: SerializedCodeNode }) {
    const children = node.children;

    // Process children into an array of lines
    const lines = [];
    let currentLine: SerializedLexicalNode[] = [];

    children.forEach((child) => {
        if (child.type === 'code-highlight') {
            // Add code-highlight to the current line
            currentLine.push(child);
        }
        else if (child.type === 'linebreak') {
            // On linebreak, add the current line to the lines array
            lines.push(currentLine);
            currentLine = [];
        }
    });

    // Add the last line if it contains any tokens
    if (currentLine.length > 0) {
        lines.push(currentLine);
    }

    return (
        <div className="block max-h-svh overflow-y-auto rounded-xl shadow-xl dark:bg-neutral-900 overflow-x-auto text-sm text-left font-mono">
            {lines.map((line, index) => (
                <div
                    key={index}
                    className="flex items-center">
                    <div className="px-3 py-1 text-gray-500 select-none">
                        {index + 1}
                    </div>
                    <div className="whitespace-pre-wrap">
                        {line.map((token, idx) => {
                            const classNames = 'highlightType' in token
                                ? CODE_HIGHLIGHT_THEME_CLASSES[token.highlightType as keyof typeof CODE_HIGHLIGHT_THEME_CLASSES]
                                : '';
                            return (
                                <span key={idx}
                                    className={classNames}
                                >
                                    {(token as SerializedTextNode).text}
                                </span>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}