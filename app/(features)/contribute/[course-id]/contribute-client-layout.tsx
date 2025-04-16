"use client"

import { useState } from "react"
import { cn } from "@/lib/utils/utils"
import { Button } from "@/components/ui/button"
import { MenuIcon } from "@/components/ui/icons"
import TocEditor from "../../../../components/features/toc-editor/toc-editor"
import { TocProvider } from "../../../../components/features/toc-editor/toc-context"
import ContentEditor from "./content-editor"

export default function ContributeClientLayout() {
    const [showToc, setShowToc] = useState(true)

    const toggleTocVisibility = () => {
        setShowToc(!showToc)
    }

    return (
        <TocProvider>
            <Button
                onClick={toggleTocVisibility}
                className={cn(
                    "fixed size-8 top-4 left-2 z-50 outline-none p-1 shadow-md rounded-md",
                    "transition-all duration-300 ease-in-out",
                    "hover:ring-2 hover:ring-offset-2 hover:ring-offset-white dark:hover:ring-offset-wash-800 hover:ring-emerald-500/50",
                    showToc ? "bg-emerald-200 dark:bg-emerald-800" : "opacity-80",
                )}
                aria-label={showToc ? "Hide table of contents" : "Show table of contents"}
            >
                <MenuIcon className="size-6" />
            </Button>
            <div className="flex flex-row lg:gap-2 min-h-[92vh] px-2 sm:px-4 lg:px-0">
                <div
                    className={cn(
                        "lg:sticky lg:top-20 h-[calc(92vh-4rem)] pt-2 overflow-y-auto overscroll-contain",
                        "transition-all duration-300 ease-in-out",
                        showToc
                            ? "w-full lg:w-1/4 opacity-100 transform-none"
                            : "w-0 lg:w-1/4 opacity-0 lg:opacity-0 -translate-x-full lg:translate-x-0",
                    )}
                >
                    <div className="p-3">
                        <TocEditor />
                    </div>
                </div>
                <div
                    className={cn(
                        "w-full lg:w-2/4 editor-shell transition-all duration-300 ease-in-out",
                        showToc ? "hidden lg:block" : "lg:block",
                    )}
                >
                    <ContentEditor />
                </div>
                <div
                    className={cn(
                        "hidden lg:block lg:w-1/4 py-16 lg:sticky lg:top-20 h-[calc(92vh-4rem)]",
                        " overflow-y-auto overscroll-contain",
                    )}
                >
                    <div className="p-4">
                        {/* Placeholder - You might enhance this later */}
                        Content Outline
                    </div>
                </div>
            </div>
        </TocProvider>
    )
}
