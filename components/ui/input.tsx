import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> { }

const Input = (
  {
    ref,
    className,
    type,
    ...props
  }: InputProps & {
    ref: React.RefObject<HTMLInputElement>;
  }
) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-10 w-full bg-inherit rounded-full border border-neutral-400 dark:border-neutral-600 px-4 py-2 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-neutral-500 focus-visible:outline-1 focus-visible:outline-neutral-400 dark:focus-visible:outline-hidden dark:focus-visible:outline-1 dark:focus-visible:outline-offset-0 dark:focus-visible:outline-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-inherit dark:placeholder:text-neutral-400 ",
        className
      )}
      ref={ref}
      {...props}
    />
  )
}
Input.displayName = "Input"

export { Input }
