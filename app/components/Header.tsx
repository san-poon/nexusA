import Link from "next/link";
import ThemeToggler from "./theme-toggler";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from '@/components/ui/popover';
import Logo from "@/components/icons";
import UserMenu from './UserMenu';
import Search from "./Search";
import { Settings } from "lucide-react";
import { CourseWithTags } from "@/data-access/courses";

interface HeaderProps {
    coursesData: CourseWithTags[];
}

export default async function Header({ coursesData }: HeaderProps) {
    const isUserSignedin = false; // TODO: remove this
    return (
        <header className="z-50 sticky top-0">
            <nav className="duration-300 backdrop-filter backdrop-blur-lg backdrop-saturate-200 transition-shadow bg-opacity-90 bg-white dark:bg-wash-800 dark:bg-opacity-95 z-50 dark:shadow-wash-780 shadow-sm flex items-center justify-between px-3 md:px-6 h-16">
                {/* Left side - reserved for page-specific menus (4rem width) */}
                <div className="w-12 md:w-16 flex items-center">
                    {/* Page-specific menu would go here */}
                </div>

                {/* Center - Logo and Search */}
                <div className="flex-1 flex items-center justify-center gap-2 md:gap-4 max-w-3xl mx-auto">
                    <Link href="/" title="nexusA" className="flex-shrink-0">
                        <span className="duration-300 p-2 transition-transform hover:scale-105">
                            <Logo className="size-7" />
                        </span>
                    </Link>
                    <Search className="flex-1" coursesData={coursesData} />
                </div>

                {/* Right side - Settings dropdown */}
                <div className="w-12 md:w-16 flex items-center justify-end">
                    <SettingsMenu isUserSignedin={isUserSignedin} />
                </div>
            </nav>
        </header>
    );
}

function SettingsMenu({ isUserSignedin }: { isUserSignedin: boolean }) {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                    <Settings className="size-5" />
                    <span className="sr-only">Settings</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-fit p-3 rounded-xl" align="end">
                <div className="flex flex-col space-y-3">
                    <UserMenu isUserSignedin={isUserSignedin} hideButton={true} />
                    <div className="flex items-center justify-center">
                        <ThemeToggler />
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}