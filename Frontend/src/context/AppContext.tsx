import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Page } from '../types';

interface AppContextType {
    user: User | null;
    setUser: (user: User) => void;
    currentPage: Page;
    navigateTo: (page: Page) => void;
    currentRoomId: string | null;
    enterRoom: (roomId: string) => void;
    leaveRoom: () => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
    const [user, setUserState] = useState<User | null>(null);
    const [currentPage, setCurrentPage] = useState<Page>('landing');
    const [currentRoomId, setCurrentRoomId] = useState<string | null>(null);

    // restore session on mount
    useEffect(() => {
        const stored = sessionStorage.getItem('pixelchat_user');
        if (stored) {
        try {
            const u: User = JSON.parse(stored);
            setUserState(u);
            setCurrentPage('lobby');
        } catch { /* ignore */ }
        }
    }, []);

    const setUser = (user: User) => {
        setUserState(user);
        sessionStorage.setItem('pixelchat_user', JSON.stringify(user));
        sessionStorage.setItem('pixelchat_username', user.username);
    };

    const navigateTo = (page: Page) => {
        setCurrentPage(page);
    };

    const enterRoom = (roomId: string) => {
        setCurrentRoomId(roomId);
        setCurrentPage('chat');
    };

    const leaveRoom = () => {
        setCurrentRoomId(null);
        setCurrentPage('lobby');
    };

    return (
        <AppContext.Provider value={{
        user,
        setUser,
        currentPage,
        navigateTo,
        currentRoomId,
        enterRoom,
        leaveRoom,
        }}>
        {children}
        </AppContext.Provider>
    );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useApp() {
    const ctx = useContext(AppContext);
    if (!ctx) throw new Error('useApp must be used inside AppProvider');
    return ctx;
}