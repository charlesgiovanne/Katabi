import { useState, useEffect, useCallback, useRef } from 'react';
import type { Room, Message, ConnectionStatus, BroadcastPayload } from '../types';

const STORAGE_ROOMS = 'pixelchat_rooms';
const STORAGE_MSGS = (id: string) => `pixelchat_msgs_${id}`;
const STORAGE_USERS = (id: string) => `pixelchat_users_${id}`;
const CHANNEL_NAME = 'pixelchat_channel';
const EXPIRY_MS = 60 * 60 * 1000; // 1 hour
const CHECK_INTERVAL = 30_000; // 30 sec

function readRooms(): Room[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_ROOMS) || '[]');
    } catch { return []; }
}

function saveRooms(rooms: Room[]) {
    localStorage.setItem(STORAGE_ROOMS, JSON.stringify(rooms));
}

function readMessages(roomId: string): Message[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_MSGS(roomId)) || '[]');
    } catch { return []; }
}

function saveMessages(roomId: string, messages: Message[]) {
    localStorage.setItem(STORAGE_MSGS(roomId), JSON.stringify(messages));
}

function readActiveUsers(roomId: string): string[] {
    try {
        return JSON.parse(localStorage.getItem(STORAGE_USERS(roomId)) || '[]');
    } catch { return []; }
}

function saveActiveUsers(roomId: string, users: string[]) {
    localStorage.setItem(STORAGE_USERS(roomId), JSON.stringify(users));
}

// ─── hook ──────────────────────────────────────────────────────────────────

interface UseSocketOptions {
    userId: string;
    currentRoomId: string | null;
}

export function useSocket({ userId, currentRoomId }: UseSocketOptions) {
    const [status, setStatus] = useState<ConnectionStatus>('connecting');
    const [rooms, setRooms] = useState<Room[]>([]);
    const [messages, setMessages] = useState<Message[]>([]);
    const channelRef = useRef<BroadcastChannel | null>(null);

    // sync rooms from localStorage
    const syncRooms = useCallback(() => {
        const now = Date.now();
        let all = readRooms();
        // prune expired
        const active = all.filter(r => now - r.lastActivity < EXPIRY_MS);
        if (active.length !== all.length) {
        saveRooms(active);
        all = active;
        }
        // compute live user counts from active user lists
        const withCounts = all.map(r => ({
        ...r,
        userCount: readActiveUsers(r.id).length,
        }));
        setRooms(withCounts);
    }, []);

    // sync messages for current room
    const syncMessages = useCallback(() => {
        if (!currentRoomId) { setMessages([]); return; }
        setMessages(readMessages(currentRoomId));
    }, [currentRoomId]);

    // broadcast helper
    const broadcast = useCallback((payload: BroadcastPayload) => {
        channelRef.current?.postMessage(payload);
    }, []);

    // ── init ──────────────────────────────────────────────────────────────────
    useEffect(() => {
        setStatus('connecting');
        const ch = new BroadcastChannel(CHANNEL_NAME);
        channelRef.current = ch;

        ch.onmessage = (e: MessageEvent<BroadcastPayload>) => {
        const { type } = e.data;
        if (type === 'ROOMS_UPDATED' || type === 'ROOM_EXPIRED' ||
            type === 'USER_JOINED' || type === 'USER_LEFT') {
            syncRooms();
        }
        if (type === 'MESSAGE_SENT') {
            syncMessages();
        }
        };

        syncRooms();
        setStatus('connected');

        // periodic expiry check
        const timer = setInterval(() => {
        const now = Date.now();
        const all = readRooms();
        const active = all.filter(r => now - r.lastActivity < EXPIRY_MS);
        if (active.length !== all.length) {
            saveRooms(active);
            broadcast({ type: 'ROOM_EXPIRED', data: null, senderId: userId });
            syncRooms();
        }
        }, CHECK_INTERVAL);

        return () => {
        ch.close();
        clearInterval(timer);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [userId]);

    // sync messages when room changes
    useEffect(() => {
        syncMessages();
    }, [syncMessages]);

    // ── track presence ─────────────────────────────────────────────────────────
    useEffect(() => {
        if (!userId) return;
        // remove user from any room they might be lingering in (tab navigation)
        // We track which room this tab is in via sessionStorage
        const prevRoom = sessionStorage.getItem('pixelchat_active_room');
        if (prevRoom && prevRoom !== currentRoomId) {
        const users = readActiveUsers(prevRoom).filter(u => u !== userId);
        saveActiveUsers(prevRoom, users);
        broadcast({ type: 'USER_LEFT', data: { roomId: prevRoom, userId }, senderId: userId });
        }

        if (currentRoomId) {
        const users = readActiveUsers(currentRoomId);
        if (!users.includes(userId)) {
            saveActiveUsers(currentRoomId, [...users, userId]);
            broadcast({ type: 'USER_JOINED', data: { roomId: currentRoomId, userId }, senderId: userId });
        }
        sessionStorage.setItem('pixelchat_active_room', currentRoomId);
        } else {
        sessionStorage.removeItem('pixelchat_active_room');
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [currentRoomId, userId]);

    // clean up presence on unmount / tab close
    useEffect(() => {
        const cleanup = () => {
        if (!userId) return;
        const activeRoom = sessionStorage.getItem('pixelchat_active_room');
        if (activeRoom) {
            const users = readActiveUsers(activeRoom).filter(u => u !== userId);
            saveActiveUsers(activeRoom, users);
        }
        };
        window.addEventListener('beforeunload', cleanup);
        return () => {
        cleanup();
        window.removeEventListener('beforeunload', cleanup);
        };
    }, [userId]);

    // ── actions ───────────────────────────────────────────────────────────────

    const createRoom = useCallback((name: string, keyword: string): Room => {
        const room: Room = {
        id: crypto.randomUUID(),
        name: name.toUpperCase().trim(),
        keyword: keyword.toUpperCase().trim(),
        userCount: 0,
        createdAt: Date.now(),
        lastActivity: Date.now(),
        creatorId: userId,
        };
        const rooms = readRooms();
        saveRooms([...rooms, room]);
        broadcast({ type: 'ROOMS_UPDATED', data: null, senderId: userId });
        syncRooms();
        return room;
    }, [userId, broadcast, syncRooms]);

    const sendMessage = useCallback((roomId: string, content: string) => {
        // This import creates a circular dep risk; pass user from outside
        const msg: Message = {
        id: crypto.randomUUID(),
        roomId,
        userId,
        username: sessionStorage.getItem('pixelchat_username') || userId,
        content,
        timestamp: Date.now(),
        type: 'user',
        };
        const msgs = readMessages(roomId);
        saveMessages(roomId, [...msgs, msg]);

        // reset expiry
        const rooms = readRooms();
        const updated = rooms.map(r =>
        r.id === roomId ? { ...r, lastActivity: Date.now() } : r
        );
        saveRooms(updated);

        broadcast({ type: 'MESSAGE_SENT', data: msg, senderId: userId });
        syncMessages();
        syncRooms();
    }, [userId, broadcast, syncMessages, syncRooms]);

    const postSystemMessage = useCallback((roomId: string, content: string) => {
        const msg: Message = {
        id: crypto.randomUUID(),
        roomId,
        userId: 'system',
        username: 'SYSTEM',
        content,
        timestamp: Date.now(),
        type: 'system',
        };
        const msgs = readMessages(roomId);
        saveMessages(roomId, [...msgs, msg]);
        broadcast({ type: 'MESSAGE_SENT', data: msg, senderId: 'system' });
        syncMessages();
    }, [broadcast, syncMessages]);

    const validateKeyword = useCallback((roomId: string, keyword: string): boolean => {
        const room = readRooms().find(r => r.id === roomId);
        return room?.keyword === keyword.toUpperCase().trim();
    }, []);

    const getRoomById = useCallback((roomId: string): Room | undefined => {
        return readRooms().find(r => r.id === roomId);
    }, []);

    const getRemainingMs = useCallback((room: Room): number => {
        return Math.max(0, EXPIRY_MS - (Date.now() - room.lastActivity));
    }, []);

    return {
        status,
        rooms,
        messages,
        createRoom,
        sendMessage,
        postSystemMessage,
        validateKeyword,
        getRoomById,
        getRemainingMs,
        syncRooms,
        EXPIRY_MS,
    };
}