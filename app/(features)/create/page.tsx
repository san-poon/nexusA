'use client';

import TocEditor from "./toc-editor/toc-editor";
import { TocProvider } from "./toc-editor/toc-context";
import ContentEditor from "./content-editor/content-editor";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "@/components/icons";

export default function CreatePage() {
  const [showToc, setShowToc] = useState(true);

  const toggleTocVisibility = () => {
    setShowToc(!showToc);
  }

  return (
    <TocProvider>
      <Button
        onClick={toggleTocVisibility}
        className={cn(
          "fixed size-8 top-4 left-2 z-50 bg-white dark:bg-wash-800 outline-none p-1",
          showToc ? "bg-emerald-200 dark:bg-emerald-800" : "")}
      >
        <MenuIcon className="size-6" />
      </Button>
      <div className="flex flex-col lg:flex-row lg:gap-2 min-h-[92vh] px-2 sm:px-4 lg:px-0 ">
        <div className={cn(
          "lg:sticky lg:top-20 h-[calc(92vh-4rem)] w-full lg:w-1/4 pt-2 overflow-y-auto overscroll-contain",
          showToc ? 'block' : 'hidden lg:block lg:invisible'
        )}>
          <TocEditor />
        </div>
        <div className={cn(
          "w-full lg:w-2/4 editor-shell",
          showToc ? 'hidden lg:block' : 'lg:block'
        )}>
          <ContentEditor />
        </div>
        <div className="hidden lg:block lg:w-1/4 py-16" >
          Content Outline
        </div>
      </div>
    </TocProvider>
  );
}
