'use client';

interface TeleportMeEmbedProps {
    tourUrl: string;
}

export default function TeleportMeEmbed({ tourUrl }: TeleportMeEmbedProps) {
    // Simply use an iframe - TeleportMe URLs work directly in iframes
    return (
        <iframe
            src={tourUrl}
            className="absolute top-0 left-0 w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; fullscreen; xr-spatial-tracking"
            allowFullScreen
            loading="lazy"
            title="360° Virtual Tour"
            style={{ border: 'none' }}
        />
    );
}
