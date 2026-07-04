'use client';

import { useEffect, useState, createContext, useContext } from 'react';
import Echo from 'laravel-echo';
import Pusher from 'pusher-js';

// We need to make Pusher available globally for Laravel Echo
if (typeof window !== 'undefined') {
    (window as any).Pusher = Pusher;
}

const EchoContext = createContext<Echo | null>(null);

export const useEcho = () => useContext(EchoContext);

export default function EchoProvider({ children }: { children: React.ReactNode }) {
    const [echoInstance, setEchoInstance] = useState<Echo | null>(null);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (!token) return;

        const echo = new Echo({
            broadcaster: 'reverb',
            key: process.env.NEXT_PUBLIC_REVERB_APP_KEY,
            wsHost: process.env.NEXT_PUBLIC_REVERB_HOST,
            wsPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080,
            wssPort: process.env.NEXT_PUBLIC_REVERB_PORT ?? 8080,
            forceTLS: (process.env.NEXT_PUBLIC_REVERB_SCHEME ?? 'http') === 'https',
            enabledTransports: ['ws', 'wss'],
            authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/broadcasting/auth`,
            auth: {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json'
                }
            }
        });

        setEchoInstance(echo);

        return () => {
            echo.disconnect();
        };
    }, []);

    return (
        <EchoContext.Provider value={echoInstance}>
            {children}
        </EchoContext.Provider>
    );
}
