import type { Room } from '../../types';
import { PixelButton } from '../ui/Button';
import { RoomTimer } from './RoomTimer';

interface RoomCardProps {
    room: Room;
    onJoin: (room: Room) => void;
    expiryMs: number;
    index?: number;
}

export function RoomCard({ room, onJoin, expiryMs, index = 0 }: RoomCardProps) {
    const pct = Math.max(0, expiryMs - (Date.now() - room.lastActivity)) / expiryMs;
    const isUrgent = pct < 0.15;

    return (
        <div
        className={[
            'bg-card border-2 transition-all duration-150 cursor-default',
            'hover:border-primary hover:-translate-y-0.5',
            'animate-channel',
            isUrgent ? 'border-destructive/60' : 'border-border',
        ].join(' ')}
        style={{ animationDelay: `${index * 0.04}s` }}
        >
        {/* header stripe */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-border bg-secondary/50">
            <div className="flex items-center gap-2">
            <span className="text-primary text-glow-primary text-base">▸</span>
            <span className="font-pixel text-xs text-foreground tracking-wider truncate max-w-35">
                {room.name}
            </span>
            </div>
            {/* live dot */}
            <div className="flex items-center gap-1.5">
            <span
                className={`w-1.5 h-1.5 rounded-full ${
                isUrgent ? 'bg-destructive animate-pulse-dot' : 'bg-primary animate-pulse-dot'
                }`}
            />
            <span className="font-pixel text-xs text-muted-foreground">
                {room.userCount} {room.userCount === 1 ? 'USER' : 'USERS'}
            </span>
            </div>
        </div>

        {/* body */}
        <div className="px-3 py-3 flex flex-col gap-3">
            {/* keyword badge */}
            <div className="flex items-center gap-2">
            <span className="font-pixel text-xs text-muted-foreground">KEY</span>
            <span className="font-mono-pixel text-base text-pixel-cyan bg-secondary px-2 py-0.5 border border-border">
                {room.keyword}
            </span>
            </div>

            {/* timer */}
            <RoomTimer room={room} expiryMs={expiryMs} compact />

            {/* action */}
            <PixelButton
            variant="primary"
            size="sm"
            fullWidth
            onClick={() => onJoin(room)}
            >
            ▶ JOIN
            </PixelButton>
        </div>
        </div>
    );
}