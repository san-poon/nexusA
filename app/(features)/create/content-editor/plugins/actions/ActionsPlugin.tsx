import { Button } from "@/components/ui/button";
import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { ActivityIcon } from "lucide-react";
import { cn } from "@/lib/utils";
// Here you actually want to do some type of backend/database actions.
export default function ActionsPlugin({ className }: { className?: string }) {
    const [editor] = useLexicalComposerContext();

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