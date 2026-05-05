import { useState, useRef, useEffect } from 'react';
import { PixelModal } from '../ui/Modal';
import { PixelInput } from '../ui/Input';
import { PixelButton } from '../ui/Button';
import type { Room } from '../../types';

interface JoinRoomModalProps {
    room: Room | null;
    open: boolean;
    onClose: () => void;
    onJoin: (room: Room) => void;
    validateKeyword: (roomId: string, keyword: string) => boolean;
}

export function JoinRoomModal({
    room,
    open,
    onClose,
    onJoin,
    validateKeyword,
    }: JoinRoomModalProps) {
    const [input, setInput] = useState('');
    const [error, setError] = useState('');
    const [attempts, setAttempts] = useState(0);
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (open) {
        setInput('');
        setError('');
        setAttempts(0);
        setTimeout(() => inputRef.current?.focus(), 80);
        }
    }, [open]);

    if (!room) return null;

    const handleSubmit = () => {
        const val = input.trim();
        if (!val) { setError('ENTER THE KEYWORD'); return; }

        if (validateKeyword(room.id, val)) {
        onJoin(room);
        setInput('');
        setError('');
        } else {
        const next = attempts + 1;
        setAttempts(next);
        setError(next >= 3 ? 'ACCESS DENIED — CHECK WITH ROOM OWNER' : 'WRONG KEYWORD');
        setInput('');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') handleSubmit();
    };

    return (
        <PixelModal open={open} onClose={onClose} title="// ACCESS CONTROL">
        <div className="flex flex-col gap-5">
            {/* room info */}
            <div className="border border-border bg-secondary/40 p-3 flex flex-col gap-2">
            <div className="flex items-center gap-2">
                <span className="font-pixel text-xs text-muted-foreground">ROOM</span>
                <span className="font-pixel text-xs text-primary text-glow-primary">{room.name}</span>
            </div>
            <div className="flex items-center gap-2">
                <span className="font-pixel text-xs text-muted-foreground">USERS</span>
                <span className="font-mono-pixel text-base text-foreground">{room.userCount} ONLINE</span>
            </div>
            </div>

            <div className="font-mono-pixel text-base text-muted-foreground border-l-2 border-primary pl-3">
            ENTER THE ROOM KEYWORD TO GAIN ACCESS.
            </div>

            <PixelInput
            ref={inputRef}
            label="KEYWORD"
            placeholder="TYPE KEYWORD HERE"
            value={input}
            onChange={e => { setInput(e.target.value.toUpperCase()); setError(''); }}
            onKeyDown={handleKeyDown}
            error={error}
            maxLength={32}
            />

            <div className="flex gap-3">
            <PixelButton variant="ghost" fullWidth onClick={onClose}>
                CANCEL
            </PixelButton>
            <PixelButton variant="primary" fullWidth onClick={handleSubmit}>
                ▶ ENTER
            </PixelButton>
            </div>
        </div>
        </PixelModal>
    );
}