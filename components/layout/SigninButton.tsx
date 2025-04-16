"use client";

import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';

interface LoginButtonProps {
    children: React.ReactNode;
    mode?: "modal" | "redirect";
    asChild?: boolean;
};

export default function SigninButton({ children, mode = "redirect", asChild }: LoginButtonProps) {
    const router = useRouter();

    const handleLoginClick = () => {
        router.push("/auth/signin");
    };

    if (mode === 'modal') {
        return (
            <span>
                TODO: Implement modal
            </span>
        )
    }
    return (
        <Button onClick={handleLoginClick} className=" cursor-pointer m-0">
            {children}
        </Button>
    );
}