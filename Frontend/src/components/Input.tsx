import React from 'react';

interface PixelInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    label?: string;
    error?: string;
}

export function PixelInput({ label, error, className = '', ...props }: PixelInputProps) {
    return (
    <div className="flex flex-col gap-2 w-full">
        {label && (
        <label className="font-pixel text-[8px] text-primary tracking-widest uppercase">
            {label}
        </label>
        )}
        <input
        className={`
            w-full bg-input text-foreground font-mono-pixel text-lg px-4 py-3
            border-0 outline-none pixel-border
            focus:pixel-border-primary
            placeholder:text-muted-foreground
            transition-all
            ${error ? 'pixel-border-accent' : ''}
            ${className}
        `}
        {...props}
        />
        {error && (
        <span className="font-pixel text-[7px] text-accent text-glow-accent animate-pulse-dot">
            ▶ {error}
        </span>
        )}
    </div>
    );
}