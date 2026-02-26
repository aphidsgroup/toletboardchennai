'use client';

interface TeleportMeEmbedProps {
    tourUrl: string;
    propertyTitle?: string;
}

export default function TeleportMeEmbed({ tourUrl, propertyTitle }: TeleportMeEmbedProps) {
    return (
        <iframe
            src={tourUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
            allowFullScreen
            loading="lazy"
            title={`360° Virtual Tour${propertyTitle ? ` of ${propertyTitle}` : ''}`}
            style={{ border: 'none' }}
        />
    );
}
