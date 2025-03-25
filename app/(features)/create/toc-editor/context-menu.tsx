"use client"

import React, { useEffect, useRef } from "react"
import { createPortal } from "react-dom"
import { useToc } from "./toc-context"
import { Edit, FolderPlus, FilePlus, Trash2, ChevronUp, ChevronDown } from "lucide-react"

export function TocContextMenu() {
    const {
        state,
        closeContextMenu,
        addChild,
        addSiblingBefore,
        addSiblingAfter,
        deleteItem,
        startRenaming,
    } = useToc()

    const { contextMenu, tocTree } = state
    const menuRef = useRef<HTMLDivElement>(null)

    const nodeId = contextMenu.nodeId
    const node = nodeId ? tocTree[nodeId] : null

    useEffect(() => {
        if (!contextMenu.isOpen) return

        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                closeContextMenu()
            }
        }

        document.addEventListener("mousedown", handleClickOutside)
        return () => {
            document.removeEventListener("mousedown", handleClickOutside)
        }
    }, [contextMenu.isOpen, closeContextMenu])

    if (!contextMenu.isOpen || !node) return null

    // Calculate position to be near the selected node
    const adjustPosition = () => {
        const { x, y } = contextMenu.position
        const menuWidth = 200 // Approximate width of menu
        const menuHeight = 200 // Approximate height of menu

        // Ensure menu stays within viewport
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let adjustedX = x
        let adjustedY = y

        if (x + menuWidth > viewportWidth) {
            adjustedX = x - menuWidth
        }

        if (y + menuHeight > viewportHeight) {
            adjustedY = y - menuHeight
        }

        return {
            left: `${adjustedX}px`,
            top: `${adjustedY}px`,
        }
    }

    const handleAddChild = () => {
        addChild(node.id)
        closeContextMenu()
    }

    const handleAddSiblingBefore = () => {
        addSiblingBefore(node.id)
        closeContextMenu()
    }

    const handleAddSiblingAfter = () => {
        addSiblingAfter(node.id)
        closeContextMenu()
    }

    const handleDelete = () => {
        deleteItem(node.id)
        closeContextMenu()
    }

    const handleRename = () => {
        startRenaming(node.id)
        closeContextMenu()
    }

    const menu = (
        <div
            ref={menuRef}
            className="fixed z-50 min-w-[180px] rounded-lg border border-gray-200 bg-white shadow-lg dark:border-gray-800 dark:bg-wash-950 opacity-100"
            style={adjustPosition()}
        >
            <div className="p-1">
                {node.type === "title" && (
                    <>
                        <MenuItem icon={<Edit />} onClick={handleRename}>
                            Rename
                        </MenuItem>
                        <MenuItem icon={<FolderPlus />} onClick={handleAddChild}>
                            Add Chapter
                        </MenuItem>
                    </>
                )}

                {node.type === "chapter" && (
                    <>
                        <MenuItem icon={<Edit />} onClick={handleRename}>
                            Rename
                        </MenuItem>
                        <MenuItem icon={<FilePlus />} onClick={handleAddChild}>
                            Add Lesson
                        </MenuItem>
                        <MenuSeparator />
                        <MenuItem icon={<ChevronUp />} onClick={handleAddSiblingBefore}>
                            Add Chapter Before
                        </MenuItem>
                        <MenuItem icon={<ChevronDown />} onClick={handleAddSiblingAfter}>
                            Add Chapter After
                        </MenuItem>
                        <MenuSeparator />
                        <MenuItem icon={<Trash2 />} onClick={handleDelete} destructive>
                            Delete
                        </MenuItem>
                    </>
                )}

                {node.type === "lesson" && (
                    <>
                        <MenuItem icon={<Edit />} onClick={handleRename}>
                            Rename
                        </MenuItem>
                        <MenuItem icon={<ChevronUp />} onClick={handleAddSiblingBefore}>
                            Add Lesson Before
                        </MenuItem>
                        <MenuItem icon={<ChevronDown />} onClick={handleAddSiblingAfter}>
                            Add Lesson After
                        </MenuItem>
                        <MenuSeparator />
                        <MenuItem icon={<Trash2 />} onClick={handleDelete} destructive>
                            Delete
                        </MenuItem>
                    </>
                )}
            </div>
        </div>
    )

    return createPortal(menu, document.body)
}

type MenuItemProps = {
    icon?: React.ReactNode
    onClick: () => void
    children: React.ReactNode
    destructive?: boolean
}

function MenuItem({ icon, onClick, children, destructive }: MenuItemProps) {
    return (
        <button
            onClick={onClick}
            className={`flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none ${destructive
                ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-950/50"
                : "hover:bg-gray-100 dark:hover:bg-gray-800"
                }`}
        >
            {icon && <span className="mr-2">{icon}</span>}
            {children}
        </button>
    )
}

function MenuSeparator() {
    return <div className="my-1 h-px bg-gray-200 dark:bg-gray-800" />
}
