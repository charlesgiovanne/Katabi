import type { ConnectionStatus } from '../../types';

interface StatusDotProps {
    status: ConnectionStatus;
}

const statusConfig: Record<ConnectionStatus, { color: string; label: string }> = {
    connected: { color: 'bg-primary', label: 'ONLINE' },
    connecting: { color: 'bg-pixel-yellow', label: 'CONNECTING' },
    disconnected: { color: 'bg-destructive', label: 'OFFLINE' },
};

export function StatusDot({ status }: StatusDotProps) {
    const { color, label } = statusConfig[status];
    return (
        <div className="flex items-center gap-1.5">
        <span className={`w-2 h-2 rounded-full ${color} animate-pulse-dot`} />
        <span className="font-pixel text-xs text-muted-foreground hidden sm:inline">
            {label}
        </span>
        </div>
    );
}