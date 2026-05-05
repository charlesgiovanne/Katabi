import { useState, useEffect, useRef } from 'react';
import { useAppStore, formatTime } from '../store/UseAppStore';
import type { Message } from '../types';
import { PixelButton } from '../components/ui/Button';
import { OnlineDot } from '../components/OnlineDot';

function MessageBubble({ msg, isOwn }: { msg: Message; isOwn: boolean }) {
    if (msg.type === 'system') {
        return (
        <div className="flex justify-center py-1">
            <span className="font-pixel text-[6px] text-pixel-yellow/70 bg-pixel-yellow/10 px-3 py-1 border border-pixel-yellow/20">
            ★ {msg.text}
            </span>
        </div>
        );
    }

    return (
        <div className={`flex flex-col gap-1 animate-msg ${isOwn ? 'items-end' : 'items-start'}`}>
        <div className={`flex items-center gap-2 ${isOwn ? 'flex-row-reverse' : 'flex-row'}`}>
            <span className="font-pixel text-[7px]" style={{ color: msg.userColor }}>
            {msg.username}
            </span>
            <span className="font-mono-pixel text-muted-foreground text-sm">
            {formatTime(msg.timestamp)}
            </span>
        </div>
        <div
            className={`max-w-[75%] px-3 py-2 font-mono-pixel text-base leading-tight ${
            isOwn
                ? 'bg-primary/20 pixel-border-primary text-foreground'
                : 'bg-secondary pixel-border text-foreground'
            }`}
        >
            {msg.text}
        </div>
        </div>
    );
}

export function ChatPage() {
    const { currentUser, activeChannel, messages, leaveChannel, sendMessage, channels } =
        useAppStore(s => ({
        currentUser: s.currentUser,
        activeChannel: s.activeChannel,
        messages: s.messages,
        leaveChannel: s.leaveChannel,
        sendMessage: s.sendMessage,
        channels: s.channels,
        }));

    const [input, setInput] = useState('');
    const [showMembers, setShowMembers] = useState(true);
    const bottomRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const channelMessages: Message[] = activeChannel
        ? (messages[activeChannel.id] || [])
        : [];

  // Get latest channel data
    const liveChannel = channels.find(c => c.id === activeChannel?.id) || activeChannel;

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [channelMessages.length]);

    useEffect(() => {
        inputRef.current?.focus();
    }, [activeChannel?.id]);

    const handleSend = () => {
        if (!activeChannel || !input.trim()) return;
        sendMessage(activeChannel.id, input.trim());
        setInput('');
        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
        }
    };

    if (!activeChannel || !currentUser || !liveChannel) return null;

    return (
        <div className="h-screen flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between shrink-0 pixel-shadow z-10">
            <div className="flex items-center gap-3 min-w-0">
            <PixelButton
                variant="ghost"
                size="sm"
                onClick={() => leaveChannel(activeChannel.id)}
                title="Leave channel"
            >
                ◀ BACK
            </PixelButton>
            <div className="flex items-center gap-2 min-w-0">
                <span className="font-pixel text-sm text-accent">#</span>
                <span className="font-pixel text-[10px] text-foreground truncate">{liveChannel.name}</span>
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <OnlineDot size={6} />
                <span className="font-mono-pixel text-muted-foreground text-sm">
                {liveChannel.activeUsers.length} online
                </span>
            </div>
            </div>
            <div className="flex items-center gap-2">
            <button
                className={`font-pixel text-[7px] px-2 py-1 border transition-colors ${
                showMembers
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
                onClick={() => setShowMembers(m => !m)}
            >
                MEMBERS
            </button>
            </div>
        </header>

        {/* Body */}
        <div className="flex-1 flex overflow-hidden min-h-0">
            {/* Messages area */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
            {/* Message list */}
            <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 scrollbar-thin">
                {channelMessages.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 text-center">
                    <div className="font-pixel text-[8px] text-muted-foreground">
                    NO MESSAGES YET
                    </div>
                    <p className="font-mono-pixel text-muted-foreground text-sm">
                    Be the first to say something in #{liveChannel.name}!
                    </p>
                    <span className="text-4xl animate-blink">█</span>
                </div>
                )}
                {channelMessages.map(msg => (
                <MessageBubble
                    key={msg.id}
                    msg={msg}
                    isOwn={msg.userId === currentUser.id}
                />
                ))}
                <div ref={bottomRef} />
            </div>

            {/* Input area */}
            <div className="bg-card border-t border-border px-4 py-3 flex gap-3 items-center shrink-0">
                <div className="flex-1 flex items-center bg-input pixel-border gap-2 px-3 focus-within:pixel-border-primary transition-all">
                <span className="font-pixel text-[8px]" style={{ color: currentUser.color }}>
                    {currentUser.username}
                </span>
                <span className="text-border">│</span>
                <input
                    ref={inputRef}
                    className="flex-1 bg-transparent text-foreground font-mono-pixel text-lg py-3 outline-none placeholder:text-muted-foreground"
                    placeholder={`message #${liveChannel.name}...`}
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    maxLength={500}
                />
                {input && (
                    <span className="font-pixel text-[6px] text-muted-foreground shrink-0">
                    {input.length}/500
                    </span>
                )}
                </div>
                <PixelButton
                variant="primary"
                size="md"
                onClick={handleSend}
                disabled={!input.trim()}
                >
                SEND ▶
                </PixelButton>
            </div>
            </div>

            {/* Members sidebar */}
            {showMembers && (
            <aside className="w-48 bg-card border-l border-border flex flex-col shrink-0 overflow-hidden">
                <div className="px-3 py-3 border-b border-border">
                <span className="font-pixel text-[7px] text-primary">ONLINE — {liveChannel.activeUsers.length}</span>
                </div>
                <div className="flex-1 overflow-y-auto px-2 py-2 flex flex-col gap-1">
                {/* Current user first */}
                <div className="flex items-center gap-2 px-2 py-1.5 bg-primary/10 border border-primary/30">
                    <OnlineDot size={6} />
                    <span
                    className="font-pixel text-[7px] truncate"
                    style={{ color: currentUser.color }}
                    >
                    {currentUser.username}
                    </span>
                    <span className="font-pixel text-[5px] text-primary ml-auto">YOU</span>
                </div>
                {/* Other users */}
                {liveChannel.activeUsers
                    .filter(u => u.id !== currentUser.id)
                    .map(u => (
                    <div key={u.id} className="flex items-center gap-2 px-2 py-1.5 hover:bg-secondary transition-colors">
                        <OnlineDot size={6} />
                        <span className="font-pixel text-[7px] truncate" style={{ color: u.color }}>
                        {u.username}
                        </span>
                    </div>
                    ))}
                </div>

                {/* Leave channel button */}
                <div className="p-2 border-t border-border">
                <PixelButton
                    variant="danger"
                    size="sm"
                    className="w-full"
                    onClick={() => leaveChannel(activeChannel.id)}
                >
                    LEAVE
                </PixelButton>
                </div>
            </aside>
            )}
        </div>
        </div>
    );
}
