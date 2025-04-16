import { HamburgerIcon, XMarkIcon } from '@/components/ui/icons';
import { Button } from '@/components/ui/button';

export default function Menu({ isOpen, onClick, className }: { isOpen: boolean, onClick: () => void, className?: string }) {
    return (
        <Button size="icon" onClick={onClick} className={className}>
            {isOpen ? <XMarkIcon /> : <HamburgerIcon />}
        </Button>
    );
}