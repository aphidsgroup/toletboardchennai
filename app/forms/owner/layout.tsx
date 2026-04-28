import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Property Onboarding - Owner Form | Tolet Board Chennai',
    description: 'Register your property for 360° Virtual Tours and professional rental management. Fast, verified, and premium service for property owners in Chennai.',
    openGraph: {
        title: 'Property Onboarding - Owner Form | Tolet Board Chennai',
        description: 'Register your property for 360° Virtual Tours and professional rental management.',
        type: 'website',
        images: [{ url: '/og-image.png' }]
    }
};

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
