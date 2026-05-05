import { useState, useRef, type KeyboardEvent } from 'react';
import { PixelButton } from '../ui/Button';

const MAX_CHARS = 500;

interface MessageInputProps {
    onSend: (content: string) => void;
    disabled?: boolean;
}

export function MessageInput({ onSend, disabled }: MessageInputProps) {
    const [value, setValue] = useState('');
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    const handleSend = () => {
        const trimmed = value.trim();
        if (!trimmed || disabled) return;
        onSend(trimmed);
        setValue('');
        textareaRef.current?.focus();
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        }
    };

    const remaining = MAX_CHARS - value.length;
    const isNearLimit = remaining < 50;

    return (
        <div className="border-t-2 border-border bg-card px-3 py-3 flex flex-col gap-2">
        <div className="flex gap-2 items-end">
            {/* input area */}
            <div className="flex-1 relative">
            <textarea
                ref={textareaRef}
                value={value}
                onChange={e => setValue(e.target.value.slice(0, MAX_CHARS))}
                onKeyDown={handleKeyDown}
                disabled={disabled}
                placeholder="TYPE A MESSAGE... (ENTER TO SEND)"
                rows={2}
                className={[
                'w-full bg-input text-foreground font-mono-pixel text-lg',
                'px-3 py-2 resize-none outline-none border-2 border-border',
                'focus:border-primary transition-colors duration-100',
                'placeholder:text-muted-foreground/50',
                disabled ? 'opacity-40 cursor-not-allowed' : '',
                ].join(' ')}
            />
            </div>

            {/* send */}
            <PixelButton
            variant="primary"
            size="md"
            onClick={handleSend}
            disabled={!value.trim() || disabled}
            className="self-end h-14.5 px-4"
            >
            ▶
            </PixelButton>
        </div>

        {/* footer row */}
        <div className="flex items-center justify-between px-0.5">
            <span className="font-pixel text-xs text-muted-foreground/50">
            SHIFT+ENTER FOR NEWLINE
            </span>
            <span className={`font-pixel text-xs tabular-nums ${isNearLimit ? 'text-pixel-yellow' : 'text-muted-foreground/50'}`}>
            {remaining}
            </span>
        </div>
        </div>
    );
}