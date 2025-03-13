import { Button } from "@/components/ui/button";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { useCallback, useState } from "react";
import { Pencil, Eye, ActivityIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ActionsPlugin({ className }: { className?: string }) {
    const [editor] = useLexicalComposerContext();
    // const [isEditable, setIsEditable] = useState(() => editor.isEditable());

    // const toggleEditMode = useCallback(() => {
    //     const newEditable = !isEditable;
    //     editor.setEditable(newEditable);
    //     setIsEditable(newEditable);
    // }, [editor, isEditable]);

    // return (
    //     <div className={cn("flex gap-2 justify-end", className)}>
    //         <Button onClick={toggleEditMode} title={isEditable ? "Learn" : "Edit"}>
    //             {isEditable ?

    //                 <Eye className="size-4" />
    //                 :
    //                 <Pencil className="size-4" />
    //             }

    //         </Button>
    //     </div>
    // );

    const handleExport = () => {
        const json = editor.getEditorState().toJSON();
        console.log(json);
    };

    return (
        <div className={cn(" fixed bottom-2 right-2 z-50", className)}>
            <Button title="Log on console." onClick={handleExport}><ActivityIcon className="size-4" /></Button>
        </div>
    );


}