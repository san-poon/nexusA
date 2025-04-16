"use client"

import type React from "react"

import { useRef, useEffect, useState } from "react"
import { useToc } from "./toc-context"
import { Input } from "@/components/ui/input"
import { ChevronRight, FileText, FolderOpen, Folder, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils/utils"

const LONG_TAP_DURATION = 500

type TocTreeNodeProps = {
    nodeId: string
    level: number
}

export function TocTreeNode({ nodeId, level }: TocTreeNodeProps) {
    const { state, selectItem, openContextMenu, renameItem, stopRenaming } = useToc()

    const { tocTree, selectedId, renamingId } = state
    const node = tocTree[nodeId]
    const inputRef = useRef<HTMLInputElement>(null)
    const nodeRef = useRef<HTMLDivElement>(null)

    const [isExpanded, setisExpanded] = useState(true)
    const hasChildren = node.childIDs.length > 0
    const isSelected = selectedId === nodeId
    const isRenaming = renamingId === nodeId

    let touchTimer: NodeJS.Timeout

    useEffect(() => {
        if (isRenaming && inputRef.current) {
            inputRef.current.focus()
            inputRef.current.select()
        }
    }, [isRenaming])

    // Scroll selected node into view
    useEffect(() => {
        if (isSelected && nodeRef.current) {
            nodeRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
        }
    }, [isSelected])

    const handleTouchStart = (event: React.TouchEvent) => {
        touchTimer = setTimeout(() => {
            openContextMenu(event, nodeId)
        }, LONG_TAP_DURATION)
    }

    const handleTouchEnd = () => {
        clearTimeout(touchTimer)
    }

    const handleSelect = () => {
        if (!isRenaming) {
            selectItem(nodeId)
        }
    }

    const handleRename = (newName: string) => {
        renameItem(nodeId, newName)
    }

    const toggleExpand = (e: React.MouseEvent) => {
        e.stopPropagation()
        setisExpanded(!isExpanded)
    }

    const getNodeIcon = () => {
        switch (node.type) {
            case "title":
                return <BookOpen className="h-4 w-4 mr-1.5 flex-shrink-0" />
            case "chapter":
                return hasChildren ? (
                    <FolderOpen className="h-4 w-4 mr-1.5 flex-shrink-0" />
                ) : (
                    <Folder className="h-4 w-4 mr-1.5 flex-shrink-0" />
                )
            case "lesson":
                return <FileText className="h-4 w-4 mr-1.5 flex-shrink-0" />
            default:
                return null
        }
    }

    return (
        <div className="select-none">
            <div
                ref={nodeRef}
                onClick={handleSelect}
                onContextMenu={(e) => openContextMenu(e, nodeId)}
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                className={cn(
                    "flex items-center py-1.5 rounded-md transition-colors",
                    "hover:bg-emerald-100 dark:hover:bg-emerald-900",
                    isSelected && !isRenaming && "text-emerald-500 font-medium",
                    "cursor-pointer text-sm",
                )}
                style={{ paddingLeft: `${level * 0.75 + 0.5}rem` }}
            >
                {hasChildren && (
                    <span
                        className={cn("mr-1 text-gray-500 transform transition-transform", isExpanded ? "rotate-90" : "")}
                        onClick={toggleExpand}
                    >
                        <ChevronRight className="h-4 w-4" />
                    </span>
                )}

                {!hasChildren && <span className="w-4 mr-1"></span>}

                {getNodeIcon()}

                {isRenaming ? (
                    <Input
                        ref={inputRef}
                        type="text"
                        defaultValue={node.name}
                        onBlur={(e) => handleRename(e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === "Enter") handleRename(e.currentTarget.value)
                            if (e.key === "Escape") stopRenaming()
                        }}
                        className="h-6 py-0 px-2 text-sm"
                        onClick={(e) => e.stopPropagation()}
                    />
                ) : (
                    <span className="truncate">{node.name}</span>
                )}
            </div>

            {hasChildren && isExpanded && (
                <div>
                    {node.childIDs.map((childId) => (
                        <TocTreeNode key={childId} nodeId={childId} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    )
}

