import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Tenant Requirement Form | Tolet Board Chennai',
    description: 'Tell us your property requirements and find your dream home in Chennai with 360° virtual tours. Easy, verified, and transparent rental process.',
    openGraph: {
        title: 'Tenant Requirement Form | Tolet Board Chennai',
        description: 'Tell us your property requirements and find your dream home in Chennai.',
        type: 'website',
        images: [{ url: '/og-image.png' }]
    }
};

export default function TenantLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
