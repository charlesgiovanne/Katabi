import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useSocket } from '../hooks/useSocket';
import { Header } from '../components/layout/Header';
import { RoomCard } from '../components/lobby/RoomCard';
import { CreateRoomModal } from '../components/lobby/CreateRoomModal';
import { JoinRoomModal } from '../components/lobby/JoinRoomModal';
import { PixelButton } from '../components/ui/Button';
import { PixelInput } from '../components/ui/Input';
import type { Room } from '../types';

export default function Lobby() {
    const { user, enterRoom } = useApp();
    const socket = useSocket({ userId: user!.id, currentRoomId: null });

    const [search, setSearch] = useState('');
    const [showCreate, setShowCreate] = useState(false);
    const [joinTarget, setJoinTarget] = useState<Room | null>(null);

    const filtered = useMemo(() => {
        const q = search.trim().toUpperCase();
        if (!q) return socket.rooms;
        return socket.rooms.filter(
        r => r.name.includes(q) || r.keyword.includes(q)
        );
    }, [socket.rooms, search]);

    const handleCreate = (name: string, keyword: string) => {
        const room = socket.createRoom(name, keyword);
        setShowCreate(false);
        // creator enters directly without keyword check
        socket.postSystemMessage(room.id, `${user!.username} CREATED THIS ROOM`);
        enterRoom(room.id);
    };

    const handleJoinConfirm = (room: Room) => {
        socket.postSystemMessage(room.id, `${user!.username} JOINED THE ROOM`);
        enterRoom(room.id);
        setJoinTarget(null);
    };

    return (
        <div className="min-h-screen flex flex-col">
        <Header
            username={user!.username}
            status={socket.status}
            rightSlot={
            <PixelButton variant="accent" size="sm" onClick={() => setShowCreate(true)}>
                + NEW ROOM
            </PixelButton>
            }
        />

        <main className="flex-1 max-w-5xl w-full mx-auto px-4 py-6 flex flex-col gap-5">
            {/* toolbar */}
            <div className="flex items-center gap-3">
            <div className="flex-1">
                <PixelInput
                placeholder="SEARCH ROOMS OR KEYWORDS..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                prefix="⌕"
                />
            </div>
            <PixelButton variant="ghost" size="sm" onClick={socket.syncRooms}>
                ↺ REFRESH
            </PixelButton>
            </div>

            {/* stats bar */}
            <div className="flex items-center gap-4 text-muted-foreground font-pixel text-xs border border-border px-4 py-2 bg-secondary/30">
            <span>
                <span className="text-primary">{socket.rooms.length}</span> ROOMS ACTIVE
            </span>
            <span className="text-border">|</span>
            <span>
                <span className="text-pixel-cyan">{filtered.length}</span> SHOWN
            </span>
            <span className="text-border">|</span>
            <span className="text-muted-foreground/60">ROOMS EXPIRE AFTER 1HR INACTIVITY</span>
            </div>

            {/* room grid */}
            {filtered.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4 py-20 text-center">
                <div className="font-pixel text-5xl text-border select-none">
                {search ? '?' : '∅'}
                </div>
                <p className="font-pixel text-xs text-muted-foreground">
                {search ? 'NO ROOMS MATCH YOUR SEARCH' : 'NO ACTIVE ROOMS'}
                </p>
                {!search && (
                <PixelButton variant="accent" onClick={() => setShowCreate(true)}>
                    + CREATE THE FIRST ROOM
                </PixelButton>
                )}
            </div>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((room, i) => (
                <RoomCard
                    key={room.id}
                    room={room}
                    onJoin={setJoinTarget}
                    expiryMs={socket.EXPIRY_MS}
                    index={i}
                />
                ))}
            </div>
            )}
        </main>

        {/* modals */}
        <CreateRoomModal
            open={showCreate}
            onClose={() => setShowCreate(false)}
            onCreate={handleCreate}
        />
        <JoinRoomModal
            room={joinTarget}
            open={!!joinTarget}
            onClose={() => setJoinTarget(null)}
            onJoin={handleJoinConfirm}
            validateKeyword={socket.validateKeyword}
        />
        </div>
    );
}