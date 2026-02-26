'use client';

import { useState } from 'react';

interface TeleportMeEmbedProps {
    tourUrl: string;
    propertyTitle?: string;
}

export default function TeleportMeEmbed({ tourUrl, propertyTitle }: TeleportMeEmbedProps) {
    const [loaded, setLoaded] = useState(false);

    if (!loaded) {
        return (
            <button
                onClick={() => setLoaded(true)}
                className="absolute inset-0 w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex flex-col items-center justify-center cursor-pointer group transition-all"
                aria-label={`Load 360° virtual tour${propertyTitle ? ` of ${propertyTitle}` : ''}`}
            >
                {/* Play icon */}
                <div className="w-20 h-20 bg-white/15 backdrop-blur-sm rounded-full flex items-center justify-center mb-4 group-hover:bg-white/25 group-hover:scale-110 transition-all duration-300 shadow-2xl">
                    <svg className="w-9 h-9 text-white ml-1" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M8 5v14l11-7z" />
                    </svg>
                </div>
                <span className="text-white text-lg font-semibold mb-1">360° Virtual Tour</span>
                <span className="text-white/60 text-sm">Tap to explore this property</span>

                {/* Decorative 360 icon */}
                <div className="absolute top-4 left-4 flex items-center gap-2 bg-black/40 backdrop-blur-sm px-3 py-1.5 rounded-full">
                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9" />
                    </svg>
                    <span className="text-white text-xs font-medium">360°</span>
                </div>
            </button>
        );
    }

    return (
        <iframe
            src={tourUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
            allowFullScreen
            title={`360° Virtual Tour${propertyTitle ? ` of ${propertyTitle}` : ''}`}
            style={{ border: 'none' }}
        />
    );
}
