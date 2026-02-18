import PropertyForm from '@/components/admin/PropertyForm';

export default function NewPropertyPage() {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Add New Property
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                    Create a new property listing
                </p>
            </div>

            <PropertyForm mode="create" />
        </div>
    );
}
