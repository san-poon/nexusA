import { useLexicalComposerContext } from "@lexical/react/LexicalComposerContext";
import { EditorState } from "lexical";
import { useEffect } from "react";

/**
 * Get notified when the editor state changes
 */
export default function EditorStateOnChangePlugin({ onChange }: { onChange: (editorState: EditorState) => void }) {
    const [editor] = useLexicalComposerContext();

    // Wrap listener in useEffect to handle the teardown and avoid stale references
    useEffect(() => {
        // most listeners return a teardown function that can be called to clean them up
        return editor.registerUpdateListener(({ editorState }) => {
            // call onChange to pass the latest state up to the parent
            onChange(editorState);
        });
    }, [editor, onChange]);
    return null;
}