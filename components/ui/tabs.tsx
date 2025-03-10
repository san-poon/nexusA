"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = (
  {
    ref,
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.List> & {
    ref: React.RefObject<React.ElementRef<typeof TabsPrimitive.List>>;
  }
) => (<TabsPrimitive.List
  ref={ref}
  className={cn(
    "inline-flex h-10 items-center justify-center rounded-none bg-neutral-100 p-1 text-neutral-500 dark:bg-wash-700 dark:text-neutral-300",
    className
  )}
  {...props}
/>)
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = (
  {
    ref,
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger> & {
    ref: React.RefObject<React.ElementRef<typeof TabsPrimitive.Trigger>>;
  }
) => (<TabsPrimitive.Trigger
  ref={ref}
  className={cn(
    "inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1.5 text-sm font-medium ring-offset-white transition-all focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-white data-[state=active]:text-neutral-950 data-[state=active]:shadow-xs dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300 dark:data-[state=active]:bg-wash-800 dark:data-[state=active]:text-neutral-50",
    className
  )}
  {...props}
/>)
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName

const TabsContent = (
  {
    ref,
    className,
    ...props
  }: React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content> & {
    ref: React.RefObject<React.ElementRef<typeof TabsPrimitive.Content>>;
  }
) => (<TabsPrimitive.Content
  ref={ref}
  className={cn(
    "mt-2 ring-offset-white focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-neutral-950 focus-visible:ring-offset-2 dark:ring-offset-neutral-950 dark:focus-visible:ring-neutral-300",
    className
  )}
  {...props}
/>)
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }
