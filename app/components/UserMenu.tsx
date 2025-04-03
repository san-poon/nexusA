'use client';
import { signOut } from "next-auth/react";
import { CircleUserIcon } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from "@/components/ui/button";
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function UserMenu({
    isUserSignedin,
    hideButton
}: {
    isUserSignedin: boolean;
    hideButton?: boolean;
}) {
    const router = useRouter();

    // When used inside SettingsMenu, render just the menu items
    if (hideButton) {
        return (
            <div>
                {isUserSignedin ? (
                    <div className="flex flex-col space-y-1">
                        <div className="flex items-center justify-between">
                            <span className="text-sm">Account</span>
                            <Button variant="link" size="sm" asChild>
                                <Link href="/profile">Profile</Link>
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            className="justify-start text-destructive"
                            onClick={() => signOut()}
                        >
                            Sign Out
                        </Button>
                    </div>
                ) : (
                    <Button
                        variant="link"
                        size="sm"
                        className="w-full justify-start"
                        onClick={() => router.push('/auth/signin')}
                    >
                        Sign In
                    </Button>
                )}
            </div>
        );
    }

    // Standard dropdown trigger with button
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button size="icon">
                    <CircleUserIcon className="h-5 w-5" />
                    <span className="sr-only">Toggle user menu</span>
                </Button>
            </DropdownMenuTrigger>
            {isUserSignedin
                ?
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Profile</DropdownMenuItem>
                    <DropdownMenuItem>Settings</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>Sign Out</DropdownMenuItem>
                </DropdownMenuContent>
                :
                <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => router.push('/auth/signin')}>Sign In</DropdownMenuItem>
                </DropdownMenuContent>
            }
        </DropdownMenu>
    )
}