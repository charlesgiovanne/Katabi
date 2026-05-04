import { create } from 'zustand';
import type { User, Message, Channel, AppScreen } from '../types';

const USER_COLORS = [
    'var(--pixel-green)',
    'var(--pixel-pink)',
    'var(--pixel-yellow)',
    'var(--pixel-cyan)',
    'var(--pixel-purple)',
];

// Simulated other users
const BOT_USERS: User[] = [
    { id: 'bot-1', username: 'PixelWitch88', color: 'var(--pixel-pink)', joinedAt: Date.now() - 900000 },
    { id: 'bot-2', username: 'RetroNerd', color: 'var(--pixel-cyan)', joinedAt: Date.now() - 600000 },
    { id: 'bot-3', username: 'CRT_Lover', color: 'var(--pixel-yellow)', joinedAt: Date.now() - 300000 },
    { id: 'bot-4', username: 'GlitchMaster', color: 'var(--pixel-purple)', joinedAt: Date.now() - 120000 },
    { id: 'bot-5', username: 'ByteRunner', color: 'var(--pixel-green)', joinedAt: Date.now() - 60000 },
];

const INITIAL_CHANNELS: Channel[] = [
    {
        id: 'ch-general',
        name: 'general',
        description: 'General chatter',
        createdBy: 'system',
        createdAt: Date.now() - 7200000,
        memberCount: 12,
        activeUsers: [BOT_USERS[0], BOT_USERS[1], BOT_USERS[2]],
    },
    {
        id: 'ch-gaming',
        name: 'gaming',
        description: 'Games talk',
        createdBy: 'PixelWitch88',
        createdAt: Date.now() - 3600000,
        memberCount: 7,
        activeUsers: [BOT_USERS[3], BOT_USERS[1]],
    },
    {
        id: 'ch-retro',
        name: 'retro-tech',
        description: 'Retro tech',
        createdBy: 'RetroNerd',
        createdAt: Date.now() - 1800000,
        memberCount: 5,
        activeUsers: [BOT_USERS[4], BOT_USERS[2]],
    },
    {
        id: 'ch-random',
        name: 'random',
        description: 'Anything goes',
        createdBy: 'CRT_Lover',
        createdAt: Date.now() - 900000,
        memberCount: 3,
        activeUsers: [BOT_USERS[0], BOT_USERS[4]],
    },
];

const BOT_MESSAGES: Record<string, string[]> = {
    'ch-general': ['hey everyone!', 'pixel vibes', 'CRT effect 🔥'],
    'ch-gaming': ['NES still king', 'pixel dungeons later?'],
    'ch-retro': ['Commodore 64 ❤️', 'BIOS beep supremacy'],
    'ch-random': ['beep boop', '*static*'],
};

const generateId = () => Math.random().toString(36).slice(2, 10);

const formatTime = (ts: number) => {
    return new Date(ts).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
    });
};

const makeSystemMessage = (channelId: string, text: string): Message => ({
    id: generateId(),
    channelId,
    userId: 'system',
    username: 'SYSTEM',
    userColor: 'var(--pixel-yellow)',
    text,
    timestamp: Date.now(),
    type: 'system',
});

interface AppState {
    screen: AppScreen;
    currentUser: User | null;
    channels: Channel[];
    activeChannel: Channel | null;
    messages: Record<string, Message[]>;
    joinedChannels: Set<string>;

    login: (username: string) => void;
    logout: () => void;
    joinChannel: (id: string) => void;
    leaveChannel: (id: string) => void;
    sendMessage: (id: string, text: string) => void;
    createChannel: (name: string, desc: string) => void;
    setActiveChannel: (ch: Channel | null) => void;
    _scheduleBotMessages: (id: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    screen: 'login',
    currentUser: null,
    channels: INITIAL_CHANNELS,
    activeChannel: null,
    messages: Object.fromEntries(INITIAL_CHANNELS.map(c => [c.id, []])),
    joinedChannels: new Set(),

  // ✅ LOGIN
  login: (username) => {
    const user: User = {
        id: generateId(),
        username,
        color: USER_COLORS[username.length % USER_COLORS.length],
        joinedAt: Date.now(),
    };

    set({ currentUser: user, screen: 'channels' });

    setTimeout(() => {
        set(state => ({
            channels: state.channels.map(ch => ({
            ...ch,
            memberCount: ch.memberCount + Math.floor(Math.random() * 3),
            })),
        }));
        }, 2000);
    },

  // ✅ LOGOUT
    logout: () => {
        const { currentUser } = get();
        if (!currentUser) return;

        set(state => {
        const updatedChannels = state.channels.map(ch =>
            state.joinedChannels.has(ch.id)
            ? {
                ...ch,
                memberCount: Math.max(0, ch.memberCount - 1),
                activeUsers: ch.activeUsers.filter(u => u.id !== currentUser.id),
                }
            : ch
        );

        const updatedMessages = { ...state.messages };

        state.joinedChannels.forEach(id => {
            updatedMessages[id] = [
            ...(updatedMessages[id] ?? []),
            makeSystemMessage(id, `${currentUser.username} left`),
            ];
        });

        return {
            screen: 'login',
            currentUser: null,
            activeChannel: null,
            channels: updatedChannels,
            messages: updatedMessages,
            joinedChannels: new Set(),
        };
        });
    },

  // ✅ JOIN
    joinChannel: (id) => {
        const { currentUser } = get();
        if (!currentUser) return;

        set(state => {
        const channel = state.channels.find(c => c.id === id);
        if (!channel) return state;

        const alreadyJoined = state.joinedChannels.has(id);

        const updatedChannels = state.channels.map(ch =>
            ch.id === id
            ? {
                ...ch,
                memberCount: alreadyJoined ? ch.memberCount : ch.memberCount + 1,
                activeUsers: ch.activeUsers.some(u => u.id === currentUser.id)
                    ? ch.activeUsers
                    : [...ch.activeUsers, currentUser],
                }
            : ch
        );

        return {
            channels: updatedChannels,
            joinedChannels: new Set(state.joinedChannels).add(id),
            activeChannel: updatedChannels.find(c => c.id === id) || null,
            screen: 'chat',
            messages: {
            ...state.messages,
            [id]: [
                ...(state.messages[id] ?? []),
                makeSystemMessage(id, `${currentUser.username} joined #${channel.name}`),
            ],
            },
        };
        });

        get()._scheduleBotMessages(id);
    },

    // ✅ LEAVE
    leaveChannel: (id) => {
        const { currentUser } = get();
        if (!currentUser) return;

        set(state => {
        const channel = state.channels.find(c => c.id === id);
        if (!channel) return state;

        return {
            channels: state.channels.map(ch =>
            ch.id === id
                ? {
                    ...ch,
                    memberCount: Math.max(0, ch.memberCount - 1),
                    activeUsers: ch.activeUsers.filter(u => u.id !== currentUser.id),
                }
                : ch
            ),
            joinedChannels: (() => {
            const s = new Set(state.joinedChannels);
            s.delete(id);
            return s;
            })(),
            activeChannel: null,
            screen: 'channels',
            messages: {
            ...state.messages,
            [id]: [
                ...(state.messages[id] ?? []),
                makeSystemMessage(id, `${currentUser.username} left #${channel.name}`),
            ],
            },
        };
        });
    },

  // ✅ SEND MESSAGE (race-safe)
    sendMessage: (id, text) => {
        const { currentUser } = get();
        if (!currentUser || !text.trim()) return;

        const msg: Message = {
        id: generateId(),
        channelId: id,
        userId: currentUser.id,
        username: currentUser.username,
        userColor: currentUser.color,
        text: text.trim(),
        timestamp: Date.now(),
        type: 'user',
        };

        set(state => ({
        messages: {
            ...state.messages,
            [id]: [...(state.messages[id] ?? []), msg],
        },
        }));
    },

  // ✅ CREATE CHANNEL
    createChannel: (name, desc) => {
        const { currentUser } = get();
        if (!currentUser) return;

        const clean = name.toLowerCase().replace(/[^a-z0-9-]/g, '-');

        set(state => {
        if (state.channels.some(c => c.name === clean)) return state;

        const newCh: Channel = {
            id: `ch-${generateId()}`,
            name: clean,
            description: desc || `Created by ${currentUser.username}`,
            createdBy: currentUser.username,
            createdAt: Date.now(),
            memberCount: 1,
            activeUsers: [currentUser],
        };

        return {
            channels: [...state.channels, newCh],
            messages: { ...state.messages, [newCh.id]: [] },
        };
        });

        get().joinChannel(`ch-${generateId()}`); // optional improvement: store ID first
    },

    setActiveChannel: (ch) => {
        set({ activeChannel: ch, screen: ch ? 'chat' : 'channels' });
    },

  // ✅ BOT SYSTEM (fully safe)
    _scheduleBotMessages: (id) => {
        const botMsgs = BOT_MESSAGES[id] || BOT_MESSAGES['ch-random'];
        const bots = BOT_USERS.slice(0, 3);

        if (bots.length === 0) return;

        botMsgs.forEach((text, i) => {
        const bot = bots[i % bots.length];

        setTimeout(() => {
            set(state => {
            if (!state.joinedChannels.has(id)) return state;

            const msg: Message = {
                id: generateId(),
                channelId: id,
                userId: bot.id,
                username: bot.username,
                userColor: bot.color,
                text,
                timestamp: Date.now(),
                type: 'user',
            };

            return {
                messages: {
                ...state.messages,
                [id]: [...(state.messages[id] ?? []), msg],
                },
            };
            });
        }, 3000 + i * 4000);
        });
    },
}));

export { formatTime };