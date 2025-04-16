'use client';

import { useFormStatus } from 'react-dom';
import { Button } from './button';
import { cn } from '@/lib/utils/utils';

interface SubmitProps {
    className?: string,
    label: string,
}

export default function SubmitButton({ className, label }: SubmitProps) {
    const { pending } = useFormStatus();
    return (
        <Button
            variant="secondary"
            type="submit"
            className={cn('w-full', className)}
            aria-disabled={pending}
            disabled={pending}
        >
            {pending ? "Submitting" : label}
        </Button>
    )
}