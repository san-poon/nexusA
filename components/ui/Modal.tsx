import { ReactNode, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { Button } from "./button";

type ModalProps = {
    onClose: () => void;
    children: ReactNode;
    title: string,
    closeOnClickOutside?: boolean;
};

export default function Modal({
    onClose,
    children,
    title,
    closeOnClickOutside = false,
}: ModalProps) {
    return createPortal(
        <PortalImpl
            onClose={onClose}
            title={title}
            closeOnClickOutside={closeOnClickOutside}
        >
            {children}
        </PortalImpl>,
        document.body,
    );
}

function PortalImpl({
    onClose,
    children,
    title,
    closeOnClickOutside = true,
}: ModalProps) {
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (modalRef.current !== null) {
            modalRef.current.focus();
        }
    }, []);

    useEffect(() => {
        let modalOverlyElement: HTMLElement | null = null;

        const handler = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        const clickOutsideHander = (event: MouseEvent) => {
            const target = event.target;
            if (
                modalRef.current !== null &&
                !modalRef.current.contains(target as Node) &&
                closeOnClickOutside
            ) {
                onClose();
            }
        };

        const modalElement = modalRef.current;
        if (modalElement !== null) {
            modalOverlyElement = modalElement.parentElement;
            if (modalOverlyElement !== null) {
                modalOverlyElement.addEventListener('click', clickOutsideHander);
            }
        }

        window.addEventListener('keydown', handler);

        return () => {
            window.removeEventListener('keydown', handler);
            if (modalOverlyElement !== null) {
                modalOverlyElement?.removeEventListener('click', clickOutsideHander);
            }
        };
    }, [closeOnClickOutside, onClose]);

    return (
        <div className="fixed inset-0 z-50 bg-black/50  data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
            <div className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 bg-wash-50 p-6 duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%] sm:rounded-2xl dark:bg-wash-800"
                tabIndex={-1}
                ref={modalRef}
            >
                <h2 className="text-center">{title}</h2>
                <Button
                    className="absolute right-4 top-4 rounded-2xl opacity-70 ring-offset-white transition-opacity hover:opacity-100 focus:outline-hidden focus:ring-2 focus:ring-neutral-950 focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-neutral-100 data-[state=open]:text-neutral-500 dark:ring-offset-neutral-950 dark:focus:ring-neutral-300 dark:data-[state=open]:bg-neutral-800 dark:data-[state=open]:text-neutral-400"
                    aria-label="Close modal"
                    type="button"
                    onClick={onClose}
                >
                    x
                </Button>
                <div className="text-sm">{children}</div>
            </div>
        </div>
    );
}