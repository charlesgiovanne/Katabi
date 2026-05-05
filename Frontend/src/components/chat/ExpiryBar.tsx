import { useState, useEffect } from 'react';
import type { Room } from '../../types';

interface ExpiryBarProps {
    room: Room;
    expiryMs: number;
}

export function ExpiryBar({ room, expiryMs }: ExpiryBarProps) {
    const [pct, setPct] = useState(
        Math.max(0, (expiryMs - (Date.now() - room.lastActivity)) / expiryMs)
    );

    useEffect(() => {
        setPct(Math.max(0, (expiryMs - (Date.now() - room.lastActivity)) / expiryMs));
        const iv = setInterval(() => {
        setPct(Math.max(0, (expiryMs - (Date.now() - room.lastActivity)) / expiryMs));
        }, 2000);
        return () => clearInterval(iv);
    }, [room.lastActivity, expiryMs]);

    const color =
        pct < 0.15 ? 'bg-destructive' : pct < 0.35 ? 'bg-pixel-yellow' : 'bg-primary';

    return (
        <div className="w-full h-0.5 bg-secondary">
        <div
            className={`h-full transition-all duration-2000 ${color}`}
            style={{ width: `${pct * 100}%` }}
        />
        </div>
    );
}