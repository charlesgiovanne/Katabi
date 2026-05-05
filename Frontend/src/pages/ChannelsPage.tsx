import { useState } from 'react';
import { useAppStore } from '../store/UseAppStore';
import type { Channel } from '../types';
import { PixelButton } from '../components/ui/Button';
import { PixelInput } from '../components/ui/Input';
import { OnlineDot } from '../components/OnlineDot';

function formatTimeAgo(ts: number) {
    const diff = Date.now() - ts;
    if (diff < 60000) return 'just now';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return `${Math.floor(diff / 86400000)}d ago`;
}

function ChannelCard({ channel, onJoin, isJoined }: { channel: Channel; onJoin: () => void; isJoined: boolean }) {
    return (
    <div className="bg-card pixel-border pixel-shadow animate-channel hover:brightness-110 transition-all group cursor-pointer" onClick={onJoin}>
        <div className="p-4 flex flex-col gap-2">
            <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
                <span className="text-accent font-pixel text-sm shrink-0">#</span>
                <span className="font-pixel text-[10px] text-foreground truncate group-hover:text-primary transition-colors">
                {channel.name}
                </span>
                {isJoined && (
                <span className="font-pixel text-[6px] text-primary border border-primary px-1 shrink-0">JOINED</span>
                )}
            </div>
            <div className="flex items-center gap-1 shrink-0">
                <OnlineDot size={6} />
                <span className="font-mono-pixel text-muted-foreground text-sm">{channel.memberCount}</span>
            </div>
        </div>

        <p className="font-mono-pixel text-muted-foreground text-sm leading-tight">
            {channel.description}
        </p>

        <div className="flex items-center justify-between pt-1">
            <div className="flex items-center gap-1">
                {channel.activeUsers.slice(0, 3).map(u => (
                <span
                    key={u.id}
                    className="font-pixel text-[6px] px-1 py-0.5"
                    style={{ color: u.color, border: `1px solid ${u.color}` }}
                    title={u.username}
                >
                    {u.username.slice(0, 4)}
                </span>
                ))}
                {channel.activeUsers.length > 3 && (
                <span className="font-pixel text-[6px] text-muted-foreground">+{channel.activeUsers.length - 3}</span>
                )}
            </div>
            <span className="font-pixel text-[6px] text-muted-foreground">{formatTimeAgo(channel.createdAt)}</span>
            </div>
        </div>

        <div className="px-4 pb-3">
            <PixelButton
            variant={isJoined ? 'primary' : 'ghost'}
            size="sm"
            className="w-full"
            onClick={e => { e.stopPropagation(); onJoin(); }}
            >
            {isJoined ? '▶ OPEN' : '+ JOIN'}
            </PixelButton>
        </div>
        </div>
    );
}

function CreateChannelModal({ onClose }: { onClose: () => void }) {
    const createChannel = useAppStore(s => s.createChannel);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [error, setError] = useState('');

    const handleCreate = () => {
        if (!name.trim()) { setError('Channel name required'); return; }
        if (name.trim().length < 2) { setError('Min 2 characters'); return; }
        createChannel(name.trim(), description.trim());
        onClose();
    };

    return (
        <div className="fixed inset-0 z-40 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/70" onClick={onClose} />
        <div className="relative bg-card pixel-border pixel-shadow-accent w-full max-w-sm animate-pop">
            <div className="bg-accent text-accent-foreground font-pixel text-[8px] px-4 py-2 flex items-center justify-between">
            <span>CREATE CHANNEL</span>
            <button onClick={onClose} className="hover:opacity-70">✕</button>
            </div>
            <div className="p-5 flex flex-col gap-4">
            <PixelInput
                label="Channel Name"
                placeholder="my-cool-channel"
                value={name}
                onChange={e => { setName(e.target.value); setError(''); }}
                error={error}
                autoFocus
                maxLength={24}
            />
            <PixelInput
                label="Description (optional)"
                placeholder="what's this channel about?"
                value={description}
                onChange={e => setDescription(e.target.value)}
                maxLength={60}
            />
            <div className="flex gap-3 pt-2">
                <PixelButton variant="ghost" size="sm" className="flex-1" onClick={onClose}>
                CANCEL
                </PixelButton>
                <PixelButton variant="accent" size="sm" className="flex-1" onClick={handleCreate}>
                CREATE ▶
                </PixelButton>
            </div>
            </div>
        </div>
        </div>
    );
}

export function ChannelsPage() {
    const { currentUser, channels, joinedChannels, joinChannel, logout } = useAppStore(s => ({
        currentUser: s.currentUser,
        channels: s.channels,
        joinedChannels: s.joinedChannels,
        joinChannel: s.joinChannel,
        logout: s.logout,
    }));

    const [showCreate, setShowCreate] = useState(false);
    const [search, setSearch] = useState('');

    const filtered = channels.filter(
        c =>
        c.name.toLowerCase().includes(search.toLowerCase()) ||
        c.description.toLowerCase().includes(search.toLowerCase())
    );

    const joined = filtered.filter(c => joinedChannels.has(c.id));
    const notJoined = filtered.filter(c => !joinedChannels.has(c.id));

    return (
        <div className="min-h-screen flex flex-col">
        {/* Top bar */}
        <header className="bg-card border-b border-border px-4 py-3 flex items-center justify-between sticky top-0 z-20 pixel-shadow">
            <div className="flex items-center gap-3">
            <h1 className="text-xs text-primary text-glow-primary">PIXELCHAT</h1>
            <span className="font-pixel text-[6px] text-muted-foreground">/ CHANNELS</span>
            </div>
            <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
                <OnlineDot size={8} />
                <span className="font-pixel text-[8px]" style={{ color: currentUser?.color }}>
                {currentUser?.username}
                </span>
            </div>
            <PixelButton variant="danger" size="sm" onClick={logout}>
                LOGOUT
            </PixelButton>
            </div>
        </header>

        <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 flex flex-col gap-6">
            {/* Actions row */}
            <div className="flex gap-3 items-stretch">
            <div className="flex-1">
                <PixelInput
                placeholder="search channels..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                />
            </div>
            <PixelButton variant="accent" size="md" onClick={() => setShowCreate(true)}>
                + NEW
            </PixelButton>
            </div>

            {/* Stats bar */}
            <div className="flex gap-6 font-pixel text-[7px]">
            <span className="text-muted-foreground">
                CHANNELS: <span className="text-primary">{channels.length}</span>
            </span>
            <span className="text-muted-foreground">
                JOINED: <span className="text-accent">{joinedChannels.size}</span>
            </span>
            <span className="text-muted-foreground flex items-center gap-1">
                <OnlineDot size={5} />
                ONLINE: <span className="text-pixel-green ml-1">{channels.reduce((n, c) => n + c.activeUsers.length, 0)}</span>
            </span>
            </div>

            {/* Joined channels */}
            {joined.length > 0 && (
            <section className="flex flex-col gap-3">
                <div className="flex items-center gap-2">
                <span className="font-pixel text-[7px] text-accent">YOUR CHANNELS</span>
                <div className="flex-1 h-px bg-border" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {joined.map((ch, i) => (
                    <div key={ch.id} style={{ animationDelay: `${i * 0.05}s` }}>
                    <ChannelCard
                        channel={ch}
                        isJoined
                        onJoin={() => joinChannel(ch.id)}
                    />
                    </div>
                ))}
                </div>
            </section>
            )}

            {/* All channels */}
            <section className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <span className="font-pixel text-[7px] text-muted-foreground">
                {joined.length > 0 ? 'DISCOVER' : 'ALL CHANNELS'}
                </span>
                <div className="flex-1 h-px bg-border" />
            </div>
            {notJoined.length === 0 && joined.length > 0 && (
                <p className="font-mono-pixel text-muted-foreground text-center py-4">
                You've joined all channels! Create a new one?
                </p>
            )}
            {filtered.length === 0 && (
                <p className="font-mono-pixel text-muted-foreground text-center py-4">
                No channels found for "{search}"
                </p>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {notJoined.map((ch, i) => (
                <div key={ch.id} style={{ animationDelay: `${i * 0.05}s` }}>
                    <ChannelCard
                    channel={ch}
                    isJoined={false}
                    onJoin={() => joinChannel(ch.id)}
                    />
                </div>
                ))}
            </div>
            </section>
        </main>

        {showCreate && <CreateChannelModal onClose={() => setShowCreate(false)} />}
        </div>
    );
}
