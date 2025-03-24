"use client"

import { rootID } from "./toc-context"
import { TocTreeNode } from "./toc-tree-node"
import { TocContextMenu } from "./context-menu"

function TocContent() {
    return (
        <div className="h-full overflow-auto">
            <div className="p-2">
                <TocTreeNode nodeId={rootID} level={0} />
                <TocContextMenu />
            </div>
        </div>
    )
}

export default function TOC() {
    return (
        <TocContent />
    )
}

