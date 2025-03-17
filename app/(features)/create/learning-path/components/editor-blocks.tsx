import { CompositeBlock, LessonBlock, QuizData } from "../lib/types";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { useRef, useEffect } from "react";
import { cn } from '@/lib/utils';
import { TextareaProps } from "@/components/ui/textarea";
import { BlockIcon, CodeLangSelector } from "./editor-tools";
import { Checkbox } from "@/components/ui/checkbox";
import LessonChain from "./LessonChain";
import { Label } from "@/components/ui/label";
import { AddButton, DeleteButton } from "./tootip-buttons";
import { usePaths, usePathsDispatch } from "./PathsContext";
import { useActivePathDispatch, useActivePathID } from "./ActivePathContext";


export function PathTitle() {
    const paths = usePaths();
    const dispatch = usePathsDispatch();
    const activePathID = useActivePathID();
    const activePathDispatch = useActivePathDispatch();
    const root = paths['ROOT'];
    return (
        <div className="flex items-center">
            <Input
                className={cn("md:w-96",
                    activePathID === root.id && "border-emerald-300 dark:border-emerald-700"
                )}
                type="text"
                placeholder="Learning Path Title"
                value={root.title}
                onClick={() => {
                    activePathDispatch({
                        type: "changed_active_path",
                        nextActivePathID: root.id,
                    });
                }}
                onChange={(e) => {
                    dispatch({
                        type: "changed_path_title",
                        updatedPath: {
                            ...root,
                            title: e.target.value
                        }
                    });
                }}
            />
            <AddButton
                onClick={() => {
                    dispatch({
                        type: 'added_child_path',
                        parentID: root.id,
                    });
                }}
            >
                <p>Add Chapter</p>
            </AddButton>
        </div>
    )
}


export function Path({ path, level }: any) {
    const paths = usePaths();
    const pathsDispatch = usePathsDispatch();
    const activePathID = useActivePathID();
    const activePathDispatch = useActivePathDispatch();
    const maxDepth = 2;
    const canAddChildren = level < maxDepth;
    return (
        <div className={cn(
            "flex items-center rounded-full border border-neutral-300 dark:border-neutral-700",
        )}>
            <DeleteButton
                onClick={() => {
                    activePathDispatch({ // We need to change the active path user deletes the path that is currently active.
                        type: "changed_active_path",
                        nextActivePathID: paths['ROOT'].id,
                    });
                    pathsDispatch({
                        type: 'deleted_path',
                        pathID: path.id,
                    })
                }}
                className="opacity-30 transition-opacity duration-300 hover:opacity-100"
            />
            <Input
                className={cn("md:w-96",
                    activePathID === path.id && "border-emerald-300 dark:border-emerald-700"
                )}
                type="text"
                placeholder={`Level ${level}`}
                value={path.title}
                onClick={() => {
                    activePathDispatch({
                        type: "changed_active_path",
                        nextActivePathID: path.id,
                    });
                }}
                onChange={(e) => {
                    pathsDispatch({
                        type: 'changed_path_title',
                        updatedPath: {
                            ...path,
                            title: e.target.value
                        }
                    });
                }}
            />
            <AddButton
                onClick={() => {
                    pathsDispatch({
                        'type': 'added_child_path',
                        'parentID': path.id,
                    });
                }}
                className={cn(canAddChildren ? "block" : "hidden",)}
            >
                <p>Add lesson</p>
            </AddButton>
        </div>

    )
}




export function Block({ block }: { block: LessonBlock }) {
    const paths = usePaths();
    const activePathID = useActivePathID();
    const lesson = paths[activePathID].lesson;
    switch (block.elementType) {
        case 'text': {
            return (
                <TextBlock blockData={block} placeholder="Text/Markdown..." className="w-full px-2 border-none focus:outline-0 focus-visible:outline-0 dark:focus-visible:outline-0" />
            );
        }
        case 'image': {
            return (
                <div className='flex items-center justify-center p-2'>
                    <img src={block.value} className=" h-auto max-h-fit w-auto" alt='image' />
                </div>
            );
        }
        case 'code': {
            return (
                <div>
                    <div className='text-xs flex items-center justify-end opacity-0 transition-opacity duration-300 group-hover/content:opacity-100 my-0'>
                        <CodeLangSelector blockData={block} />
                    </div>
                    <TextBlock blockData={block} placeholder="Paste your code here..." className="w-full px-2 border-none focus:outline-0 focus-visible:outline-0 dark:focus-visible:outline-0" />
                </div>
            );
        }
        case 'quiz': {
            return (
                <div className="m-1 md:m-2 p-1 md:p-4">
                    <QuizBlock block={block} />
                </div>
            )
        }
        case 'note':
        case 'pitfall':
        case 'recap':
        case 'deep-dive': {
            const compositeBlock: CompositeBlock = block;
            const defaultRootBlock = lesson[compositeBlock.value[0]];
            return (
                <div className="m-1 md:m-2 p-1 md:p-4">
                    <BlockIcon element={compositeBlock.elementType} className="mb-4" />
                    <LessonChain block={defaultRootBlock} />
                </div>
            );
        }
        default: {
            return null;
        }
    }
}
export function TextBlock({ blockData, placeholder, className }: { blockData: LessonBlock, placeholder: string, className?: string }) {
    const dispatch = usePathsDispatch();
    const activePathID = useActivePathID();
    return (
        <DynamicTextarea
            rows={1}
            className={className}
            placeholder={placeholder}
            name={blockData.id}
            value={blockData.value}
            onChange={(e) => {
                dispatch({
                    'type': 'changed_lesson_block',
                    'activePathID': activePathID,
                    'block': {
                        ...blockData,
                        value: e.target.value,
                    }
                })
            }}
        />
    );
}
/*
* A question can contain text and/or code. // Probably 'maths' in the future
* An option's value can only contain text (for now). 
*/
export function QuizBlock({ block }: { block: QuizData }) {
    const activePathID = useActivePathID();
    const paths = usePaths();
    const dispatch = usePathsDispatch();
    const questionIDs = block.value.questionIDs;
    const options = block.value.options;
    const explanationIDs = block.value.explanationIDs;
    return (
        <section>
            <Label>Question</Label>
            {questionIDs.length > 0 && (
                <LessonChain block={paths[activePathID].lesson[questionIDs[0]]} /> //starting with the first id.
            )}

            <Label>Options</Label>
            {options.map((option) => (
                <div key={option.id}>
                    <div className="flex items-center space-x-2 space-y-2">
                        <Checkbox
                            checked={option.isCorrect}
                            onCheckedChange={(checked) => {
                                const updatedOptions = block.value.options.map((choice) => {
                                    if (choice.id === option.id) {
                                        return {
                                            ...choice,
                                            isCorrect: checked,
                                        }
                                    } else return choice;
                                });
                                dispatch({
                                    "type": "changed_lesson_block",
                                    "activePathID": activePathID,
                                    "block": {
                                        ...block,
                                        value: {
                                            ...block.value,
                                            options: [
                                                ...updatedOptions, // Haha, don't forget to spread
                                            ]
                                        }
                                    }
                                });

                            }}
                        />
                        <Input
                            className="w-full md:w-2/3"
                            type="text"
                            value={option.value}
                            onChange={(e) => {
                                const updatedOptions = options.map((choice) => {
                                    if (choice.id === option.id) {
                                        return {
                                            ...choice,
                                            value: e.target.value
                                        }
                                    } else return choice;
                                });
                                dispatch({
                                    "type": "changed_lesson_block",
                                    "activePathID": activePathID,
                                    "block": {
                                        ...block,
                                        value: {
                                            ...block.value,
                                            options: [
                                                ...updatedOptions // Haha.Dont' forget to spread. 
                                            ]
                                        }
                                    }
                                });
                            }}
                        />
                    </div>
                    <div className=" ms-12 md:ms-24">
                        <Label className="text-sm">Feedback:</Label>
                        <DynamicTextarea
                            rows={1}
                            className=""
                            placeholder="Instant feedback..."
                            name={option.id}
                            value={option.feedback}
                            onChange={(e) => {
                                const updatedOptions = options.map((choice) => {
                                    if (choice.id === option.id) {
                                        return {
                                            ...choice,
                                            feedback: e.target.value
                                        }
                                    } else return choice;
                                });
                                dispatch({
                                    'type': 'changed_lesson_block',
                                    'activePathID': activePathID,
                                    'block': {
                                        ...block,
                                        value: {
                                            ...block.value,
                                            options: [
                                                ...updatedOptions,
                                            ]
                                        }
                                    }
                                })
                            }}
                        />
                    </div>
                </div>
            ))}

            <Label>Explanation</Label>
            {explanationIDs.length > 0 && (
                <LessonChain block={paths[activePathID].lesson[explanationIDs[0]]} /> // Starting with the first `id`
            )}
        </section>
    );
}


// A path's `title` data is the Lesson's title.
export function TitleBlock() {
    const dispatch = usePathsDispatch();
    const paths = usePaths();
    const activePathID = useActivePathID();
    return (
        <Input
            className="md:w-96"
            autoFocus
            type="text"
            placeholder="Lesson Title"
            value={paths[activePathID].title}
            onChange={(e) => {
                dispatch({
                    type: 'changed_path_title',
                    updatedPath: {
                        ...paths[activePathID],
                        title: e.target.value,
                    }
                });
            }}
        />
    );
}


export function DynamicTextarea({ className, ...props }: TextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Automatically increase the height with content
    useEffect(() => {
        const adjustHeight = () => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            }
        }
        const currentTextarea = textareaRef.current; // Capture the current value

        currentTextarea?.addEventListener('input', adjustHeight);

        //Initial adjustment
        adjustHeight();
        // Return a cleanup function.
        return () => {
            currentTextarea?.removeEventListener('input', adjustHeight); // Use the captured value
        };
    }, []);

    return (
        <Textarea ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
            className={cn(
                "resize-none overflow-hidden w-full p-4 min-h-16",
                className
            )}
            maxLength={800}
            minLength={1}
            {...props}
        />
    );
}