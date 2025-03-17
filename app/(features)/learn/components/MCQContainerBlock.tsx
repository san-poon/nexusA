import { useState } from "react";
import { SerializedMCQContainerNode } from "@/app/(features)/create/editor/plugins/mcq/mcqContainerNode";
import { SerializedMCQOptionNode } from "@/app/(features)/create/editor/plugins/mcq/mcqOptionNode";
import { SerializedMCQQuestionNode } from "@/app/(features)/create/editor/plugins/mcq/mcqQuestionNode";
import { SerializedMCQOptionsContainerNode } from "@/app/(features)/create/editor/plugins/mcq/mcqOptionsContainerNode";
import { SerializedExplanationNode } from "@/app/(features)/create/editor/plugins/mcq/explanationNode";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { QuizBlockIcon } from "@/components/icons";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ContentBlock } from "./Reader";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type Status = 'idle' | 'in-progress' | 'submitted';
export default function MCQContainerBlock({ node }: { node: SerializedMCQContainerNode }) {
    const [selectedOptions, setSelectedOptions] = useState<Set<number>>(new Set());
    const [playerStatus, setPlayerStatus] = useState<Status>('idle');

    const questionNode = node.children.find((child) => child.type === 'mcq-question') as unknown as SerializedMCQQuestionNode;
    const optionsContainerNode = node.children.find((child) => child.type === 'mcq-options-container') as unknown as SerializedMCQOptionsContainerNode;
    const explanationNode = node.children.find((child) => child.type === 'explanation') as unknown as SerializedExplanationNode;

    const options = optionsContainerNode?.children as unknown as SerializedMCQOptionNode[];

    const correctAnswerIndices = options.map((option, index) =>
        option.checked ? index : -1
    ).filter((index) => index !== -1);

    const handleOptionChange = (index: number) => {
        const newSelectionOptions = new Set(selectedOptions);
        if (newSelectionOptions.has(index)) {
            newSelectionOptions.delete(index);
        } else {
            newSelectionOptions.add(index);
        }
        setSelectedOptions(newSelectionOptions);
        setPlayerStatus('in-progress');
    }

    const handleSubmit = (e: React.MouseEvent) => {
        e.preventDefault();
        setPlayerStatus('submitted');
    }

    const selectedIndices = Array.from(selectedOptions).sort();
    const correctIndices = correctAnswerIndices.sort();
    const isAnswerCorrect =
        selectedIndices.length === correctIndices.length &&
        selectedIndices.every((value, index) => value === correctIndices[index]);
    const isPlayerInProgress = playerStatus === 'in-progress';
    const isSubmitted = playerStatus === 'submitted';

    return (
        <div className="mt-4 flex justify-center">
            <Card className=" w-full md:w-11/12 bg-teal-50 dark:bg-wash-700 rounded-3xl shadow-2xl dark:shadow-neutral-800">
                <CardHeader className="pb-0">
                    <CardTitle>
                        <div className="flex justify-end">
                            <QuizBlockIcon />
                        </div>
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-2">
                    <div className='flex flex-col items-center text-lg'>
                        <div>
                            {questionNode && <ContentBlock node={questionNode} />}
                        </div>
                        {optionsContainerNode && (
                            <ul className='mt-4'>
                                {options.map((option: SerializedMCQOptionNode, index) => (
                                    <div
                                        key={index}
                                        className={cn(
                                            " overflow-hidden w-96 px-2 py-1 md:p-3 m-2 md:m-4 [&>p]:p-0 [&>p]:m-0 [&>div]:p-0 [&>div]:m-0 border-2 border-neutral-200 dark:border-neutral-800 rounded-xl transition duration-200 ease-in-out transform hover:scale-105 active:scale-95 cursor-pointer",
                                            selectedOptions.has(index) ? 'bg-emerald-200 dark:bg-emerald-800/70' : "",
                                        )}
                                        onClick={() => handleOptionChange(index)}
                                    >
                                        <ContentBlock node={option} />
                                    </div>
                                ))}
                            </ul>
                        )}
                    </div>
                </CardContent>
                <CardFooter className='flex flex-col'>
                    <div className="flex justify-between items-center w-full">
                        <div>
                            {isSubmitted && (
                                isAnswerCorrect
                                    ? <span>Correct!</span>
                                    : <span>Try Again!</span>
                            )}
                        </div>
                        <div>
                            <Button disabled={isSubmitted} onClick={handleSubmit}>Submit</Button>
                        </div>
                    </div>
                    {isSubmitted && (
                        <Accordion type="single" collapsible className='w-full'>
                            <AccordionItem value="explanation">
                                <AccordionTrigger>
                                    Explanation
                                </AccordionTrigger>
                                <AccordionContent>
                                    {explanationNode && <ContentBlock node={explanationNode} />}
                                </AccordionContent>
                            </AccordionItem>
                        </Accordion>
                    )}
                </CardFooter>
            </Card>
        </div>
    );

}