import React from 'react';

interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'accent' | 'ghost' | 'danger';
    size?: 'sm' | 'md' | 'lg';
    children: React.ReactNode;
}

export function PixelButton({
    variant = 'primary',
    size = 'md',
    children,
    className = '',
    disabled,
    ...props
}: PixelButtonProps) {
    const base =
    'font-pixel inline-flex items-center justify-center cursor-pointer select-none transition-all active:translate-y-[2px] active:translate-x-[2px] disabled:opacity-40 disabled:cursor-not-allowed disabled:active:translate-x-0 disabled:active:translate-y-0';

    const sizes: Record<string, string> = {
    sm: 'px-3 py-1 text-[8px]',
    md: 'px-4 py-2 text-[9px]',
    lg: 'px-6 py-3 text-[10px]',
    };

    const variants: Record<string, string> = {
    primary:
        'bg-primary text-primary-foreground pixel-border-primary hover:brightness-110 pixel-shadow-primary active:shadow-none',
    accent:
        'bg-accent text-accent-foreground pixel-border-accent hover:brightness-110 pixel-shadow-accent active:shadow-none',
    ghost:
        'bg-transparent text-foreground pixel-border hover:bg-secondary pixel-shadow active:shadow-none',
    danger:
        'bg-destructive text-destructive-foreground pixel-border hover:brightness-110 active:shadow-none',
    };

    return (
    <button
        className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}
        disabled={disabled}
        {...props}
    >
        {children}
    </button>
    );
}