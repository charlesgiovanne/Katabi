import type { Message } from '../../types';

interface MessageBubbleProps {
    message: Message;
    isOwn: boolean;
}

function formatTime(ts: number): string {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
}

export function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  // system message
    if (message.type === 'system') {
        return (
        <div className="flex justify-center animate-msg my-1">
            <div className="flex items-center gap-2 px-3 py-1 bg-secondary/50 border border-border">
            <span className="text-pixel-yellow text-xs">★</span>
            <span className="font-mono-pixel text-base text-muted-foreground">{message.content}</span>
            <span className="text-pixel-yellow text-xs">★</span>
            </div>
        </div>
        );
    }

    if (isOwn) {
        return (
        <div className="flex flex-col items-end gap-0.5 animate-msg">
            <span className="font-pixel text-xs text-primary text-glow-primary">YOU</span>
            <div className="flex items-end gap-2 flex-row-reverse">
            <div className="max-w-xs lg:max-w-sm bg-primary text-primary-foreground px-3 py-2 pixel-shadow-primary">
                <p className="font-mono-pixel text-lg leading-snug wrap-break-word">{message.content}</p>
            </div>
            <span className="font-pixel text-xs text-muted-foreground tabular-nums self-end mb-0.5">
                {formatTime(message.timestamp)}
            </span>
            </div>
        </div>
        );
    }

    return (
        <div className="flex flex-col items-start gap-0.5 animate-msg">
        <span className="font-pixel text-xs text-pixel-cyan">{message.username}</span>
        <div className="flex items-end gap-2">
            <div className="max-w-xs lg:max-w-sm bg-card border border-border px-3 py-2 pixel-shadow">
            <p className="font-mono-pixel text-lg leading-snug wrap-break-word">{message.content}</p>
            </div>
            <span className="font-pixel text-xs text-muted-foreground tabular-nums self-end mb-0.5">
            {formatTime(message.timestamp)}
            </span>
        </div>
        </div>
    );
}