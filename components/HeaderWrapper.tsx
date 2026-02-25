'use client';

import { usePathname } from 'next/navigation';
import Header from '@/components/Header';

export default function HeaderWrapper() {
    const pathname = usePathname();

    // Hide header on admin pages (they have their own layout)
    if (pathname.startsWith('/admin')) return null;

    return <Header />;
}
