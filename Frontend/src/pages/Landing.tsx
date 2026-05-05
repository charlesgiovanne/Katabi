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
    const inputRef = useRef<HTMLInputElement>(null);

    // boot sequence
    useEffect(() => {
        let i = 0;
        const next = () => {
        if (i >= BOOT_LINES.length) { setBootDone(true); return; }
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
        if (!trimmed) { setError('CALLSIGN REQUIRED'); return; }
        if (trimmed.length < 2) { setError('TOO SHORT (MIN 2 CHARS)'); return; }
        if (trimmed.length > 28) { setError('TOO LONG (MAX 28 CHARS)'); return; }
        if (!/^[A-Za-z0-9_\-]+$/.test(trimmed)) {
        setError('ALPHANUMERIC + _ - ONLY');
        return;
        }

        const id = crypto.randomUUID();
        setUser({ id, username: trimmed.toUpperCase() });
        navigateTo('lobby');
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center p-6 animate-crt">
        {/* CRT terminal */}
        <div className="w-full max-w-lg bg-card border-2 border-border pixel-shadow-primary">
            {/* title bar */}
            <div className="flex items-center gap-2 px-4 py-2 bg-secondary border-b border-border">
            <span className="w-2.5 h-2.5 bg-destructive" />
            <span className="w-2.5 h-2.5 bg-pixel-yellow" />
            <span className="w-2.5 h-2.5 bg-primary" />
            <span className="font-pixel text-xs text-muted-foreground ml-2">TERMINAL — KATABI</span>
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
                        <span className="text-muted-foreground">{line.replace('OK', '')}</span>
                        <span className="text-primary text-glow-primary">OK</span>
                        </>
                    ) : line}
                    </span>
                )}
                </div>
            ))}

            {/* blinking cursor during boot */}
            {!bootDone && (
                <span className="text-primary animate-blink">█</span>
            )}
            </div>

            {/* input section — appears after boot */}
            {bootDone && (
            <div className="px-5 pb-5 flex flex-col gap-4 border-t border-border pt-4 animate-pop">
                <div className="font-mono-pixel text-base text-muted-foreground">
                ENTER YOUR CALLSIGN TO JOIN THE NETWORK:
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
                onKeyDown={e => e.key === 'Enter' && handleSubmit()}
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
            ★ KATABI — EPHEMERAL ROOMS — MULTI-USER — RETRO VIBES — ROOMS EXPIRE AFTER 1HR INACTIVITY ★ KATABI ★
            </div>
        </div>
        </div>
    );
}