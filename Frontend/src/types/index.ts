export interface User {
    id: string;
    username: string;
    color: string; // assigned pixel color
    joinedAt: number;
}

export interface Message {
    id: string;
    channelId: string;
    userId: string;
    username: string;
    userColor: string;
    text: string;
    timestamp: number;
    type: 'user' | 'system';
}

export interface Channel {
    id: string;
    name: string;
    description: string;
    createdBy: string;
    createdAt: number;
    memberCount: number;
    activeUsers: User[];
    }

export type AppScreen = 'login' | 'channels' | 'chat';