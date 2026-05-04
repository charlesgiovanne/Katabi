import { create } from 'zustand';
import type { User, Message, Channel, AppScreen } from '../types';

const USER_COLORS = [
    'var(--pixel-green)',
    'var(--pixel-pink)',
    'var(--pixel-yellow)',
    'var(--pixel-cyan)',
    'var(--pixel-purple)',
];

// Simulated other users for demo
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
        description: 'General chatter for all users',
        createdBy: 'system',
        createdAt: Date.now() - 7200000,
        memberCount: 12,
        activeUsers: [BOT_USERS[0], BOT_USERS[1], BOT_USERS[2]],
    },
    {
        id: 'ch-gaming',
        name: 'gaming',
        description: 'Talk about your favorite games',
        createdBy: 'PixelWitch88',
        createdAt: Date.now() - 3600000,
        memberCount: 7,
        activeUsers: [BOT_USERS[3], BOT_USERS[1]],
    },
    {
        id: 'ch-retro',
        name: 'retro-tech',
        description: 'Old school tech & nostalgia',
        createdBy: 'RetroNerd',
        createdAt: Date.now() - 1800000,
        memberCount: 5,
        activeUsers: [BOT_USERS[4], BOT_USERS[2]],
    },
    {
        id: 'ch-random',
        name: 'random',
        description: 'Anything goes here ¯\\_(ツ)_/¯',
        createdBy: 'CRT_Lover',
        createdAt: Date.now() - 900000,
        memberCount: 3,
        activeUsers: [BOT_USERS[0], BOT_USERS[4]],
    },
];

const BOT_MESSAGES: Record<string, string[]> = {
    'ch-general': [
        'hey everyone! o/',
        'anyone seen the new pixel art tools?',
        'this CRT effect is so sick',
        'just joined from the retro discord',
        'vibes are immaculate in here',
        'brb grabbing snacks',
    ],
    'ch-gaming': [
        'just finished that 8-bit dungeon crawler',
        'anyone wanna run some pixel dungeons later?',
        'old NES games hit different',
        'metroid is still the GOAT',
        'who needs 4k when you have pixel perfection',
    ],
    'ch-retro': [
        'just got a working Commodore 64',
        'terminal aesthetics forever',
        'green phosphor screens >>> everything',
        'anyone else collect old motherboards?',
        'the BIOS beep is my alarm tone lol',
    ],
    'ch-random': [
        'ok who left the floppy disk in the microwave',
        'is this thing on?',
        '*static noises*',
        'beep boop',
        'the matrix has you',
    ],
};

function generateId() {
    return Math.random().toString(36).slice(2, 10);
}

function formatTime(ts: number) {
    return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

function makeSystemMessage(channelId: string, text: string): Message {
    return {
        id: generateId(),
        channelId,
        userId: 'system',
        username: 'SYSTEM',
        userColor: 'var(--pixel-yellow)',
        text,
        timestamp: Date.now(),
        type: 'system',
    };
}

interface AppState {
    screen: AppScreen;
    currentUser: User | null;
    channels: Channel[];
    activeChannel: Channel | null;
    messages: Record<string, Message[]>;
    joinedChannels: Set<string>;

  // Actions
    login: (username: string) => void;
    logout: () => void;
    joinChannel: (channelId: string) => void;
    leaveChannel: (channelId: string) => void;
    sendMessage: (channelId: string, text: string) => void;
    createChannel: (name: string, description: string) => void;
    setActiveChannel: (channel: Channel | null) => void;
    _scheduleBotMessages: (channelId: string) => void;
}

export const useAppStore = create<AppState>((set, get) => ({
    screen: 'login',
    currentUser: null,
    channels: INITIAL_CHANNELS,
    activeChannel: null,
    messages: Object.fromEntries(INITIAL_CHANNELS.map(ch => [ch.id, []])),
    joinedChannels: new Set(),

    login: (username: string) => {
        const colorIndex = username.length % USER_COLORS.length;
        const user: User = {
        id: generateId(),
        username,
        color: USER_COLORS[colorIndex],
        joinedAt: Date.now(),
        };
        set({ currentUser: user, screen: 'channels' });

    // Simulate other users in channels
    setTimeout(() => {
        const state = get();
        const updatedChannels = state.channels.map(ch => ({
            ...ch,
            memberCount: ch.memberCount + Math.floor(Math.random() * 3),
        }));
        set({ channels: updatedChannels });
        }, 2000);
    },

    logout: () => {
        const { currentUser, channels, messages, joinedChannels } = get();
        if (!currentUser) return;

        // Remove user from all joined channels
        const updatedChannels = channels.map(ch => {
        if (joinedChannels.has(ch.id)) {
            return {
            ...ch,
            memberCount: Math.max(0, ch.memberCount - 1),
            activeUsers: ch.activeUsers.filter(u => u.id !== currentUser.id),
            };
        }
        return ch;
    });

    // Add system messages
    const updatedMessages = { ...messages };
    joinedChannels.forEach(chId => {
        updatedMessages[chId] = [
            ...(updatedMessages[chId] || []),
            makeSystemMessage(chId, `${currentUser.username} has left the server`),
        ];
        });

        set({
        screen: 'login',
        currentUser: null,
        activeChannel: null,
        channels: updatedChannels,
        messages: updatedMessages,
        joinedChannels: new Set(),
        });
    },

    joinChannel: (channelId: string) => {
        const { currentUser, channels, messages, joinedChannels } = get();
        if (!currentUser) return;

        const channel = channels.find(c => c.id === channelId);
        if (!channel) return;

        const alreadyJoined = joinedChannels.has(channelId);
        const newJoined = new Set(joinedChannels);
        newJoined.add(channelId);

        const updatedChannels = channels.map(ch =>
        ch.id === channelId
            ? {
                ...ch,
                memberCount: alreadyJoined ? ch.memberCount : ch.memberCount + 1,
                activeUsers: alreadyJoined
                ? ch.activeUsers
                : [...ch.activeUsers, currentUser],
            }
        : ch
    );

    const sysMsg = makeSystemMessage(channelId, `${currentUser.username} has joined #${channel.name}`);
    const updatedMessages = {
        ...messages,
        [channelId]: [...(messages[channelId] || []), sysMsg],
        };

        const updatedChannel = updatedChannels.find(c => c.id === channelId)!;

        set({
        channels: updatedChannels,
        messages: updatedMessages,
        joinedChannels: newJoined,
        activeChannel: updatedChannel,
        screen: 'chat',
    });

    // Simulate bot activity
        get()._scheduleBotMessages(channelId);
    },

    leaveChannel: (channelId: string) => {
        const { currentUser, channels, messages, joinedChannels } = get();
        if (!currentUser) return;

        const channel = channels.find(c => c.id === channelId);
        if (!channel) return;

        const newJoined = new Set(joinedChannels);
        newJoined.delete(channelId);

        const updatedChannels = channels.map(ch =>
        ch.id === channelId
            ? {
                ...ch,
                memberCount: Math.max(0, ch.memberCount - 1),
                activeUsers: ch.activeUsers.filter(u => u.id !== currentUser.id),
            }
            : ch
        );

        const sysMsg = makeSystemMessage(channelId, `${currentUser.username} has left #${channel.name}`);
        const updatedMessages = {
        ...messages,
        [channelId]: [...(messages[channelId] || []), sysMsg],
        };

    set({
        channels: updatedChannels,
        messages: updatedMessages,
        joinedChannels: newJoined,
        activeChannel: null,
        screen: 'channels',
        });
    },

    sendMessage: (channelId: string, text: string) => {
        const { currentUser, messages } = get();
        if (!currentUser || !text.trim()) return;

        const msg: Message = {
        id: generateId(),
        channelId,
        userId: currentUser.id,
        username: currentUser.username,
        userColor: currentUser.color,
        text: text.trim(),
        timestamp: Date.now(),
        type: 'user',
        };

        set({
        messages: {
            ...messages,
            [channelId]: [...(messages[channelId] || []), msg],
        },
        });
    },

    createChannel: (name: string, description: string) => {
        const { currentUser, channels, messages } = get();
        if (!currentUser) return;

        const cleanName = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-');
        const exists = channels.some(c => c.name === cleanName);
        if (exists) return;

        const newChannel: Channel = {
        id: `ch-${generateId()}`,
        name: cleanName,
        description: description || `Created by ${currentUser.username}`,
        createdBy: currentUser.username,
        createdAt: Date.now(),
        memberCount: 1,
        activeUsers: [currentUser],
        };

        set({
        channels: [...channels, newChannel],
        messages: { ...messages, [newChannel.id]: [] },
        });

    // Auto-join the created channel
        get().joinChannel(newChannel.id);
    },

    setActiveChannel: (channel: Channel | null) => {
        set({ activeChannel: channel, screen: channel ? 'chat' : 'channels' });
    },

    // Internal: schedule simulated bot messages
    _scheduleBotMessages: (channelId: string) => {
        const botMsgs = BOT_MESSAGES[channelId] || BOT_MESSAGES['ch-random'];
        const bots = BOT_USERS.slice(0, 3);

        let delay = 3000;
        botMsgs.slice(0, 4).forEach((text, i) => {
        const bot = bots[i % bots.length];
        setTimeout(() => {
            const state = get();
            if (!state.joinedChannels.has(channelId)) return;
            const msg: Message = {
            id: generateId(),
            channelId,
            userId: bot.id,
            username: bot.username,
            userColor: bot.color,
            text,
            timestamp: Date.now(),
            type: 'user',
            };
            set({
            messages: {
                ...state.messages,
                [channelId]: [...(state.messages[channelId] || []), msg],
            },
            });
        }, delay + i * 4000);
        });

    // Occasional new channel by bots
        setTimeout(() => {
        const state = get();
        const newCh: Channel = {
            id: `ch-${generateId()}`,
            name: `pixel-cave-${Math.floor(Math.random() * 99)}`,
            description: 'A mysterious new channel appeared!',
            createdBy: 'PixelWitch88',
            createdAt: Date.now(),
            memberCount: 2,
            activeUsers: [BOT_USERS[0], BOT_USERS[1]],
        };
        if (!state.channels.find(c => c.name === newCh.name)) {
            set({
            channels: [...state.channels, newCh],
            messages: { ...state.messages, [newCh.id]: [] },
            });
        }
        }, 12000);
    },
    } as AppState));

export { formatTime };
