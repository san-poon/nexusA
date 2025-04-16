import { CircleCheck } from '@/components/ui/icons';

interface FormSuccessProps {
    message?: string;
}

export default function FormSuccess({ message }: FormSuccessProps) {
    if (!message) return null;

    return (
        <div className="bg-emerald-100 dark:bg-emerald-500/10 p-3 rounded-2xl flex items-center gap-x-2 text-sm text-emerald-700 dark:text-emerald-300">
            <CircleCheck className='w-4 h-4' />
            <p>{message}</p>
        </div>
    )
}