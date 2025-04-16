import * as React from "react"

import { cn } from "@/lib/utils/utils"

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> { }

const Textarea = (
  {
    ref,
    className,
    ...props
  }: TextareaProps & {
    ref: React.RefObject<HTMLTextAreaElement>;
  }
) => {
  return (
    <textarea
      className={cn(
        "w-full border border-neutral-300 dark:border-neutral-600 rounded-2xl dark:bg-wash-800 placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-neutral-400 focus-visible:outline-neutral-400 dark:focus-visible:outline-hidden dark:focus-visible:outline-1 dark:focus-visible:outline-offset-0 dark:focus-visible:outline-neutral-500",
        className
      )}
      ref={ref}
      {...props}
    />
  )
}
Textarea.displayName = "Textarea"

export { Textarea }
