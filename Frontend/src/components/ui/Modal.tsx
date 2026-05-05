import { type ReactNode, useEffect } from 'react';

interface PixelModalProps {
    open: boolean;
    onClose: () => void;
    title?: string;
    children: ReactNode;
    width?: string;
}

export function PixelModal({
    open,
    onClose,
    title,
    children,
    width = 'max-w-md',
    }: PixelModalProps) {
    // lock body scroll while modal is open
    useEffect(() => {
        if (open) document.body.style.overflow = 'hidden';
        else document.body.style.overflow = '';
        return () => { document.body.style.overflow = ''; };
    }, [open]);

    if (!open) return null;

    return (
        <div
        className="fixed inset-0 z-50 flex items-center justify-center p-4"
        onClick={onClose}
        >
        {/* backdrop */}
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

        {/* dialog */}
        <div
            className={[
            'relative w-full bg-card border-2 border-border pixel-border-primary pixel-shadow-primary',
            'animate-pop z-10',
            width,
            ].join(' ')}
            onClick={e => e.stopPropagation()}
        >
            {/* title bar */}
            {title && (
            <div className="flex items-center justify-between px-4 py-3 border-b-2 border-border bg-secondary">
                <span className="font-pixel text-xs text-primary text-glow-primary tracking-wider">
                {title}
                </span>
                <button
                onClick={onClose}
                className="font-pixel text-xs text-muted-foreground hover:text-destructive transition-colors px-1"
                >
                ✕
                </button>
            </div>
            )}

            <div className="p-5">{children}</div>
        </div>
        </div>
    );
}