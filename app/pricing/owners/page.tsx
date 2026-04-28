import type { Metadata } from 'next';
import OwnersContent from './OwnersContent';

export const metadata: Metadata = {
    title: 'Property Marketing Packages for Owners',
    description: 'Explore ToLetBoardChennai packages for property owners — from free exclusive listings to premium spotlight campaigns with 360° shoots and paid ads.',
};

export default function OwnersPage() {
    return <OwnersContent />;
}
