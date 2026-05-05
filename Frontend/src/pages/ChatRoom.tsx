import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useSocket } from '../hooks/useSocket';
import { Header } from '../components/layout/Header';
import { MessageList } from '../components/chat/MessageList';
import { MessageInput } from '../components/chat/MessageInput';
import { ExpiryBar } from '../components/chat/ExpiryBar';
import { RoomTimer } from '../components/lobby/RoomTimer';

export default function ChatRoom() {
    const { user, currentRoomId, leaveRoom } = useApp();
    const socket = useSocket({ userId: user!.id, currentRoomId });

    const room = socket.getRoomById(currentRoomId!);

    // if room doesn't exist, go back to lobby
    useEffect(() => {
        if (!room && socket.status === 'connected') {
        leaveRoom();
        }
    }, [room, socket.status, leaveRoom]);

    // keep syncing room data for live user count / expiry
    useEffect(() => {
        const iv = setInterval(socket.syncRooms, 10_000);
        return () => clearInterval(iv);
    }, [socket.syncRooms]);

    const handleLeave = () => {
        if (room) {
        socket.postSystemMessage(room.id, `${user!.username} LEFT THE ROOM`);
        }
        leaveRoom();
    };

    const handleSend = (content: string) => {
        if (!currentRoomId) return;
        socket.sendMessage(currentRoomId, content);
    };

    if (!room) {
        return (
        <div className="min-h-screen flex items-center justify-center">
            <div className="font-pixel text-xs text-muted-foreground animate-blink">
            LOADING...
            </div>
        </div>
        );
    }

    return (
        <div className="h-screen flex flex-col">
        <Header
            username={user!.username}
            status={socket.status}
            onBack={handleLeave}
            title={room.name}
            rightSlot={
            <div className="hidden sm:flex items-center gap-3">
                {/* users online */}
                <div className="flex items-center gap-1.5 border border-border px-2 py-1">
                <span className="w-1.5 h-1.5 bg-primary animate-pulse-dot rounded-full" />
                <span className="font-pixel text-xs text-muted-foreground">
                    {room.userCount} ONLINE
                </span>
                </div>
                {/* timer */}
                <RoomTimer room={room} expiryMs={socket.EXPIRY_MS} compact />
            </div>
            }
        />

        {/* expiry bar below header */}
        <ExpiryBar room={room} expiryMs={socket.EXPIRY_MS} />

        {/* room info strip */}
        <div className="flex items-center gap-4 px-4 py-2 bg-secondary/30 border-b border-border shrink-0">
            <div className="flex items-center gap-2">
            <span className="font-pixel text-xs text-muted-foreground">ROOM</span>
            <span className="font-pixel text-xs text-primary text-glow-primary">{room.name}</span>
            </div>
            <div className="flex items-center gap-2">
            <span className="font-pixel text-xs text-muted-foreground">KEY</span>
            <span className="font-mono-pixel text-base text-pixel-cyan">{room.keyword}</span>
            </div>
            {/* mobile timer */}
            <div className="flex sm:hidden ml-auto">
            <RoomTimer room={room} expiryMs={socket.EXPIRY_MS} compact />
            </div>
        </div>

        {/* messages */}
        <MessageList
            messages={socket.messages}
            currentUserId={user!.id}
        />

        {/* input */}
        <MessageInput onSend={handleSend} />
        </div>
    );
}