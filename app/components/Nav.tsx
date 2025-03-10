'use client';

import * as React from "react";
import { cn } from '@/lib/utils';
import NextLink from 'next/link';

import {
    NavigationMenu,
    NavigationMenuContent,
    NavigationMenuItem,
    NavigationMenuList,
    NavigationMenuLink,
    NavigationMenuTrigger,
    navigationMenuTriggerStyle
} from '@/components/ui/navigation-menu';
import { usePathname } from "next/navigation";

interface Routes {
    title: string,
    href: string,
    description: string,
};

const createRoutes: Routes[] = [
    {
        title: 'Lesson',
        href: '/create/lesson',
        description: 'Create a lesson.'
    },
    {
        title: 'Learning Path',
        href: '/create/learning-path',
        description: 'Create learning-path, a curriculum.'
    }
];

const learnRoutes: Routes[] = [
    {
        title: 'JS',
        href: '/learn/quiz/mcqs',
        description: 'Test yourself with MCQs.'
    }
];

export default function Nav() {
    return (
        <NavigationMenu>
            <NavigationMenuList>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Create</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] ">
                            {createRoutes.map((route) => (
                                <ListItem
                                    key={route.title}
                                    title={route.title}
                                    href={route.href}
                                >{route.description}</ListItem>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
                <NavigationMenuItem>
                    <NavigationMenuTrigger>Learn</NavigationMenuTrigger>
                    <NavigationMenuContent>
                        <ul className="grid w-[400px] gap-3 p-4 md:w-[500px] lg:w-[600px] ">
                            {learnRoutes.map((route) => (
                                <ListItem
                                    key={route.title}
                                    title={route.title}
                                    href={route.href}
                                >{route.description}</ListItem>
                            ))}
                        </ul>
                    </NavigationMenuContent>
                </NavigationMenuItem>
            </NavigationMenuList>
        </NavigationMenu>
    )
}

const ListItem = (
    {
        ref,
        className,
        title,
        children,
        href,
        ...props
    }: React.ComponentPropsWithoutRef<"a"> & {
        ref: React.RefObject<React.ElementRef<"a">>;
    }
) => {
    return (
        <li>
            <Link
                ref={ref}
                href={href}
                className={cn(
                    "block select-none space-y-1 rounded-2xl p-3 leading-none no-underline outline-hidden transition-colors hover:bg-wash-100 dark:hover:bg-wash-850 focus:bg-wash-100 dark:focus:bg-wash-850",
                    className
                )}
                {...props}
            >
                <div className=" text-base font-medium leading-none">{title}</div>
                <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
                    {children}
                </p>
            </Link>
        </li>
    );
};
ListItem.displayName = "ListItem"


const Link = ({ href, ...props }: any) => {
    const pathname = usePathname();
    const isActive = href === pathname;

    return (
        <NavigationMenuLink asChild active={isActive}>
            <NextLink href={href} className={navigationMenuTriggerStyle()} {...props} />
        </NavigationMenuLink>
    );
};