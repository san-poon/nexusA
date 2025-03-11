import { useEffect, useRef } from "react";
import { Textarea, TextareaProps } from "./textarea";
import { cn } from "@/lib/utils";

export function DynamicTextarea({ className, ...props }: TextareaProps) {
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Automatically increase the height with content
    useEffect(() => {
        const adjustHeight = () => {
            if (textareaRef.current) {
                textareaRef.current.style.height = 'auto';
                textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
            }
        }
        const currentTextarea = textareaRef.current; // Capture the current value

        currentTextarea?.addEventListener('input', adjustHeight);

        //Initial adjustment
        adjustHeight();
        // Return a cleanup function.
        return () => {
            currentTextarea?.removeEventListener('input', adjustHeight); // Use the captured value
        };
    }, []);

    return (
        <Textarea ref={textareaRef as React.RefObject<HTMLTextAreaElement>}
            className={cn(
                "resize-none overflow-hidden px-4 py-3 w-full",
                className
            )}
            maxLength={800}
            minLength={1}
            {...props}
            rows={1}
        />
    );
}