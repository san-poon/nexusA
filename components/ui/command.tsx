"use client"

import * as React from "react"
import { type DialogProps } from "@radix-ui/react-dialog"
import { Command as CommandPrimitive } from "cmdk"
import { Search } from "lucide-react"

import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"

export function Command({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive>) {
    return (
        <CommandPrimitive
            data-slot="command"
            className={cn(
                "flex h-full w-full flex-col overflow-hidden rounded-2xl bg-wash-80 dark:bg-wash-780",
                className
            )}
            {...props}
        />
    )
}

interface CommandDialogProps extends DialogProps { }

export function CommandDialog({ children, ...props }: CommandDialogProps) {
    return (
        <Dialog {...props}>
            <DialogContent className="overflow-hidden p-0 shadow-lg">
                <Command className="[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-500 [&_[cmdk-group]:not([hidden])_~[cmdk-group]]:pt-0 [&_[cmdk-group]]:px-2 [&_[cmdk-input-wrapper]_svg]:h-5 [&_[cmdk-input-wrapper]_svg]:w-5 [&_[cmdk-input]]:h-12 [&_[cmdk-item]]:px-2 [&_[cmdk-item]]:py-3 [&_[cmdk-item]_svg]:h-5 [&_[cmdk-item]_svg]:w-5 dark:[&_[cmdk-group-heading]]:text-neutral-400">
                    {children}
                </Command>
            </DialogContent>
        </Dialog>
    )
}

export function CommandInput({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
    return (
        <div className="flex items-center px-2 bg-wash-50 dark:bg-wash-780 rounded-t-2xl" cmdk-input-wrapper="">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandPrimitive.Input
                data-slot="command-input"
                className={cn(
                    "flex h-11 w-full rounded-2xl bg-transparent py-3 text-sm outline-hidden placeholder:text-neutral-500 disabled:cursor-not-allowed disabled:opacity-50 dark:placeholder:text-neutral-400",
                    className
                )}
                {...props}
            />
        </div>
    )
}

export function CommandList({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.List>) {
    return (
        <CommandPrimitive.List
            data-slot="command-list"
            className={cn("max-h-[300px] overflow-y-auto overflow-x-hidden", className)}
            {...props}
        />
    )
}

export function CommandEmpty({
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Empty>) {
    return (
        <CommandPrimitive.Empty
            data-slot="command-empty"
            className="py-6 text-center text-sm"
            {...props}
        />
    )
}

export function CommandGroup({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Group>) {
    return (
        <CommandPrimitive.Group
            data-slot="command-group"
            className={cn(
                "overflow-hidden p-1 bg-wash-50 dark:bg-wash-780 [&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5 [&_[cmdk-group-heading]]:text-xs [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-neutral-500 dark:text-neutral-50 dark:[&_[cmdk-group-heading]]:text-neutral-400",
                className
            )}
            {...props}
        />
    )
}

export function CommandSeparator({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Separator>) {
    return (
        <CommandPrimitive.Separator
            data-slot="command-separator"
            className={cn("-mx-1 h-px bg-neutral-200 dark:bg-neutral-800", className)}
            {...props}
        />
    )
}

export function CommandItem({
    className,
    ...props
}: React.ComponentProps<typeof CommandPrimitive.Item>) {
    return (
        <CommandPrimitive.Item
            data-slot="command-item"
            className={cn(
                "relative flex cursor-pointer select-none items-center rounded-full px-2 py-1.5 text-sm outline-hidden aria-selected:bg-emerald-100 aria-selected:text-neutral-900 data-disabled:pointer-events-none data-disabled:opacity-50 dark:aria-selected:bg-emerald-800 dark:aria-selected:text-neutral-50",
                className
            )}
            {...props}
        />
    )
}

export function CommandShortcut({
    className,
    ...props
}: React.HTMLAttributes<HTMLSpanElement>) {
    return (
        <span
            data-slot="command-shortcut"
            className={cn(
                "ml-auto text-xs tracking-widest text-neutral-500 dark:text-neutral-400",
                className
            )}
            {...props}
        />
    )
}
