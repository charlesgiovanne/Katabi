import { useEffect, useRef } from 'react';
import type { Message } from '../../types';
import { MessageBubble } from './MessageBubble';

interface MessageListProps {
    messages: Message[];
    currentUserId: string;
}

export function MessageList({ messages, currentUserId }: MessageListProps) {
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    if (messages.length === 0) {
        return (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 text-center p-8">
            <div className="font-pixel text-4xl text-border select-none">[ ]</div>
            <p className="font-pixel text-xs text-muted-foreground">
            NO MESSAGES YET
            </p>
            <p className="font-mono-pixel text-base text-muted-foreground/60">
            BE THE FIRST TO SAY SOMETHING
            </p>
        </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scroll-smooth">
        {messages.map(msg => (
            <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.userId === currentUserId}
            />
        ))}
        <div ref={bottomRef} />
        </div>
    );
}