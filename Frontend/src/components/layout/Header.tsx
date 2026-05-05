import type { ConnectionStatus } from '../../types';
import { StatusDot } from './StatusDot';
import { PixelButton } from '../ui/Button';

interface HeaderProps {
    username: string;
    status: ConnectionStatus;
    onBack?: () => void;
    backLabel?: string;
    title?: string;
    rightSlot?: React.ReactNode;
}

export function Header({
    username,
    status,
    onBack,
    backLabel = '◀ LOBBY',
    title,
    rightSlot,
    }: HeaderProps) {
    return (
        <header className="sticky top-0 z-30 bg-card/95 border-b-2 border-border backdrop-blur-sm">
        <div className="flex items-center justify-between px-4 py-2 gap-3">
            {/* left */}
            <div className="flex items-center gap-3 min-w-0">
            {onBack ? (
                <PixelButton variant="ghost" size="sm" onClick={onBack}>
                {backLabel}
                </PixelButton>
            ) : (
                <span className="font-pixel text-sm text-primary text-glow-primary tracking-widest">
                KATABI
                </span>
            )}
            {title && (
                <>
                <span className="text-border hidden sm:inline">|</span>
                <span className="font-pixel text-xs text-foreground truncate hidden sm:inline">
                    {title}
                </span>
                </>
            )}
            </div>

            {/* right */}
            <div className="flex items-center gap-3 shrink-0">
            {rightSlot}
            <div className="flex items-center gap-2 border border-border px-2 py-1">
                <span className="font-pixel text-xs text-pixel-cyan truncate max-w-25 sm:max-w-40">
                {username}
                </span>
            </div>
            <StatusDot status={status} />
            </div>
        </div>
        </header>
    );
}