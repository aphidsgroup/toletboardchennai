import { notFound } from 'next/navigation';
import { prisma } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { redirect } from 'next/navigation';
import PropertyForm from '@/components/admin/PropertyForm';

interface EditPropertyPageProps {
    params: Promise<{ id: string }>;
}

export default async function ManagerEditPropertyPage({ params }: EditPropertyPageProps) {
    const session = await getSession();
    if (!session.isLoggedIn || (session.role !== 'manager' && session.role !== 'admin')) {
        redirect('/login');
    }

    const { id } = await params;
    const property = await prisma.property.findUnique({ where: { id } });

    if (!property) {
        notFound();
    }

    return (
        <main className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex items-center gap-4 mb-6">
                    <a href="/manager" className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                        </svg>
                    </a>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Edit Property
                    </h1>
                </div>
                <PropertyForm
                    property={property}
                    mode="edit"
                    apiBasePath="/api/manager/properties"
                    redirectPath="/manager"
                />
            </div>
        </main>
    );
}
