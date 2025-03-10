import { Dispatch, createContext, use } from 'react';
import { useImmerReducer } from 'use-immer';
import { LessonBlock, LessonElements, Path, Paths, PathsAction, CompositeBlock, QuizData, Lesson } from '../lib/types';
import { v4 as uuidv4 } from 'uuid';
import { findAndAddElement, findAndRemoveElement } from '../lib/utils';
import samplePaths from '@/lib/hieararchy-tree-sample-data.json';

export const initialLesson: Lesson = {
    'INTRODUCTION': {
        id: 'INTRODUCTION',
        elementType: 'text',
        value: "",
        prevBlockID: null, // for first node. Lesson title is part of Paths itself
        nextBlockID: 'OBJECTIVE',
        parentBlockID: null,
    },
    'OBJECTIVE': {
        id: 'OBJECTIVE',
        elementType: 'text',
        value: "",
        prevBlockID: 'INTRODUCTION',
        nextBlockID: null, // for last node
        parentBlockID: null,
    },
}
export const initialPaths: Paths = {
    ['ROOT']: {
        id: 'ROOT',
        title: "",
        childIDs: [],
        parentIDs: [],
        lesson: initialLesson,
    },
};

export const PathsContext = createContext<Paths>(initialPaths);
export const PathsDispatchContext = createContext((() => { }) as Dispatch<PathsAction>)

export function PathsProvider({ children }: { children: React.ReactNode }) {
    const [paths, dispatch] = useImmerReducer(pathsReducer, samplePaths as Paths);

    return (
        (<PathsContext value={paths}>
            <PathsDispatchContext value={dispatch}>
                {children}
            </PathsDispatchContext>
        </PathsContext>)
    );
}

export function usePaths() {
    return use(PathsContext);
}
export function usePathsDispatch() {
    return use(PathsDispatchContext);
}

/**
 * 
 * @param paths state draft
 * @param action what happened?
 * @returns updated state
 */
function pathsReducer(paths: Paths, action: PathsAction): Paths {
    switch (action.type) {

        case 'added_child_path': {
            const newChildPath: Path = {
                id: uuidv4(),
                title: "",
                childIDs: [],
                parentIDs: [action.parentID],
                lesson: initialLesson,
            }
            paths[action.parentID].childIDs.push(newChildPath.id); // Update the childIDs of the Parent Path
            paths[newChildPath.id] = newChildPath;
            return paths;
        }

        case 'added_sibling_path': {
            const { siblingID } = action;
            const sibling = paths[siblingID];
            const parentID = sibling.parentIDs[0]; // A hierarchy has always one parent (for now)
            const newPath: Path = {
                id: uuidv4(),
                title: "",
                childIDs: [],
                parentIDs: [parentID],
                lesson: initialLesson,
            };
            const siblingIndex = paths[parentID].childIDs.indexOf(action.siblingID);

            paths[parentID].childIDs.splice(siblingIndex, 0, newPath.id);
            paths[newPath.id] = newPath;
            return paths;
        }

        case 'changed_path_title': {
            const { updatedPath } = action;
            paths[updatedPath.id] = updatedPath;
            return paths;
        }

        case 'deleted_path': {
            const { pathID } = action;
            const parentID = paths[pathID].parentIDs[0];
            const parentPath = paths[parentID];
            const index = parentPath.childIDs.indexOf(pathID);
            parentPath.childIDs.splice(index, 1);
            delete paths[pathID];
            return paths;
        }


        case "added_lesson_block": {
            const { activePathID, elementType, topBlockID, imageSrc } = action;
            const lesson = paths[activePathID].lesson;
            const topBlock = lesson[topBlockID];
            // Root block for every composite block must be initially defined.
            const newBlock = getNewBlock(elementType, topBlock.id, topBlock.nextBlockID, topBlock.parentBlockID, imageSrc);
            if (topBlock.nextBlockID) {
                const bottomBlock = lesson[topBlock.nextBlockID];
                bottomBlock.prevBlockID = newBlock.id;
            }
            topBlock.nextBlockID = newBlock.id;

            // --------------- Addition of new composite block triggered ------------ 
            if (elementType === 'quiz') {
                const quizBlock: QuizData = newBlock;
                const defaultQBlock = getNewBlock('text', null, null, quizBlock.id); // Default question block, parentBlock is newBlock(quiz-block)'s `id`
                const defaultEblock = getNewBlock('text', null, null, quizBlock.id); // Default explanation block
                paths[activePathID].lesson[defaultQBlock.id] = defaultQBlock; // Add block to lesson data. Must be manually deleted if the quiz block is deleted.
                paths[activePathID].lesson[defaultEblock.id] = defaultEblock; // Add default explanation block to lesson data. Must be manually deleted if the quiz block is deleted.
                quizBlock.value.questionIDs.push(defaultQBlock.id);
                quizBlock.value.explanationIDs.push(defaultEblock.id);
            }
            if (
                elementType === 'pitfall'
                || elementType === 'recap'
                || elementType === 'deep-dive'
                || elementType === 'note'
            ) {
                const compositeBlock: CompositeBlock = newBlock;
                const defaultBlock = getNewBlock('text', null, null, compositeBlock.id);
                lesson[defaultBlock.id] = defaultBlock;
                compositeBlock.value.push(defaultBlock.id);
            }

            // ----------- Addition of new block inside composite block triggered -----------
            if (topBlock.parentBlockID) {
                // Find the location of topBlock's 'id' in parentBlock, and add the `id` of the new block just right after it.
                // Finding the location differs according to composite types.
                const parentBlock = lesson[topBlock.parentBlockID];
                if (parentBlock.elementType === 'quiz') {
                    const quizBlock: QuizData = parentBlock;
                    const qIDs = quizBlock.value.questionIDs;
                    const eIDs = quizBlock.value.explanationIDs;
                    const allIDs = [qIDs, eIDs];
                    findAndAddElement(allIDs, topBlock.id, newBlock.id)
                }
                if (
                    parentBlock.elementType === 'pitfall'
                    || parentBlock.elementType === 'deep-dive'
                    || parentBlock.elementType === 'recap'
                    || parentBlock.elementType === 'note'
                ) {
                    const compositeBlock: CompositeBlock = parentBlock;
                    compositeBlock.value.push(newBlock.id);
                }
                //TODO: Logic to add `id` to remaining composite blocks.
            }
            lesson[newBlock.id] = newBlock;
            return paths;
        }

        case 'deleted_lesson_block': {
            const { activePathID, blockID } = action;
            const lesson = paths[activePathID].lesson;
            const block = lesson[blockID];

            // Do not allow the defaultBlock(`prevBlockID: null`) to be deleted.
            if (block.prevBlockID) {
                const topBlock = lesson[block.prevBlockID];
                if (block.nextBlockID) {
                    const bottomBlock = lesson[block.nextBlockID];
                    topBlock.nextBlockID = block.nextBlockID;
                    bottomBlock.prevBlockID = block.prevBlockID;
                } else {
                    topBlock.nextBlockID = null;
                }

                // ------ Deletion of composite block trirggered --------
                if (block.elementType === 'quiz') {
                    const quizBlock: QuizData = block;
                    const qIDs = quizBlock.value.questionIDs;
                    const eIDs = quizBlock.value.explanationIDs;
                    for (let id of qIDs) {
                        delete lesson[id];
                    }
                    for (let id of eIDs) {
                        delete lesson[id];
                    }
                }
                if (
                    block.elementType === 'pitfall'
                    || block.elementType === 'recap'
                    || block.elementType === 'deep-dive'
                    || block.elementType === 'note'
                ) {
                    const compositeBlock: CompositeBlock = block;
                    for (let id of compositeBlock.value) {
                        delete lesson[id];
                    }
                }

                // ---------- Deletion of a block inside composite block triggered ------------
                if (block.parentBlockID) {
                    const parentBlock = lesson[block.parentBlockID];
                    if (parentBlock.elementType === 'quiz') {
                        const quizBlock: QuizData = parentBlock;
                        const qIDs = quizBlock.value.questionIDs;
                        const eIDs = quizBlock.value.explanationIDs;
                        const options = quizBlock.value.options;
                        const allIDs = [qIDs, eIDs];
                        findAndRemoveElement(allIDs, block.id);
                    }
                    if (
                        parentBlock.elementType === 'pitfall'
                        || block.elementType === 'recap'
                        || block.elementType === 'deep-dive'
                        || block.elementType === 'note'
                    ) {
                        const compositeBlock: CompositeBlock = parentBlock;
                        findAndRemoveElement([compositeBlock.value], block.id);
                    }
                    //TODO: implement logic to remove `id` from other composite elements.
                }

                delete lesson[blockID];
                return paths;
            }
            return paths; // In rare cases, if deletion of default block is triggered.
        }


        case 'changed_lesson_block': {
            const { activePathID, block } = action;
            paths[activePathID].lesson[block.id] = block;
            return paths;
        }

        default: {
            return paths;
        }
    }
}


function getNewBlock(
    element: LessonElements,
    prevBlockID: LessonBlock['prevBlockID'],
    nextBlockID: LessonBlock['nextBlockID'],
    parentBlockID: string | null,
    imageSrc?: string
): LessonBlock {
    switch (element) {
        case 'text': return {
            id: uuidv4(),
            elementType: 'text',
            value: "",
            prevBlockID,
            nextBlockID,
            parentBlockID,
        }
        case 'code': {
            return {
                id: uuidv4(),
                elementType: 'code',
                value: {
                    lang: 'javascript',
                    code: '',
                },
                prevBlockID,
                nextBlockID,
                parentBlockID,
            };
        }
        case 'image': {
            return {
                id: uuidv4(),
                elementType: 'image',
                value: imageSrc,
                prevBlockID,
                nextBlockID,
                parentBlockID,
            };
        }
        case 'quiz': {
            return {
                id: uuidv4(),
                elementType: 'quiz',
                value: {
                    questionIDs: [],
                    options: [
                        { id: uuidv4(), value: '', isCorrect: false, feedbackIDs: '' },
                        { id: uuidv4(), value: '', isCorrect: false, feedbackIDs: '' },
                        { id: uuidv4(), value: '', isCorrect: false, feedbackIDs: '' },
                        { id: uuidv4(), value: '', isCorrect: false, feedbackIDs: '' },
                    ],
                    explanationIDs: [],
                },
                prevBlockID,
                nextBlockID,
                parentBlockID,
            };
        }
        case 'note': {
            return {
                id: uuidv4(),
                elementType: 'note',
                value: [],
                prevBlockID,
                nextBlockID,
                parentBlockID,
            }
        }
        case 'deep-dive': {
            return {
                id: uuidv4(),
                elementType: 'deep-dive',
                value: [],
                prevBlockID,
                nextBlockID,
                parentBlockID,
            }
        }
        case 'pitfall': {
            return {
                id: uuidv4(),
                elementType: 'pitfall',
                value: [],
                prevBlockID,
                nextBlockID,
                parentBlockID,
            }
        }
        case 'recap': {
            return {
                id: uuidv4(),
                elementType: 'recap',
                value: [],
                prevBlockID,
                nextBlockID,
                parentBlockID,
            }
        }
        default: {
            throw new Error('Not a valid element of a lesson ' + element);
        }
    }
}