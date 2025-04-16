import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils/utils"

const buttonVariants = cva(
  " cursor-pointer inline-flex items-center justify-center whitespace-nowrap rounded-full text-sm ring-offset-white transition-colors focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
  {
    variants: {
      variant: {
        default: "hover:bg-emerald-100 dark:hover:bg-emerald-800",
        destructive:
          "hover:bg-red-300 dark:hover:bg-red-900",
        outline:
          "border border-neutral-300 bg-inherit hover:bg-wash-200 hover:text-neutral-900 dark:border-neutral-700 dark:bg-inherit dark:hover:bg-neutral-900 dark:hover:text-neutral-50",
        secondary:
          "bg-wash-700 text-white hover:bg-emerald-800 dark:bg-wash-200 dark:text-neutral-800 dark:hover:bg-emerald-200",
        ghost: "hover:bg-neutral-100 hover:text-neutral-900 dark:hover:bg-neutral-800 dark:hover:text-neutral-50",
        link: "text-neutral-900 underline-offset-4 hover:underline dark:text-neutral-50",
      },
      size: {
        default: "h-8 px-4 py-2",
        sm: "h-7 rounded-full px-3",
        lg: "h-11 rounded-full px-8",
        icon: "h-8 w-8",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
  VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { buttonVariants }
