import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'accent' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface PixelButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: Variant;
    size?: Size;
    children: ReactNode;
    fullWidth?: boolean;
}

const variantStyles: Record<Variant, string> = {
    primary:
        'bg-primary text-primary-foreground hover:brightness-110 active:translate-y-[2px] pixel-shadow-primary',
    secondary:
        'bg-secondary text-secondary-foreground hover:brightness-110 active:translate-y-[2px] pixel-shadow',
    accent:
        'bg-accent text-accent-foreground hover:brightness-110 active:translate-y-[2px] pixel-shadow-accent',
    ghost:
        'bg-transparent text-foreground border border-border hover:bg-secondary active:translate-y-[2px]',
    danger:
        'bg-destructive text-destructive-foreground hover:brightness-110 active:translate-y-[2px] pixel-shadow',
};

const sizeStyles: Record<Size, string> = {
    sm: 'px-3 py-1 text-xs',
    md: 'px-5 py-2 text-sm',
    lg: 'px-7 py-3 text-base',
};

export function PixelButton({
    variant = 'primary',
    size = 'md',
    children,
    fullWidth = false,
    className = '',
    disabled,
    ...props
}: PixelButtonProps) {
    return (
        <button
        {...props}
        disabled={disabled}
        className={[
            'font-pixel cursor-pointer select-none transition-all duration-75',
            'inline-flex items-center justify-center gap-2',
            variantStyles[variant],
            sizeStyles[size],
            fullWidth ? 'w-full' : '',
            disabled ? 'opacity-40 pointer-events-none' : '',
            className,
        ].join(' ')}
        >
        {children}
        </button>
    );
}