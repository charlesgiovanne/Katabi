import {
    type InputHTMLAttributes,
    type ForwardedRef,
    forwardRef,
} from 'react';

interface PixelInputProps extends InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
    hint?: string;
    prefix?: string;
}

export const PixelInput = forwardRef(function PixelInput(
    { label, error, hint, prefix, className = '', ...props }: PixelInputProps,
    ref: ForwardedRef<HTMLInputElement>
) {
    return (
        <div className="flex flex-col gap-1 w-full">
        {label && (
            <label className="font-pixel text-xs text-muted-foreground uppercase tracking-widest">
            {label}
            </label>
        )}
        <div className="relative flex items-center">
            {prefix && (
            <span className="absolute left-3 text-primary font-mono-pixel text-lg select-none pointer-events-none">
                {prefix}
            </span>
            )}
            <input
            ref={ref}
            {...props}
            className={[
                'w-full bg-input text-foreground font-mono-pixel text-lg',
                'px-3 py-2 outline-none border-2 transition-colors duration-100',
                error
                ? 'border-destructive focus:border-destructive'
                : 'border-border focus:border-primary',
                prefix ? 'pl-8' : '',
                className,
            ].join(' ')}
            />
        </div>
        {error && (
            <p className="font-pixel text-xs text-destructive animate-pop">{error}</p>
        )}
        {hint && !error && (
            <p className="font-pixel text-xs text-muted-foreground">{hint}</p>
        )}
        </div>
    );
});