"use client"

import type React from "react"

import { createContext, useContext, type ReactNode, useCallback } from "react"
import { useImmerReducer } from "use-immer"
import { v4 as uuidv4 } from "uuid"

export type TocItem = {
    id: string
    name: string
    type: "title" | "chapter" | "lesson"
    childIDs: string[]
    parentID: string
    content: string // Serialized Lexical editor state
}

export type TocStructure = {
    [key: string]: TocItem
}

export type ContextMenuState = {
    isOpen: boolean
    position: { x: number; y: number }
    nodeId: string | null
}

type TocState = {
    tocTree: TocStructure
    selectedId: string
    contextMenu: ContextMenuState
    renamingId: string | null
}

type TocAction =
    | { type: "ADD_CHILD"; payload: { parentID: string } }
    | { type: "ADD_SIBLING_BEFORE"; payload: { siblingID: string } }
    | { type: "ADD_SIBLING_AFTER"; payload: { siblingID: string } }
    | { type: "DELETE"; payload: { itemID: string } }
    | { type: "RENAME"; payload: { itemID: string; newName: string } }
    | { type: "SELECT"; payload: { itemID: string } }
    | { type: "OPEN_CONTEXT_MENU"; payload: { position: { x: number; y: number }; nodeId: string } }
    | { type: "CLOSE_CONTEXT_MENU" }
    | { type: "START_RENAMING"; payload: { nodeId: string } }
    | { type: "STOP_RENAMING" }
    | { type: "UPDATE_CONTENT"; payload: { itemID: string; content: string } }

const emptyContent = JSON.stringify({ root: { children: [{ children: [{ detail: 0, format: 0, mode: "normal", style: "", text: "", type: "text", version: 1 }], direction: "ltr", format: "", indent: 0, type: "paragraph", version: 1 }], direction: "ltr", format: "", indent: 0, type: "root", version: 1 } })

export const rootID = "ROOT"
const firstChapterID = uuidv4()
const firstLessonID = uuidv4()

const initialTocTree: TocStructure = {
    [rootID]: {
        id: rootID,
        name: "Course Title",
        type: "title",
        childIDs: [firstChapterID],
        parentID: "",
        content: emptyContent
    },
    [firstChapterID]: {
        id: firstChapterID,
        name: "Chapter 1",
        type: "chapter",
        childIDs: [firstLessonID],
        parentID: rootID,
        content: emptyContent
    },
    [firstLessonID]: {
        id: firstLessonID,
        name: "Lesson 1",
        type: "lesson",
        childIDs: [],
        parentID: firstChapterID,
        content: emptyContent
    },
}

const initialState: TocState = {
    tocTree: initialTocTree,
    selectedId: rootID,
    contextMenu: {
        isOpen: false,
        position: { x: 0, y: 0 },
        nodeId: null,
    },
    renamingId: null,
}

type TocContextType = {
    state: TocState
    dispatch: React.Dispatch<TocAction>
    addChild: (parentID: string) => void
    addSiblingBefore: (siblingID: string) => void
    addSiblingAfter: (siblingID: string) => void
    deleteItem: (itemID: string) => void
    renameItem: (itemID: string, newName: string) => void
    selectItem: (itemID: string) => void
    openContextMenu: (event: React.MouseEvent | React.TouchEvent, nodeId: string) => void
    closeContextMenu: () => void
    startRenaming: (nodeId: string) => void
    stopRenaming: () => void
    updateContent: (itemID: string, content: string) => void
}

const TocContext = createContext<TocContextType | undefined>(undefined)

function tocReducer(draft: TocState, action: TocAction): TocState {
    switch (action.type) {
        case "ADD_CHILD": {
            const { parentID } = action.payload
            const parent = draft.tocTree[parentID]
            const itemType = parent.type === "title" ? "chapter" : "lesson"
            const newChildID = uuidv4()

            draft.tocTree[newChildID] = {
                id: newChildID,
                name: `${itemType === "chapter" ? "Chapter" : "Lesson"}`,
                type: itemType,
                childIDs: [],
                parentID,
                content: emptyContent
            }

            draft.tocTree[parentID].childIDs.push(newChildID)
            draft.renamingId = newChildID
            draft.selectedId = newChildID
            return draft
        }

        case "ADD_SIBLING_BEFORE": {
            const { siblingID } = action.payload
            const sibling = draft.tocTree[siblingID]
            const parentID = sibling.parentID

            const newSiblingID = uuidv4()
            draft.tocTree[newSiblingID] = {
                id: newSiblingID,
                name: `${sibling.type === "chapter" ? "Chapter" : "Lesson"}`,
                type: sibling.type,
                childIDs: [],
                parentID,
                content: emptyContent
            }

            const siblingIndex = draft.tocTree[parentID].childIDs.indexOf(siblingID)
            draft.tocTree[parentID].childIDs.splice(siblingIndex, 0, newSiblingID)
            draft.renamingId = newSiblingID
            draft.selectedId = newSiblingID
            return draft
        }

        case "ADD_SIBLING_AFTER": {
            const { siblingID } = action.payload
            const sibling = draft.tocTree[siblingID]
            const parentID = sibling.parentID

            const newSiblingID = uuidv4()
            draft.tocTree[newSiblingID] = {
                id: newSiblingID,
                name: `${sibling.type === "chapter" ? "Chapter" : "Lesson"}`,
                type: sibling.type,
                childIDs: [],
                parentID,
                content: emptyContent
            }

            const siblingIndex = draft.tocTree[parentID].childIDs.indexOf(siblingID)
            draft.tocTree[parentID].childIDs.splice(siblingIndex + 1, 0, newSiblingID)
            draft.renamingId = newSiblingID
            draft.selectedId = newSiblingID
            return draft
        }

        case "DELETE": {
            const { itemID } = action.payload
            if (itemID === rootID) return draft

            const parentID = draft.tocTree[itemID].parentID
            const parent = draft.tocTree[parentID]
            parent.childIDs = parent.childIDs.filter((id) => id !== itemID)
            delete draft.tocTree[itemID]
            // If the selected item was deleted or is a child of the deleted item,
            // select the parent instead
            if (!draft.tocTree[draft.selectedId]) {
                draft.selectedId = parentID
            }

            return draft
        }

        case "RENAME": {
            const { itemID, newName } = action.payload
            if (newName.trim()) {
                draft.tocTree[itemID].name = newName
            }
            draft.renamingId = null
            return draft
        }

        case "SELECT": {
            draft.selectedId = action.payload.itemID
            return draft
        }

        case "OPEN_CONTEXT_MENU": {
            draft.contextMenu = {
                isOpen: true,
                position: action.payload.position,
                nodeId: action.payload.nodeId,
            }
            draft.selectedId = action.payload.nodeId
            return draft
        }

        case "CLOSE_CONTEXT_MENU": {
            draft.contextMenu = {
                isOpen: false,
                position: { x: 0, y: 0 },
                nodeId: null,
            }
            return draft
        }

        case "START_RENAMING": {
            draft.renamingId = action.payload.nodeId
            return draft
        }

        case "STOP_RENAMING": {
            draft.renamingId = null
            return draft
        }

        case "UPDATE_CONTENT": {
            const { itemID, content } = action.payload
            if (!draft.tocTree[itemID]) return draft // When user deletes the `TocItem`
            draft.tocTree[itemID].content = content
            return draft
        }

        default: {
            return draft
        }
    }
}

export function TocProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useImmerReducer(tocReducer, initialState)

    const addChild = useCallback(
        (parentID: string) => {
            dispatch({ type: "ADD_CHILD", payload: { parentID } })
        },
        [dispatch],
    )

    const addSiblingBefore = useCallback(
        (siblingID: string) => {
            dispatch({ type: "ADD_SIBLING_BEFORE", payload: { siblingID } })
        },
        [dispatch],
    )

    const addSiblingAfter = useCallback(
        (siblingID: string) => {
            dispatch({ type: "ADD_SIBLING_AFTER", payload: { siblingID } })
        },
        [dispatch],
    )

    const deleteItem = useCallback(
        (itemID: string) => {
            dispatch({ type: "DELETE", payload: { itemID } })
        },
        [dispatch],
    )

    const renameItem = useCallback(
        (itemID: string, newName: string) => {
            dispatch({ type: "RENAME", payload: { itemID, newName } })
        },
        [dispatch],
    )

    const selectItem = useCallback(
        (itemID: string) => {
            dispatch({ type: "SELECT", payload: { itemID } })
        },
        [dispatch],
    )

    const openContextMenu = useCallback(
        (event: React.MouseEvent | React.TouchEvent, nodeId: string) => {
            event.preventDefault()
            const x = "touches" in event ? event.touches[0].clientX : event.clientX
            const y = "touches" in event ? event.touches[0].clientY : event.clientY

            dispatch({
                type: "OPEN_CONTEXT_MENU",
                payload: { position: { x, y }, nodeId },
            })
        },
        [dispatch],
    )

    const closeContextMenu = useCallback(() => {
        dispatch({ type: "CLOSE_CONTEXT_MENU" })
    }, [dispatch])

    const startRenaming = useCallback(
        (nodeId: string) => {
            dispatch({ type: "START_RENAMING", payload: { nodeId } })
        },
        [dispatch],
    )

    const stopRenaming = useCallback(() => {
        dispatch({ type: "STOP_RENAMING" })
    }, [dispatch])

    const updateContent = useCallback((itemID: string, content: string) => {
        dispatch({ type: "UPDATE_CONTENT", payload: { itemID, content } })
    }, [dispatch])

    const value = {
        state,
        dispatch,
        addChild,
        addSiblingBefore,
        addSiblingAfter,
        deleteItem,
        renameItem,
        selectItem,
        openContextMenu,
        closeContextMenu,
        startRenaming,
        stopRenaming,
        updateContent
    }

    return <TocContext value={value}>{children}</TocContext>
}

export function useToc() {
    const context = useContext(TocContext)
    if (context === undefined) {
        throw new Error("useToc must be used within a TocProvider")
    }
    return context
}
