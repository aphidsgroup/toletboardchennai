'use client';

import { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface ShortlistContextType {
    shortlistedIds: Set<string>;
    toggleShortlist: (propertyId: string) => Promise<void>;
    isLoaded: boolean;
}

const ShortlistContext = createContext<ShortlistContextType>({
    shortlistedIds: new Set(),
    toggleShortlist: async () => { },
    isLoaded: false,
});

export function useShortlist() {
    return useContext(ShortlistContext);
}

export function ShortlistProvider({ children }: { children: React.ReactNode }) {
    const [shortlistedIds, setShortlistedIds] = useState<Set<string>>(new Set());
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        fetchShortlists();
    }, []);

    const fetchShortlists = async () => {
        try {
            const res = await fetch('/api/user/shortlist');
            const data = await res.json();
            if (data.shortlists && Array.isArray(data.shortlists)) {
                const ids = new Set<string>(data.shortlists.map((s: any) => s.property?.id || s.propertyId));
                setShortlistedIds(ids);
            }
        } catch {
            // Not logged in or error — ignore
        } finally {
            setIsLoaded(true);
        }
    };

    const toggleShortlist = useCallback(async (propertyId: string) => {
        try {
            const res = await fetch('/api/user/shortlist', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ propertyId }),
            });
            const data = await res.json();
            if (data.error) return;

            setShortlistedIds(prev => {
                const next = new Set(prev);
                if (data.action === 'added') {
                    next.add(propertyId);
                } else {
                    next.delete(propertyId);
                }
                return next;
            });
        } catch {
            // ignore
        }
    }, []);

    return (
        <ShortlistContext.Provider value={{ shortlistedIds, toggleShortlist, isLoaded }}>
            {children}
        </ShortlistContext.Provider>
    );
}
