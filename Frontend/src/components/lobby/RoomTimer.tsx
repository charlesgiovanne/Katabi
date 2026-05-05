import { useState, useEffect } from 'react';
import type { Room } from '../../types';

interface RoomTimerProps {
    room: Room;
    expiryMs: number;
    compact?: boolean;
}

function formatTime(ms: number): string {
    if (ms <= 0) return '00:00';
    const totalSecs = Math.floor(ms / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}

export function RoomTimer({ room, expiryMs, compact = false }: RoomTimerProps) {
    const [remaining, setRemaining] = useState(
        Math.max(0, expiryMs - (Date.now() - room.lastActivity))
    );

    useEffect(() => {
        setRemaining(Math.max(0, expiryMs - (Date.now() - room.lastActivity)));
        const iv = setInterval(() => {
        setRemaining(Math.max(0, expiryMs - (Date.now() - room.lastActivity)));
        }, 1000);
        return () => clearInterval(iv);
    }, [room.lastActivity, expiryMs]);

    const pct = remaining / expiryMs;
    const isUrgent = pct < 0.15;
    const isWarning = pct < 0.35;

    const barColor = isUrgent
        ? 'bg-destructive'
        : isWarning
        ? 'bg-pixel-yellow'
        : 'bg-primary';

    const textColor = isUrgent
        ? 'text-destructive'
        : isWarning
        ? 'text-pixel-yellow'
        : 'text-muted-foreground';

    if (compact) {
        return (
        <div className="flex items-center gap-2">
            <div className="w-16 h-1 bg-secondary overflow-hidden">
            <div
                className={`h-full transition-all duration-1000 ${barColor}`}
                style={{ width: `${pct * 100}%` }}
            />
            </div>
            <span className={`font-pixel text-xs ${textColor} tabular-nums`}>
            {formatTime(remaining)}
            </span>
        </div>
        );
    }

    return (
        <div className="flex flex-col gap-1 w-full">
        <div className="flex justify-between items-center">
            <span className="font-pixel text-xs text-muted-foreground">EXPIRES</span>
            <span className={`font-pixel text-xs tabular-nums ${textColor} ${isUrgent ? 'animate-blink' : ''}`}>
            {formatTime(remaining)}
            </span>
        </div>
        <div className="w-full h-1.5 bg-secondary overflow-hidden">
            <div
            className={`h-full transition-all duration-1000 ${barColor}`}
            style={{ width: `${pct * 100}%` }}
            />
        </div>
        </div>
    );
}