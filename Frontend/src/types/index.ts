export interface User {
    id: string;
    username: string;
}

export interface Room {
    id: string;
    name: string;
    keyword: string;
    userCount: number;
    createdAt: number;
    lastActivity: number;
    creatorId: string;
}

export interface Message {
    id: string;
    roomId: string;
    userId: string;
    username: string;
    content: string;
    timestamp: number;
    type: 'user' | 'system';
}

export type ConnectionStatus = 'connected' | 'connecting' | 'disconnected';
export type Page = 'landing' | 'lobby' | 'chat';

export interface BroadcastPayload {
    type:
        | 'ROOMS_UPDATED'
        | 'MESSAGE_SENT'
        | 'USER_JOINED'
        | 'USER_LEFT'
        | 'ROOM_EXPIRED';
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any;
    senderId: string;
}