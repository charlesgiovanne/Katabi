import { useState, useEffect, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { PixelInput } from '../components/ui/Input';
import { PixelButton } from '../components/ui/Button';
import { generateUsername } from '../utils/nameGen';

const BOOT_LINES = [
    'KATABI OS v2.4.1',
    'INITIALIZING SUBSYSTEMS...',
    'LOADING MEMORY BANKS.........OK',
    'CHECKING NETWORK UPLINK......OK',
    'SYNCING BROADCAST CHANNELS...OK',
    'MOUNTING VIRTUAL TERMINALS...OK',
    '─────────────────────────────',
    'SYSTEM READY.',
    '',
];

const BOOT_DELAY = 90; // ms per line

export default function Landing() {
    const { setUser, navigateTo } = useApp();

    const [bootLines, setBootLines] = useState<string[]>([]);
    const [bootDone, setBootDone] = useState(false);

    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    // popup state
    const [showInfo, setShowInfo] = useState(true);

    const inputRef = useRef<HTMLInputElement>(null);

    // boot sequence
    useEffect(() => {
        let i = 0;

        const next = () => {
            if (i >= BOOT_LINES.length) {
                setBootDone(true);
                return;
            }

            setBootLines(prev => [...prev, BOOT_LINES[i]]);
            i++;

            setTimeout(next, BOOT_DELAY + Math.random() * 60);
        };

        const t = setTimeout(next, 300);

        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (bootDone) {
            const gen = generateUsername();

            setUsername(gen);

            setTimeout(() => inputRef.current?.focus(), 100);
        }
    }, [bootDone]);

    const handleSubmit = () => {
        const trimmed = username.trim();

        if (!trimmed) {
            setError('CALLSIGN REQUIRED');
            return;
        }

        if (trimmed.length < 2) {
            setError('TOO SHORT (MIN 2 CHARS)');
            return;
        }

        if (trimmed.length > 28) {
            setError('TOO LONG (MAX 28 CHARS)');
            return;
        }

        if (!/^[A-Za-z0-9_\-]+$/.test(trimmed)) {
            setError('ALPHANUMERIC + _ - ONLY');
            return;
        }

        const id = crypto.randomUUID();

        setUser({
            id,
            username: trimmed.toUpperCase(),
        });

        navigateTo('lobby');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-crt relative">

            {/* INFO POPUP */}
            {showInfo && (
                <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 px-4">
                    <div className="w-full max-w-2xl border-2 border-border bg-card pixel-shadow-primary animate-pop max-h-[90vh] overflow-y-auto">

                        {/* popup title */}
                        <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-secondary sticky top-0">
                            <span className="font-pixel text-xs text-primary">
                                ABOUT KATABI
                            </span>

                            <button
                                onClick={() => setShowInfo(false)}
                                className="font-pixel text-xs text-muted-foreground hover:text-primary"
                            >
                                ✕
                            </button>
                        </div>

                        {/* popup body */}
                        <div className="p-6 flex flex-col gap-6 font-mono-pixel text-sm text-muted-foreground leading-relaxed">

                            <div>
                                <span className="text-primary">KATABI</span> is a
                                real-time multi-user communication platform inspired by
                                classic retro computer terminals, old-school online chat
                                systems, and pixel-art interfaces. The system is designed
                                to simulate a digital underground network where users can
                                instantly connect, create rooms, exchange live messages,
                                and interact with other participants inside synchronized
                                virtual spaces.
                            </div>

                            <div>
                                Unlike traditional messaging platforms that rely on page
                                reloads or delayed updates, KATABI operates using
                                real-time communication technology that allows all users
                                connected to a room to receive updates immediately.
                                Messages, room activity, user joins, and interactions are
                                synchronized live across the network to create a smooth,
                                fast, and immersive experience.
                            </div>

                            <div>
                                The platform focuses on simplicity, speed, and lightweight
                                communication. Users can enter the network by selecting a
                                unique callsign, then join or create temporary discussion
                                rooms. Every connected participant inside a room can send
                                and receive messages instantly without needing to refresh
                                the application.
                            </div>

                            <div>
                                KATABI also uses an ephemeral room system. Rooms are not
                                designed to exist permanently. Instead, inactive rooms are
                                automatically removed after a period of inactivity to keep
                                the system lightweight, dynamic, and continuously refreshed.
                                This creates temporary digital spaces that feel active and
                                event-driven rather than static or overcrowded.
                            </div>

                            <div>
                                The application demonstrates several important concepts
                                commonly used in modern distributed and concurrent systems,
                                including:
                            </div>

                            <ul className="list-disc pl-6 space-y-2">
                                <li>Real-time client-server communication</li>
                                <li>Multi-user synchronization</li>
                                <li>Concurrent connection handling</li>
                                <li>Dynamic room management</li>
                                <li>Event broadcasting</li>
                                <li>Live state updates without page refresh</li>
                                <li>Temporary in-memory or persistent session handling</li>
                                <li>Responsive user interaction pipelines</li>
                            </ul>

                            <div>
                                The visual design of the platform is heavily influenced by
                                vintage CRT monitors, command-line terminals, cyberpunk
                                interfaces, and retro operating systems. Scanline effects,
                                glowing text, pixel typography, and animated terminal
                                components are intentionally used to create a nostalgic
                                digital atmosphere while still maintaining modern usability.
                            </div>

                            <div>
                                Users entering the system are assigned a digital identity
                                through their chosen callsign. Callsigns must follow
                                network formatting rules and are automatically normalized
                                into uppercase identifiers for consistency across the
                                platform.
                            </div>

                            <div className="border border-border/50 bg-secondary/10 p-4">
                                <div className="text-primary mb-2">
                                    NETWORK RULES
                                </div>

                                <ul className="list-disc pl-5 space-y-2">
                                    <li>
                                        Callsigns must contain 2–28 valid characters.
                                    </li>

                                    <li>
                                        Only letters, numbers, underscores, and hyphens
                                        are allowed.
                                    </li>

                                    <li>
                                        Rooms automatically expire after 1 hour of inactivity.
                                    </li>

                                    <li>
                                        Messages are synchronized instantly across connected users.
                                    </li>

                                    <li>
                                        The network is designed for lightweight temporary interaction.
                                    </li>
                                </ul>
                            </div>

                            <div>
                                KATABI is more than a chat application — it is a simulation
                                of a live digital network environment combining retro
                                aesthetics with modern real-time system architecture.
                            </div>

                            <PixelButton
                                variant="primary"
                                onClick={() => setShowInfo(false)}
                            >
                                ▶ ENTER NETWORK
                            </PixelButton>
                        </div>
                    </div>
                </div>
            )}

            {/* CRT terminal */}
            <div className="w-full max-w-lg bg-card border-2 border-border pixel-shadow-primary">

                {/* title bar */}
                <div className="flex items-center gap-2 px-4 py-2 bg-secondary border-b border-border">
                    <span className="w-2.5 h-2.5 bg-destructive" />
                    <span className="w-2.5 h-2.5 bg-pixel-yellow" />
                    <span className="w-2.5 h-2.5 bg-primary" />

                    <span className="font-pixel text-xs text-muted-foreground ml-2">
                        TERMINAL — KATABI
                    </span>
                </div>

                {/* terminal body */}
                <div className="p-5 font-mono-pixel text-lg min-h-65">
                    {bootLines.map((line, i) => (
                        <div
                            key={i}
                            className={line === '' ? 'h-3' : ''}
                        >
                            {line && (
                                <span
                                    className={
                                        line.startsWith('PIXELCHAT')
                                            ? 'text-primary text-glow-primary font-pixel text-xs'
                                            : line.startsWith('─') || line === 'SYSTEM READY.'
                                            ? 'text-pixel-yellow'
                                            : 'text-foreground'
                                    }
                                >
                                    {line.includes('OK') ? (
                                        <>
                                            <span className="text-muted-foreground">
                                                {line.replace('OK', '')}
                                            </span>

                                            <span className="text-primary text-glow-primary">
                                                OK
                                            </span>
                                        </>
                                    ) : (
                                        line
                                    )}
                                </span>
                            )}
                        </div>
                    ))}

                    {/* blinking cursor during boot */}
                    {!bootDone && (
                        <span className="text-primary animate-blink">█</span>
                    )}
                </div>

                {/* input section */}
                {bootDone && (
                    <div className="px-5 pb-5 flex flex-col gap-4 border-t border-border pt-4 animate-pop">

                        <div className="flex items-center justify-between gap-3">
                            <div className="font-mono-pixel text-base text-muted-foreground">
                                ENTER YOUR CALLSIGN TO JOIN THE NETWORK:
                            </div>

                            <button
                                onClick={() => setShowInfo(true)}
                                className="font-pixel text-[10px] border border-border px-2 py-1 hover:bg-secondary text-primary"
                            >
                                ABOUT
                            </button>
                        </div>

                        {/* guide */}
                        <div className="font-mono-pixel text-xs text-muted-foreground/80 leading-relaxed border border-border/50 bg-secondary/10 p-3">
                            Choose a callsign to enter the network.
                            Use 2–28 characters only.
                            Letters, numbers, underscore (_), and hyphen (-) are allowed.
                            Your name will appear in uppercase.
                        </div>

                        <PixelInput
                            ref={inputRef}
                            prefix="▸"
                            placeholder="YOUR CALLSIGN"
                            value={username}
                            onChange={e => {
                                setUsername(e.target.value.toUpperCase());
                                setError('');
                            }}
                            onKeyDown={e =>
                                e.key === 'Enter' && handleSubmit()
                            }
                            error={error}
                            maxLength={28}
                        />

                        <div className="flex gap-3">
                            <PixelButton
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                    setUsername(generateUsername());
                                    setError('');
                                }}
                            >
                                ⚄ RANDOM
                            </PixelButton>

                            <PixelButton
                                variant="primary"
                                fullWidth
                                onClick={handleSubmit}
                            >
                                ▶ CONNECT
                            </PixelButton>
                        </div>
                    </div>
                )}
            </div>

            {/* footer marquee */}
            <div className="mt-6 w-full max-w-lg overflow-hidden border border-border/50 bg-secondary/20 py-1">
                <div className="animate-marquee whitespace-nowrap font-pixel text-xs text-muted-foreground/50 tracking-widest">
                    ★ KATABI — EPHEMERAL ROOMS — MULTI-USER — RETRO VIBES —
                    ROOMS EXPIRE AFTER 1HR INACTIVITY ★ KATABI ★
                </div>
            </div>
        </div>
    );
}