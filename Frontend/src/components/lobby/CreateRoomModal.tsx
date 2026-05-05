import { useState } from 'react';
import { PixelModal } from '../ui/Modal';
import { PixelInput } from '../ui/Input';
import { PixelButton } from '../ui/Button';
import { generateRoomName, generateKeyword } from '../../utils/nameGen';

interface CreateRoomModalProps {
    open: boolean;
    onClose: () => void;
    onCreate: (name: string, keyword: string) => void;
}

export function CreateRoomModal({ open, onClose, onCreate }: CreateRoomModalProps) {
    const [name, setName] = useState('');
    const [keyword, setKeyword] = useState('');
    const [errors, setErrors] = useState<{ name?: string; keyword?: string }>({});

    const handleRng = () => {
        setName(generateRoomName());
        setKeyword(generateKeyword());
        setErrors({});
    };

    const handleSubmit = () => {
        const errs: { name?: string; keyword?: string } = {};
        const trimName = name.trim();
        const trimKey = keyword.trim();

        if (!trimName) errs.name = 'ROOM NAME REQUIRED';
        else if (trimName.length < 2) errs.name = 'TOO SHORT (MIN 2 CHARS)';
        else if (trimName.length > 24) errs.name = 'TOO LONG (MAX 24 CHARS)';

        if (!trimKey) errs.keyword = 'KEYWORD REQUIRED';
        else if (trimKey.length < 2) errs.keyword = 'TOO SHORT (MIN 2 CHARS)';
        else if (trimKey.length > 32) errs.keyword = 'TOO LONG (MAX 32 CHARS)';
        else if (!/^[A-Za-z0-9_\-]+$/.test(trimKey)) errs.keyword = 'ALPHANUMERIC + _ - ONLY';

        if (Object.keys(errs).length) { setErrors(errs); return; }

        onCreate(trimName, trimKey);
        setName('');
        setKeyword('');
        setErrors({});
    };

    const handleClose = () => {
        setName('');
        setKeyword('');
        setErrors({});
        onClose();
    };

    return (
        <PixelModal open={open} onClose={handleClose} title="// CREATE ROOM">
        <div className="flex flex-col gap-5">
            {/* rng shortcut */}
            <div className="flex items-center justify-between border border-dashed border-border p-3 bg-secondary/30">
            <span className="font-pixel text-xs text-muted-foreground">RANDOMIZE ALL</span>
            <PixelButton variant="secondary" size="sm" onClick={handleRng}>
                ⚄ RNG
            </PixelButton>
            </div>

            <PixelInput
            label="ROOM NAME"
            placeholder="E.G. SECTOR-ALPHA"
            value={name}
            onChange={e => setName(e.target.value.toUpperCase())}
            error={errors.name}
            maxLength={24}
            autoFocus
            />

            <PixelInput
            label="KEYWORD"
            placeholder="E.G. NEON-CIPHER"
            value={keyword}
            onChange={e => setKeyword(e.target.value.toUpperCase())}
            error={errors.keyword}
            hint="SHARE THIS WITH PEOPLE YOU WANT TO INVITE"
            maxLength={32}
            />

            <div className="flex gap-3 pt-1">
            <PixelButton variant="ghost" fullWidth onClick={handleClose}>
                CANCEL
            </PixelButton>
            <PixelButton variant="accent" fullWidth onClick={handleSubmit}>
                ▶ CREATE
            </PixelButton>
            </div>
        </div>
        </PixelModal>
    );
}