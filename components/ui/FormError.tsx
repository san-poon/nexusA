import { TriangleAlertIcon } from '@/components/icons';

interface FormErrorProps {
    message?: string;
}

export default function FormError({ message }: FormErrorProps) {
    if (!message) return null;

    return (
        <div className="bg-red-50 dark:bg-red-500/10 p-3 rounded-2xl flex items-center gap-x-2 text-sm text-red-500">
            <TriangleAlertIcon className='w-4 h-4' />
            <p>{message}</p>
        </div>
    )
}