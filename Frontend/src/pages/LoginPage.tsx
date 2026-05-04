import { useState } from 'react';
import { useAppStore } from '../store/UseAppStore';
import { PixelButton } from '../components/Button';
import { PixelInput } from '../components/Input';

const DEMO_USERS = ['PixelHero', 'NeonCat', 'ByteWizard', 'GlitchGhost'];

export function LoginPage() {
    const login = useAppStore(s => s.login);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errors, setErrors] = useState<{ username?: string; password?: string }>({});
    const [loading, setLoading] = useState(false);

    const validate = () => {
        const errs: typeof errors = {};
        if (!username.trim()) errs.username = 'Username required';
        else if (username.length < 3) errs.username = 'Min 3 characters';
        else if (username.length > 20) errs.username = 'Max 20 characters';
        if (!password.trim()) errs.password = 'Password required';
        else if (password.length < 4) errs.password = 'Min 4 characters';
        return errs;
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const errs = validate();
        if (Object.keys(errs).length > 0) {
        setErrors(errs);
        return;
        }
        setLoading(true);
        // Simulate auth delay
        setTimeout(() => {
        login(username.trim());
        setLoading(false);
        }, 800);
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center px-4 animate-crt">
        {/* Marquee ticker */}
        <div className="fixed top-0 left-0 right-0 bg-primary/20 border-b border-primary py-1 overflow-hidden z-10">
            <div className="animate-marquee whitespace-nowrap font-pixel text-[7px] text-primary text-glow-primary">
            ★ PIXELCHAT v1.0 ★ REAL-TIME MESSAGING ★ CONNECT WITH FRIENDS ★ JOIN CHANNELS ★ STAY ONLINE ★ PIXEL POWER ★
            </div>
        </div>

        <div className="w-full max-w-sm flex flex-col gap-8 mt-8">
            {/* Logo */}
            <div className="text-center flex flex-col gap-3">
            <div className="flex justify-center gap-2 mb-2">
                {['█', '▓', '░', '▓', '█'].map((c, i) => (
                <span
                    key={i}
                    className="text-4xl text-glow"
                    style={{
                    color: ['var(--pixel-green)', 'var(--pixel-cyan)', 'var(--pixel-pink)', 'var(--pixel-yellow)', 'var(--pixel-purple)'][i],
                    animationDelay: `${i * 0.2}s`,
                    }}
                >
                    {c}
                </span>
                ))}
            </div>
            <h1 className="text-2xl text-primary text-glow-primary leading-tight">
                KATABI
            </h1>
            <p className="font-mono-pixel text-muted-foreground text-sm">
                ▶ REAL-TIME MESSAGING
            </p>
            </div>

            {/* Login Box */}
            <div className="bg-card pixel-border pixel-shadow p-6 flex flex-col gap-5 animate-pop">
            <div className="flex items-center gap-2 pb-2 border-b border-border">
                <span className="w-2 h-2 bg-primary animate-pulse-dot" />
                <span className="font-pixel text-[8px] text-primary">SIGN IN</span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <PixelInput
                label="Username"
                placeholder="enter your callsign..."
                value={username}
                onChange={e => { setUsername(e.target.value); setErrors(prev => ({ ...prev, username: undefined })); }}
                error={errors.username}
                autoComplete="off"
                maxLength={20}
                />
                <PixelInput
                label="Password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={e => { setPassword(e.target.value); setErrors(prev => ({ ...prev, password: undefined })); }}
                error={errors.password}
                maxLength={32}
                />
                <PixelButton
                type="submit"
                variant="primary"
                size="lg"
                className="w-full mt-2"
                disabled={loading}
                >
                {loading ? (
                    <span className="flex gap-1 items-center">
                    LOADING
                    <span className="animate-bounce-dot inline-block" style={{ animationDelay: '0s' }}>.</span>
                    <span className="animate-bounce-dot inline-block" style={{ animationDelay: '0.2s' }}>.</span>
                    <span className="animate-bounce-dot inline-block" style={{ animationDelay: '0.4s' }}>.</span>
                    </span>
                ) : (
                    '▶ ENTER'
                )}
                </PixelButton>
            </form>

            {/* Quick login demo */}
            <div className="flex flex-col gap-2 pt-2 border-t border-border">
                <span className="font-pixel text-[7px] text-muted-foreground">QUICK DEMO LOGIN:</span>
                <div className="flex flex-wrap gap-2">
                {DEMO_USERS.map(u => (
                    <button
                    key={u}
                    className="font-pixel text-[7px] text-accent border border-accent px-2 py-1 hover:bg-accent hover:text-accent-foreground transition-colors"
                    onClick={() => {
                        setUsername(u);
                        setPassword('demo1234');
                        setErrors({});
                    }}
                    >
                    {u}
                    </button>
                ))}
                </div>
            </div>
            </div>

            <p className="text-center font-mono-pixel text-muted-foreground text-xs">
            NEW USER? ANY PASSWORD WORKS
            <span className="animate-blink ml-1">_</span>
            </p>
        </div>

        {/* Version footer */}
        <div className="fixed bottom-2 right-3 font-pixel text-[6px] text-border">
            PIXELCHAT v1.0.0 © 2024
        </div>
        </div>
    );
}
